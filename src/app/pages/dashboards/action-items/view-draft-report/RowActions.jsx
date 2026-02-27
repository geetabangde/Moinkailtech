import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// RowActions — navigates to view-draft-report/:id page
// PHP: <a href="drafttestreport.php?hakuna=id">View Draft Report</a>
export function RowActions({ row }) {
  const navigate = useNavigate();
  const id       = row.original.id;
  const hodId    = row.original.hod_id;

  const handleView = () => {
    // Navigate relative to current route (view-draft-report → view-draft-report/:id)
    // Using just `id` so React Router appends it correctly: /parent/view-draft-report/48855
    const path = hodId
      ? `${id}?hod_id=${hodId}`
      : String(id);
    navigate(path);
  };

  return (
    <button
      onClick={handleView}
      className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-blue-700 active:scale-95"
    >
      View Draft Report
    </button>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
};