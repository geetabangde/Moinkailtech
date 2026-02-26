import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// PHP: "Perform Test" button → performmytests.php?hakuna={id}
export function PerformTestRowActions({ row }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => 
      navigate(`/dashboards/action-items/perform-testing/${row.original.id}`)}
      
      className="rounded bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
    >
      Perform Test
    </button>
  );
}

PerformTestRowActions.propTypes = {
  row: PropTypes.object,
};