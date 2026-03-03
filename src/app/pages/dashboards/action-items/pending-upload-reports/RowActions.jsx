// Import Dependencies
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// ----------------------------------------------------------------------

export function RowActions({ row }) {
  const navigate   = useNavigate();
  const { id, report } = row.original;

  // PHP: show button only when in_array(333, $permissions) && empty($row['report'])
  // report field: if already uploaded (non-empty), hide button
  const alreadyUploaded = Boolean(report);

  const handleUpload = () => {
    navigate(`/dashboards/action-items/pending-upload-reports/${id}`);
  };

  if (alreadyUploaded) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-800">
        ✓ Uploaded
      </span>
    );
  }

  return (
    <button
      onClick={handleUpload}
      className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 active:scale-95"
    >
      Upload Report
    </button>
  );
}

RowActions.propTypes = {
  row:   PropTypes.object.isRequired,
  table: PropTypes.object,
};