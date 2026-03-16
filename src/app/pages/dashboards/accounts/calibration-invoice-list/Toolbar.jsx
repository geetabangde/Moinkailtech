// Toolbar.jsx — Calibration Invoice List
// PHP permissions:
//   permission(146) → page access (checked in index)
//   permission(61)  → Add Calibration Invoices + Add Advance Calibration Invoices
//   permission(292) → Add Calibration FOC Invoices

import { useNavigate } from "react-router";
import PropTypes from "prop-types";

export function Toolbar({ table }) {
  const navigate = useNavigate();
  const permissions = table.options.meta?.permissions ?? [];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      {/* Left: Search */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search invoice, customer, PO..."
          value={table.getState().globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 dark:placeholder-dark-400 w-64 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Right: Add buttons — PHP permission checks */}
      <div className="flex flex-wrap items-center gap-2">
        {/* PHP: in_array(61, $permissions) → Add Calibration Invoices */}
        {permissions.includes(61) && (
          <>
            <button
              onClick={() =>
                navigate("/dashboards/accounts/calibration-invoice-list/add")
              }
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Calibration Invoice
            </button>

            {/* PHP: + Add Advance Calibration Invoices */}
            <button
              onClick={() =>
                navigate(
                  "/dashboards/accounts/calibration-invoice-list/add-advance",
                )
              }
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Advance Calibration Invoice
            </button>
          </>
        )}

        {/* PHP: in_array(292, $permissions) → Add Calibration FOC Invoices */}
        {permissions.includes(292) && (
          <button
            onClick={() =>
              navigate("/dashboards/accounts/calibration-invoice-list/add-foc")
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Calibration FOC Invoice
          </button>
        )}
      </div>
    </div>
  );
}

Toolbar.propTypes = {
  table: PropTypes.object,
};
