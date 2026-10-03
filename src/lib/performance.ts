export function measurePagePerformance() {
  if (typeof window === "undefined") {
    return;
  }

  // -----------------------------------------
  // LCP
  // -----------------------------------------

  const lcpObserver = new PerformanceObserver(
    (list) => {
      const entries = list.getEntries();

      const lastEntry =
        entries[entries.length - 1];

      if (lastEntry) {
        console.log(
          `[A2.3] LCP: ${lastEntry.startTime.toFixed(
            2
          )} ms`
        );
      }
    }
  );

  try {
    lcpObserver.observe({
      type: "largest-contentful-paint",
      buffered: true,
    });
  } catch {
    console.warn(
      "[A2.3] LCP measurement is not supported."
    );
  }

  // -----------------------------------------
  // CLS
  // -----------------------------------------

  let cumulativeLayoutShift = 0;

  const clsObserver = new PerformanceObserver(
    (list) => {
      for (const entry of list.getEntries()) {
        const layoutShift =
          entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };

        if (!layoutShift.hadRecentInput) {
          cumulativeLayoutShift +=
            layoutShift.value ?? 0;
        }
      }

      console.log(
        `[A2.3] CLS: ${cumulativeLayoutShift.toFixed(
          4
        )}`
      );
    }
  );

  try {
    clsObserver.observe({
      type: "layout-shift",
      buffered: true,
    });
  } catch {
    console.warn(
      "[A2.3] CLS measurement is not supported."
    );
  }
}