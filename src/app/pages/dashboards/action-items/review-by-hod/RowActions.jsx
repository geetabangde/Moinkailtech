// RowActions.jsx
// PHP equivalent: hodreportsdata.php action buttons
//
// PHP logic:
//   $trfstatus == 3  → "Allot Quantity"       → allottrfitem.php?hakuna=tid
//   $trfstatus == 4  → "Assign Chemist"       → assignchemist.php?hakuna=tid
//   $trfstatus == 5  → "Perform Test"          → performtest.php?hakuna=tid
//              OR     "Upload Report"          → uploadreport.php?hakuna=tid  (packtype==0)
//   $trfstatus == 6  → "View Draft Report"    → testreport.php?hakuna=tid
//   $trfstatus == 7  → "Review By HOD"        → testreport.php?hakuna=tid&what=hid
//   $trfstatus == 8  → "Review By QA"         → testreport.php?hakuna=tid
//   $trfstatus == 9  → "Generate Final Report"→ testreport.php?hakuna=tid
//   else             → "Pending TRF Approval"

import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// ── Button style map ─────────────────────────────────────────────────────
const btnCls = {
  primary: "rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-blue-700 active:scale-95",
  info:    "rounded bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-cyan-600 active:scale-95",
  warning: "rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-amber-600 active:scale-95",
  success: "rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-green-700 active:scale-95",
  muted:   "rounded bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

export function RowActions({ row }) {
  const navigate = useNavigate();

  // PHP fields from hodreportsdata.php
  const tid        = row.original.id;
  const hid        = row.original.hodid;        // ✅ hodid
  const hodStatus  = row.original.hodstatus;    // ✅ hodstatus (not hod_status)
  const packtype   = row.original.packagetype;  // ✅ packagetype (not package_type)

  // Navigate helper
  const go = (path) => navigate(path);

  /*
   * PHP:
   *   if ($trfstatus == 3)  → Allot Quantity + Remove Item
   *   if ($trfstatus == 4)  → Assign Chemist
   *   if ($trfstatus == 5)  → Upload Report (packtype=0) OR Perform Test
   *   if ($trfstatus == 6)  → View Draft Report
   *   if ($trfstatus == 7)  → Review By HOD (with what=hid)
   *   if ($trfstatus == 8)  → Review By QA
   *   if ($trfstatus == 9)  → Generate Final Report
   *   else                  → Pending TRF Approval
   */
  switch (hodStatus) {
    case 3:
      return (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => go(`/dashboards/action-items/allot-quantity/${tid}`)}
            className={btnCls.primary}
          >
            Allot Quantity
          </button>
          <button
            onClick={() => go(`/dashboards/action-items/delete-trf-item/${tid}`)}
            className={btnCls.info}
          >
            Remove Item
          </button>
        </div>
      );

    case 4:
      return (
        <button
          onClick={() => go(`/dashboards/action-items/assign-chemist/${tid}`)}
          className={btnCls.primary}
        >
          Assign Chemist
        </button>
      );

    case 5:
      return packtype === 0 ? (
        <button
          onClick={() => go(`/dashboards/action-items/upload-report/${tid}`)}
          className={btnCls.primary}
        >
          Upload Report
        </button>
      ) : (
        <button
          onClick={() => go(`/dashboards/action-items/perform-test/${tid}`)}
          className={btnCls.primary}
        >
          Perform Test
        </button>
      );

    case 6:
      // PHP: testreport.php?hakuna=tid  (View Draft Report)
      return (
        <button
          onClick={() => go(`/dashboards/action-items/review-by-hod/${tid}`)}
          className={btnCls.primary}
        >
          View Draft Report
        </button>
      );

    case 7:
      // PHP: testreport.php?hakuna=tid&what=hid  (Review By HOD)
      return (
        <button
          onClick={() =>
            go(
              hid
                ? `/dashboards/action-items/review-by-hod/${tid}?hid=${hid}`
                : `/dashboards/action-items/review-by-hod/${tid}`
            )
          }
          className={btnCls.primary}
        >
          Review By HOD
        </button>
      );

    case 8:
      // PHP: testreport.php?hakuna=tid  (Review By QA)
      return (
        <button
          onClick={() => go(`/dashboards/action-items/review-by-hod/${tid}`)}
          className={btnCls.primary}
        >
          Review By QA
        </button>
      );

    case 9:
      // PHP: testreport.php?hakuna=tid  (Generate Final Report)
      return (
        <button
          onClick={() => go(`/dashboards/action-items/review-by-hod/${tid}`)}
          className={btnCls.primary}
        >
          Generate Final Report
        </button>
      );

    default:
      // PHP: "Pending TRF Approval"
      return (
        <span className={btnCls.muted}>Pending TRF Approval</span>
      );
  }
}

RowActions.propTypes = {
  row:   PropTypes.object,
  table: PropTypes.object,
};