// Import Dependencies
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "utils/axios";
import { toast } from "sonner";

// Local Imports
import { Page } from "components/shared/Page";
import { Card } from "components/ui";

// =============================================================================
// ViewRawData Page
// PHP: viewrawdatasingle.php?hakuna={teid}
// Route: /dashboards/action-items/view-raw-data/:teid
//
// PHP Logic:
//   1. Load testeventdata row by $teid
//   2. Load parameter info → cycle, parameterelements
//   3. For each cycle row × parameterelements:
//      → SELECT value FROM testdata WHERE testevent=$teid AND measurement=$pid AND cycle=$i
//   4. Show attachment link (fetchattachment)
//
// API: GET /actionitem/view-test-rawdata?testeventdata_id={teid}
// =============================================================================

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
    </svg>
  );
}

export default function ViewRawData() {
  const { teid }  = useParams();
  const navigate  = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // API: GET /actionitem/view-test-rawdata?testeventdata_id={teid}
        const res = await axios.get("/actionitem/view-test-rawdata", {
          params: { testeventdata_id: teid },
        });
        setData(res.data?.data ?? res.data ?? null);
      } catch (err) {
        console.error("Error loading raw data:", err);
        toast.error("Failed to load raw data.");
      } finally {
        setLoading(false);
      }
    };
    if (teid) load();
  }, [teid]);

  if (loading) {
    return (
      <Page title="View Raw Data">
        <div className="flex h-[60vh] items-center justify-center gap-3 text-gray-500">
          <Spinner /> Loading...
        </div>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page title="View Raw Data">
        <div className="flex h-[60vh] items-center justify-center text-gray-400">
          Nothing Here
        </div>
      </Page>
    );
  }

  // PHP: parameterelements → column headers
  const paramElements = data.parameter_elements ?? [];
  // PHP: for ($i=0; $i<$cycle; $i++) rows
  const cycle         = Number(data.cycle ?? paramElements[0]?.cycle ?? 1);
  // PHP: testdata rows { cycle_idx: { element_id: { value, unit } } }
  const testValues    = data.test_values ?? data.measurements ?? {};
  const attachment    = data.attachment_url ?? data.attachment ?? null;
  // const trfproduct    = data.trfproduct ?? data.tid ?? "";

  return (
    <Page title="View Raw Data">
      <div className="transition-content w-full pb-10 px-(--margin-x)">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
            View Raw Data
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          >
            ← Back
          </button>
        </div>

        <Card className="p-6">
          {/* ── Parameter name ─────────────────────────────────────────────── */}
          {data.parameter_name && (
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-dark-100">
              Environment Fields — {data.parameter_name}
            </h3>
          )}

          {/* ── Measurements table ──────────────────────────────────────────── */}
          {/* PHP: column headers from parameterelements; rows from testdata */}
          {paramElements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    {paramElements.map((el) => (
                      <th
                        key={el.element_id ?? el.id}
                        className="px-3 py-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300"
                      >
                        {el.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* PHP: for ($i=0; $i<$cycle; $i++) */}
                  {Array.from({ length: cycle }, (_, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      {paramElements.map((el) => {
                        const eid = el.element_id ?? el.id;
                        // PHP: SELECT value FROM testdata WHERE testevent=$teid AND measurement=$pid AND cycle=$i
                        const val  = testValues?.[i]?.[eid]?.value ?? testValues?.[i]?.[eid] ?? "—";
                        const unit = el.unit ?? testValues?.[i]?.[eid]?.unit ?? "";
                        return (
                          <td key={eid} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {val} {unit}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Fallback: if API returns flat data array
            Array.isArray(data.rows) && data.rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      {Object.keys(data.rows[0]).map((k) => (
                        <th key={k} className="px-3 py-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {String(v ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No measurement data found.</p>
            )
          )}

          {/* ── Attachment link — PHP: fetchattachment($row['attachment']) ──── */}
          {attachment && (
            <div className="mt-4">
              <a
                href={attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                View Attachment
              </a>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}