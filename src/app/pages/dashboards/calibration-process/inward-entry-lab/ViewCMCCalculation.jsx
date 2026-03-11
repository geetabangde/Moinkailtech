import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "utils/axios";
import { toast } from "sonner";
import { Button } from "components/ui";

// =============================================================================
// ViewCMCCalculation
// API: POST /observationsetting/calculateuncertinty { inwardid, instid }
//
// ⚠️  API response is DYNAMIC — changes based on instrument type:
//
// Type A — AC Voltage (instid: 52425):
//   obs keys  : uuc1, uuc2, uuc3, uuc4, uuc5   (pattern: uuc\d+)
//   other keys: unittype, mode, unit, master, average, std, typea,
//               accu, muncertinity, leastcount, combined, dof2, k,
//               expandedmu, expendeduncertinity, minfreq, maxfreq,
//               mincmc, maxcmc, cmscope, cmctaken, showaccuracy
//   headings  : 27 items (obs = observation1-5)
//
// Type B — Dimension (instid: 52434):
//   obs keys  : master1..master8              (pattern: master\d+)
//   other keys: unittype, Unit, UUC, average, std, thermalcoemaster,
//               thermalcoeuuc, UncTempdevice, uncthermcoe, uncdifference,
//               typea, uncmaster, leastcount, combined
//   headings  : 22 items (obs = observation1-8)
//
// DYNAMIC MAPPING STRATEGY:
//   1. fieldKeys = Object.keys(uncertainty_calculations)  [preserves insertion order]
//   2. obsFieldKeys = fieldKeys matching /^(uuc|master)\d+$/  → sorted numerically
//   3. obsHeadingIndices = heading indices matching /^observation\d+$/i
//   4. obsHeadingIndices[i] → obsFieldKeys[i]   (1-to-1 by position)
//   5. non-obs headings → remaining fieldKeys sequentially (skipping obs keys)
// =============================================================================

export default function ViewCMCCalculation() {
  const { id: inwardId, itemId: instId } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const caliblocation = searchParams.get("caliblocation") || "Lab";
  const calibacc = searchParams.get("calibacc") || "Nabl";

  const [data, setData] = useState([]);
  const [headings, setHeadings] = useState([]);
  const [fieldKeys, setFieldKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Format cell value ─────────────────────────────────────────────────────
  const formatValue = (value, key) => {
    if (value === null || value === undefined) return "-";
    if (key === "dof" && (value === 0 || value === "0")) return "0";
    if (typeof value !== "number") return String(value);
    return value.toString();
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(
          "/observationsetting/calculateuncertinty",
          {
            instid: instId,
            inwardid: inwardId,
          },
        );

        if (res.data?.status === true) {
          let apiHeadings = res.data.data?.heading || [];
          const calibrationPoints = res.data.data?.calibration_points || [];

          if (calibrationPoints.length > 0) {
            const keys = Object.keys(
              calibrationPoints[0].uncertainty_calculations || {},
            );
            setFieldKeys(keys);

            // Legacy DOF auto-insert fix
            if (apiHeadings.length === keys.length - 1) {
              apiHeadings.splice(12, 0, "DOF");
            }
          }

          setHeadings(apiHeadings);
          setData(
            calibrationPoints.map((pt, i) => ({
              srNo: i + 1,
              id: pt.id,
              uncertaintyCalculations: pt.uncertainty_calculations || {},
            })),
          );
        } else {
          toast.error("No data found");
        }
      } catch (err) {
        toast.error("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [inwardId, instId]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goToCalibration = () =>
    navigate(
      `/dashboards/calibration-process/inward-entry-lab/perform-calibration/${inwardId}?caliblocation=${caliblocation}&calibacc=${calibacc}`,
    );
  const goToInwardList = () =>
    navigate(
      `/dashboards/calibration-process/inward-entry-lab?caliblocation=${caliblocation}&calibacc=${calibacc}`,
    );
  const handlePrint = () => setTimeout(() => window.print(), 1000);

  // ── Build heading → fieldKey map (FULLY DYNAMIC) ──────────────────────────
  //
  // Returns: { headingIndex: fieldKeyName }
  //
  // Step 1: Find obs field keys (uuc1-N or master1-N) from fieldKeys
  //         Pattern: /^(uuc|master)\d+$/  → sort by number
  //
  // Step 2: Find obs heading indices from headings
  //         Pattern: /^observation\d+$/i  → sort by number
  //
  // Step 3: Map obs heading idx[i] → obs field key[i]
  //
  // Step 4: Map remaining (non-obs) headings → remaining (non-obs) fieldKeys
  //         sequentially in insertion order
  const buildHeadingKeyMap = () => {
    if (!headings.length || !fieldKeys.length) return {};

    // ── Step 1: obs field keys ───────────────────────────────────────────
    const obsKeyPattern = /^(uuc|master)(\d+)$/;
    const obsFieldKeys = fieldKeys
      .filter((k) => obsKeyPattern.test(k))
      .sort((a, b) => {
        const numA = parseInt(a.match(obsKeyPattern)[2]);
        const numB = parseInt(b.match(obsKeyPattern)[2]);
        return numA - numB;
      });

    // ── Step 2: obs heading indices ──────────────────────────────────────
    const obsHeadPattern = /^observation(\d+)$/i;
    const obsHeadingIdxs = headings
      .map((h, i) => ({ h, i }))
      .filter(({ h }) => obsHeadPattern.test(h))
      .sort((a, b) => {
        const numA = parseInt(a.h.match(obsHeadPattern)[1]);
        const numB = parseInt(b.h.match(obsHeadPattern)[1]);
        return numA - numB;
      })
      .map(({ i }) => i);

    // ── Step 3: obs mapping ──────────────────────────────────────────────
    const map = {};
    obsHeadingIdxs.forEach((hIdx, pos) => {
      if (obsFieldKeys[pos]) {
        map[hIdx] = obsFieldKeys[pos];
      }
    });

    // ── Step 4: non-obs mapping ──────────────────────────────────────────
    // remaining fieldKeys = fieldKeys minus obsFieldKeys (preserving order)
    const obsFieldKeySet = new Set(obsFieldKeys);
    const nonObsFieldKeys = fieldKeys.filter((k) => !obsFieldKeySet.has(k));
    const obsHeadingIdxSet = new Set(obsHeadingIdxs);
    const nonObsHeadingIdxs = headings
      .map((_, i) => i)
      .filter((i) => !obsHeadingIdxSet.has(i));

    nonObsHeadingIdxs.forEach((hIdx, pos) => {
      if (nonObsFieldKeys[pos]) {
        map[hIdx] = nonObsFieldKeys[pos];
      }
    });

    return map;
  };

  // ── Render table ──────────────────────────────────────────────────────────
  const renderTable = () => {
    if (!headings.length || !data.length) {
      return (
        <p className="py-8 text-center text-sm text-gray-400">
          No data available.
        </p>
      );
    }

    // ── Detect observation columns ────────────────────────────────────────
    const obsHeadPattern = /^observation\d+$/i;
    const observationIndices = [];
    let firstObsIdx = -1;

    headings.forEach((h, i) => {
      if (obsHeadPattern.test(h)) {
        if (firstObsIdx === -1) firstObsIdx = i;
        observationIndices.push(i);
      }
    });

    const hasObsCols = observationIndices.length > 0;
    const obsCount = observationIndices.length;

    // ── Build dynamic heading → key map ───────────────────────────────────
    const headingKeyMap = buildHeadingKeyMap();

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-[12px] text-gray-700 dark:text-gray-300">
          {/* ── Header ──────────────────────────────────────────────────── */}
          <thead>
            {/* Row 1 */}
            <tr className="bg-gray-200 text-center text-xs font-medium dark:bg-gray-700">
              {/* SR No */}
              <th
                rowSpan={hasObsCols ? 2 : 1}
                className="border border-gray-300 px-2 py-2 dark:border-gray-600"
              >
                Sr No
              </th>

              {headings.map((heading, idx) => {
                // Skip obs cols after first (merged)
                if (
                  hasObsCols &&
                  idx > firstObsIdx &&
                  observationIndices.includes(idx)
                ) {
                  return null;
                }

                // First obs col → merged "Observation on UUC"
                if (hasObsCols && idx === firstObsIdx) {
                  return (
                    <th
                      key={`h-${idx}`}
                      colSpan={obsCount}
                      className="border border-gray-300 px-2 py-2 capitalize dark:border-gray-600"
                    >
                      Observation on UUC
                    </th>
                  );
                }

                // Regular col → rowSpan 2
                return (
                  <th
                    key={`h-${idx}`}
                    rowSpan={hasObsCols ? 2 : 1}
                    className="border border-gray-300 px-2 py-2 capitalize dark:border-gray-600"
                    title={heading} // tooltip for long headings
                  >
                    {/* Truncate very long headings */}
                    <span className="block max-w-[120px] truncate">
                      {heading}
                    </span>
                  </th>
                );
              })}
            </tr>

            {/* Row 2 — obs sub-headers */}
            {hasObsCols && (
              <tr className="bg-gray-200 text-center text-xs font-medium dark:bg-gray-700">
                {observationIndices.map((_, obsIdx) => (
                  <th
                    key={`obs-sub-${obsIdx}`}
                    className="border border-gray-300 px-2 py-1 dark:border-gray-600"
                  >
                    Obs {obsIdx + 1}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          {/* ── Body ──────────────────────────────────────────────────────── */}
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="text-center hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {/* SR No cell */}
                <td className="border border-gray-300 px-2 py-2 dark:border-gray-600">
                  {row.srNo}
                </td>

                {headings.map((_, colIdx) => {
                  // Skip merged obs cols after first
                  if (
                    hasObsCols &&
                    colIdx > firstObsIdx &&
                    observationIndices.includes(colIdx)
                  ) {
                    return null;
                  }

                  // First obs col → render all obs cells side by side
                  if (hasObsCols && colIdx === firstObsIdx) {
                    return observationIndices.map((_, obsIdx) => {
                      // ✅ DYNAMIC: headingKeyMap[observationIndices[obsIdx]] gives
                      //    "uuc1"..."uuc5" (AC Voltage) OR "master1"..."master8" (Dimension)
                      const obsKey = headingKeyMap[observationIndices[obsIdx]];
                      const value = obsKey
                        ? row.uncertaintyCalculations[obsKey]
                        : null;
                      return (
                        <td
                          key={`${rowIdx}-obs-${obsIdx}`}
                          className="border border-gray-300 px-2 py-2 dark:border-gray-600"
                        >
                          {formatValue(value, obsKey)}
                        </td>
                      );
                    });
                  }

                  // Regular col
                  const fieldKey = headingKeyMap[colIdx];
                  const value = fieldKey
                    ? row.uncertaintyCalculations[fieldKey]
                    : null;
                  return (
                    <td
                      key={`${rowIdx}-${colIdx}`}
                      className="border border-gray-300 px-2 py-2 dark:border-gray-600"
                    >
                      {formatValue(value, fieldKey)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-2 text-gray-600">
        <svg className="h-6 w-6 animate-spin text-blue-600" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
          />
        </svg>
        Loading Uncertainty Calculation...
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between rounded-lg border-b bg-white p-4 shadow-sm dark:bg-gray-800">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Uncertainty Calculation
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={goToInwardList}
            className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
          >
            &lt;&lt; Back to Inward Entry List
          </Button>
          <Button
            onClick={goToCalibration}
            className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
          >
            &lt;&lt; Back to Perform Calibration
          </Button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
        {renderTable()}
      </div>

      {/* ── Download CRF ───────────────────────────────────────────────────── */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handlePrint}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Download CRF
        </button>
      </div>
    </div>
  );
}
