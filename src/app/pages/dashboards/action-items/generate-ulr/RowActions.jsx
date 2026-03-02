// RowActions.jsx  — ULR Requests list
// PHP: ulrrequests.php action column
//
// PHP logic:
//   $trfstatus == 9 && $nabl == 1  → "Generate ULR"   → ulrrequest.php?hakuna=tid&what=hid
//   $trfstatus == 9 && $nabl != 1  → "Complete Report" → ulrrequest.php?hakuna=tid&what=hid
//   Always (status==9)             → "View Report"     → testreport.php?hakuna=tid
//   else                           → "Pending TRF Approval"
//
// API response fields (from /actionitem/get-ulr-request):
//   row.id           → $tid  (trfProducts.id)
//   row.hid          → hodrequests.id
//   row.trfstatus    → $trfstatus (hodrequests.status) — PHP: $trfstatus == 9
//   row.nabl         → testprices.nabl (1=NABL)
//                      NOTE: nabl may come as number or string "1"

import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const btnCls = {
  primary: "rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-blue-700 active:scale-95",
  info:    "rounded bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-cyan-600 active:scale-95",
  muted:   "rounded bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

export function RowActions({ row }) {
  const navigate = useNavigate();

  const tid = row.original.id;
  const hid = row.original.hid;

  // PHP: $trfstatus = $obj->selectfieldwhere("hodrequests", "status", "id=$hid")
  // API field is "trfstatus" — also fallback to "status" for safety
  const trfstatus = Number(row.original.trfstatus ?? row.original.status ?? 0);

  // PHP: $nabl = $obj->selectfieldwhere("testprices", "nabl", "id='$package'")
  // API may return number or string
  const nabl = Number(row.original.nabl ?? 0);

  // PHP: if ($trfstatus == 9)
  if (trfstatus === 9) {
    return (
      <div className="flex flex-col gap-1.5">
        {/* PHP: if ($nabl == 1) → "Generate ULR" else → "Complete Report" */}
        <button
          onClick={() => navigate(`/dashboards/action-items/generate-ulr/${tid}?hid=${hid}`)}
          className={btnCls.primary}
        >
          {nabl === 1 ? "Generate ULR" : "Complete Report"}
        </button>

        {/* PHP: echo '<a href="testreport.php?hakuna=' . $tid . '">View Report</a>' */}
        <button
          onClick={() => navigate(`/dashboards/action-items/GenerateUlrDetail/${tid}?hid=${hid}`)}
          className={btnCls.info}
        >
          View Report
        </button>
      </div>
    );
  }

  // PHP: else → "Pending TRF Approval"
  return <span className={btnCls.muted}>Pending TRF Approval</span>;
}

RowActions.propTypes = {
  row:   PropTypes.object,
  table: PropTypes.object,
};