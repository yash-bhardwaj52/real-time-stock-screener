import type {
  FieldComparison,
  FilterConfig,
  FilterValue,
  Stock,
} from "@/types/stock";

type StockPredicate = (stock: Stock) => boolean;

export interface FilterGroup {
  logic: "AND" | "OR";
  filters: FilterConfig[];
}

export interface FilterResult {
  stocks: Stock[];
  executionTimeMs: number;
}

function getFieldValue(
  stock: Stock,
  field: keyof Stock,
): unknown {
  return stock[field];
}

function toArray(
  value: FilterValue,
): Array<string | number | boolean> {
  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

function createPredicate(
  filter: FilterConfig,
): StockPredicate {
  const { field, operator, value } = filter;

  return (stock: Stock): boolean => {
    const fieldValue = getFieldValue(
      stock,
      field,
    );

    if (
      fieldValue === null ||
      fieldValue === undefined
    ) {
      return operator === "neq";
    }

    switch (operator) {
      case "eq":
        return fieldValue === value;

      case "neq":
        return fieldValue !== value;

      case "gt":
        return (
          typeof fieldValue === "number" &&
          typeof value === "number" &&
          fieldValue > value
        );

      case "gte":
        return (
          typeof fieldValue === "number" &&
          typeof value === "number" &&
          fieldValue >= value
        );

      case "lt":
        return (
          typeof fieldValue === "number" &&
          typeof value === "number" &&
          fieldValue < value
        );

      case "lte":
        return (
          typeof fieldValue === "number" &&
          typeof value === "number" &&
          fieldValue <= value
        );

      case "between": {
        if (
          typeof fieldValue !== "number" ||
          !Array.isArray(value) ||
          value.length < 2 ||
          typeof value[0] !== "number" ||
          typeof value[1] !== "number"
        ) {
          return false;
        }

        const [min, max] = value;

        return (
          fieldValue >= min &&
          fieldValue <= max
        );
      }

      case "in": {
        const values = toArray(value);

        if (Array.isArray(fieldValue)) {
          return fieldValue.some((item) =>
            values.includes(item),
          );
        }

        return values.includes(
          fieldValue as
            | string
            | number
            | boolean,
        );
      }

      case "notIn": {
        const values = toArray(value);

        if (Array.isArray(fieldValue)) {
          return !fieldValue.some((item) =>
            values.includes(item),
          );
        }

        return !values.includes(
          fieldValue as
            | string
            | number
            | boolean,
        );
      }

      case "contains": {
        if (
          typeof fieldValue === "string"
        ) {
          return (
            typeof value === "string" &&
            fieldValue
              .toLowerCase()
              .includes(
                value.toLowerCase(),
              )
          );
        }

        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(
            value as never,
          );
        }

        return false;
      }

      case "startsWith":
        return (
          typeof fieldValue === "string" &&
          typeof value === "string" &&
          fieldValue
            .toLowerCase()
            .startsWith(
              value.toLowerCase(),
            )
        );

      default:
        return false;
    }
  };
}

/*
 * Field-to-field comparison.
 *
 * Example:
 * lastPrice > sma50
 * lastPrice > sma200
 */
function createComparisonPredicate(
  comparison: FieldComparison,
): StockPredicate {
  const {
    leftField,
    operator,
    rightField,
  } = comparison;

  return (stock: Stock): boolean => {
    const leftValue = getFieldValue(
      stock,
      leftField,
    );

    const rightValue = getFieldValue(
      stock,
      rightField,
    );

    if (
      typeof leftValue !== "number" ||
      typeof rightValue !== "number"
    ) {
      return false;
    }

    switch (operator) {
      case "gt":
        return leftValue > rightValue;

      case "gte":
        return leftValue >= rightValue;

      case "lt":
        return leftValue < rightValue;

      case "lte":
        return leftValue <= rightValue;

      case "eq":
        return leftValue === rightValue;

      case "neq":
        return leftValue !== rightValue;

      default:
        return false;
    }
  };
}

function getSelectivityScore(
  filter: FilterConfig,
): number {
  switch (filter.operator) {
    case "eq":
      return 100;

    case "in":
      return 90;

    case "between":
      return 80;

    case "gt":
    case "gte":
    case "lt":
    case "lte":
      return 70;

    case "startsWith":
      return 60;

    case "contains":
      return 50;

    case "neq":
    case "notIn":
      return 30;

    default:
      return 10;
  }
}

function orderFilters(
  filters: FilterConfig[],
): FilterConfig[] {
  return [...filters]
    .filter(
      (filter) => filter.enabled,
    )
    .sort(
      (a, b) =>
        getSelectivityScore(b) -
        getSelectivityScore(a),
    );
}

function applyAndFilters(
  stocks: Stock[],
  filters: FilterConfig[],
): Stock[] {
  if (filters.length === 0) {
    return stocks;
  }

  const orderedFilters =
    orderFilters(filters);

  const predicates =
    orderedFilters.map(
      createPredicate,
    );

  return stocks.filter((stock) =>
    predicates.every(
      (predicate) =>
        predicate(stock),
    ),
  );
}

function applyOrFilters(
  stocks: Stock[],
  filters: FilterConfig[],
): Stock[] {
  if (filters.length === 0) {
    return [];
  }

  const orderedFilters =
    orderFilters(filters);

  const predicates =
    orderedFilters.map(
      createPredicate,
    );

  return stocks.filter((stock) =>
    predicates.some(
      (predicate) =>
        predicate(stock),
    ),
  );
}

function applyFieldComparisons(
  stocks: Stock[],
  comparisons: FieldComparison[],
): Stock[] {
  if (comparisons.length === 0) {
    return stocks;
  }

  const predicates =
    comparisons.map(
      createComparisonPredicate,
    );

  return stocks.filter((stock) =>
    predicates.every(
      (predicate) =>
        predicate(stock),
    ),
  );
}

export function filterStocks(
  stocks: Stock[],
  filters: FilterConfig[] = [],
  groups: FilterGroup[] = [],
  comparisons: FieldComparison[] = [],
): FilterResult {
  const startTime =
    performance.now();

  let result =
    applyAndFilters(
      stocks,
      filters,
    );

  result =
    applyFieldComparisons(
      result,
      comparisons,
    );

  for (const group of groups) {
    if (
      group.logic === "AND"
    ) {
      result =
        applyAndFilters(
          result,
          group.filters,
        );
    } else {
      result =
        applyOrFilters(
          result,
          group.filters,
        );
    }
  }

  const executionTimeMs =
    performance.now() -
    startTime;

  console.log(
    `[FilterEngine] ` +
      `${filters.length} filters | ` +
      `${comparisons.length} comparisons | ` +
      `${stocks.length} → ` +
      `${result.length} stocks | ` +
      `${executionTimeMs.toFixed(2)}ms`,
  );

  return {
    stocks: result,
    executionTimeMs,
  };
}

export function createFilterPredicate(
  filter: FilterConfig,
): StockPredicate {
  return createPredicate(filter);
}

export function createStockComparisonPredicate(
  comparison: FieldComparison,
): StockPredicate {
  return createComparisonPredicate(
    comparison,
  );
}