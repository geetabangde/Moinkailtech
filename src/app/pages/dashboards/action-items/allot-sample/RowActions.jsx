import PropTypes from "prop-types";
import { useNavigate } from "react-router";

export function RowActions({ row }) {
  const navigate = useNavigate();

const handleAllotSample = () => {
  const id = row.original.id;
  navigate(`/dashboards/action-items/allot-sample/${id}`);  // ✅ route path
};

  return (
    <button
      onClick={handleAllotSample}
      className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-red-700"
    >
      Allot Sample
    </button>
  );
}

RowActions.propTypes = {
  row:   PropTypes.object,
  table: PropTypes.object,
};