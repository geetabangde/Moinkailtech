
//----------------------correctone-----------------------



// import { useCallback, useState } from "react";
// import PropTypes from "prop-types";
// import { ConfirmModal } from "components/shared/ConfirmModal";
// import { Button } from "components/ui";
// import { useNavigate } from "react-router";
// import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// const confirmMessages = {
//   pending: {
//     description:
//       "Are you sure you want to delete this record? Once deleted, it cannot be restored.",
//   },
//   success: {
//     title: "Record Deleted",
//   },
// };

// export function RowActions({ row, table }) {
//   const navigate = useNavigate();
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
//   const [deleteSuccess, setDeleteSuccess] = useState(false);
//   const [deleteError] = useState(false);



//   // const handleEdit = () => {
//   //   navigate(
//   //     `/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail/edit-new-master-matrix`
//   //   );
//   // };

//   const openDeleteModal = () => {
//     setDeleteModalOpen(true);
//     setDeleteSuccess(false);
//   };

//   const closeDeleteModal = () => {
//     setDeleteModalOpen(false);
//   };

//   const handleDeleteRows = useCallback(() => {
//     setConfirmDeleteLoading(true);
//     setTimeout(() => {
//       table.options.meta?.deleteRow(row);
//       setDeleteSuccess(true);
//       setConfirmDeleteLoading(false);
//     }, 1000);
//   }, [row, table]);

//   const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

//   return (
//     <>
//       {/* Action Buttons (inline, no dropdown) */}
//       <div className="flex justify-center space-x-2">
//         {/* Edit Button */}
//         <Button
//           className="h-8 flex items-center space-x-1.5 rounded-md px-3 text-xs"
//           color="primary"
//           onClick={()=>
//             navigate(
//               `/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail/edit-new-master-matrix`
//             )
//           }
//         >
//           <PencilIcon className="w-4 h-4" />
//           <span>Edit Master Matrix</span>
//         </Button>

//         {/* Delete Button */}
//         <Button
//           className="h-8 flex items-center space-x-1.5 rounded-md px-3 text-xs text-red-600 border-red-300 hover:bg-red-50"
//           color= ""
//           onClick={openDeleteModal}
//         >
//           <TrashIcon className="w-4 h-4" />
//           <span>Delete</span>
//         </Button>
//       </div>

//       {/* Confirm Delete Modal */}
//       <ConfirmModal
//         show={deleteModalOpen}
//         onClose={closeDeleteModal}
//         messages={confirmMessages}
//         onOk={handleDeleteRows}
//         confirmLoading={confirmDeleteLoading}
//         state={state}
//       />
//     </>
//   );
// }

// RowActions.propTypes = {
//   row: PropTypes.object,
//   table: PropTypes.object,
// };




// RowActions.js
import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button } from "components/ui";
import { useNavigate, useLocation } from "react-router";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const confirmMessages = {
  pending: {
    description:
      "Are you sure you want to delete this record? Once deleted, it cannot be restored.",
  },
  success: {
    title: "Record Deleted",
  },
};

export function RowActions({ row, table }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError] = useState(false);

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
    setDeleteSuccess(false);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleDeleteRows = useCallback(() => {
    setConfirmDeleteLoading(true);
    setTimeout(() => {
      table.options.meta?.deleteRow(row);
      setDeleteSuccess(true);
      setConfirmDeleteLoading(false);
    }, 1000);
  }, [row, table]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  // Handle Edit with URL parameters
  const handleEdit = () => {
    // Extract URL parameters
    const params = new URLSearchParams(location.search);
    const fid = params.get("fid") || "";
    const cid = params.get("cid") || "";
    const labId = params.get("labId") || "";
    const id = row.original.id;

    // Build query string
    const queryParams = new URLSearchParams();
    if (fid) queryParams.append('fid', fid);
    if (cid) queryParams.append('cid', cid);
    if (labId) queryParams.append('labId', labId);
    if (id) queryParams.append('id', id);

    // Check if this is from uncertainty table
    const fromUncertaintyTable = table.options.meta?.isUncertaintyTable;
    
    if (fromUncertaintyTable) {
      navigate(
        `/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail/edit-new-uncertinity-master-matrix?${queryParams.toString()}`
      );
    } else {
      navigate(
        `/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail/edit-new-master-matrix?${queryParams.toString()}`
      );
    }
  };

  return (
    <>
      <div className="flex justify-center space-x-2">
        {/* Edit Button */}
        <Button
          className="h-8 flex items-center space-x-1.5 rounded-md px-3 text-xs"
          color="primary"
          onClick={handleEdit}
        >
          <PencilIcon className="w-4 h-4" />
          <span>Edit Master Matrix</span>
        </Button>

        {/* Delete Button */}
        <Button
          className="h-8 flex items-center space-x-1.5 rounded-md px-3 text-xs text-red-600 border-red-300 hover:bg-red-50"
          color=""
          onClick={openDeleteModal}
        >
          <TrashIcon className="w-4 h-4" />
          <span>Delete</span>
        </Button>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeDeleteModal}
        messages={confirmMessages}
        onOk={handleDeleteRows}
        confirmLoading={confirmDeleteLoading}
        state={state}
      />
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};