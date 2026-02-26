import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export function RowActions({ row }) {
  const navigate = useNavigate();

  // PHP: "Assign Chemist" button → opens assignchemist.php?hakuna={id}
  // React: Navigate to detail page → GET by id → then POST on form submit
  const handleAssign = () => {
    const id = row.original.id;
    navigate(`/dashboards/action-items/assign-chemist/${id}`);  
  
  };

  return (
    <button
      onClick={handleAssign}
      className="rounded bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
    >
      Assign Chemist
    </button>
  );
}

RowActions.propTypes = {
  row:   PropTypes.object,
  table: PropTypes.object,
};