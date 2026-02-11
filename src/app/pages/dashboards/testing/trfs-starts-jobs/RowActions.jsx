// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  BeakerIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useCallback, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button } from "components/ui";
import axios from "utils/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router";

// ----------------------------------------------------------------------

const confirmMessages = {
  pending: {
    description:
      "Are you sure you want to delete this TRF entry? Once deleted, it cannot be restored.",
  },
  success: {
    title: "TRF Entry Deleted",
  },
};

export function RowActions({ row, table }) {
  const navigate = useNavigate();
  const trfId = row.original.id;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteTrf = useCallback(async () => {
    setConfirmDeleteLoading(true);

    try {
      await axios.delete(`/testing/delete-trf?id=${trfId}`);

      // Remove row from UI
      table.options.meta?.deleteRow(row);

      setDeleteSuccess(true);
      toast.success("TRF entry deleted successfully ✅", {
        duration: 1000,
        icon: "🗑️",
      });

      // Close modal after success
      setTimeout(() => {
        setDeleteModalOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Delete failed:", error);
      setDeleteError(true);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete TRF entry";

      toast.error(`${errorMessage} ❌`, {
        duration: 2000,
      });
    } finally {
      setConfirmDeleteLoading(false);
    }
  }, [row, table, trfId]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <div className="flex justify-center space-x-1.5">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton as={Button} isIcon className="size-8 rounded-full">
            <EllipsisHorizontalIcon className="size-4.5" />
          </MenuButton>
          <Transition
            as={Fragment}
            enter="transition ease-out"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
          >
            <MenuItems
              anchor={{ to: "bottom end", gap: 12 }}
              className="absolute z-100 w-[14rem] max-h-[400px] overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none ltr:right-0 rtl:left-0"
            >
              {/* Edit TRF */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      navigate(`/dashboards/testing/trfs-starts-jobs/edit/${trfId}`)
                    }
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    )}
                  >
                    <PencilIcon className="size-4.5 stroke-1" />
                    <span>Edit TRF</span>
                  </button>
                )}
              </MenuItem>

              {/* View Details */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      navigate(`/dashboards/testing/trfs-starts-jobs/details/${trfId}`)
                    }
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    )}
                  >
                    <DocumentTextIcon className="size-4.5 stroke-1" />
                    <span>Details</span>
                  </button>
                )}
              </MenuItem>

              {/* Edit Bill Person */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      navigate(`/dashboards/testing/trfs-starts-jobs/edit-bill-person/${trfId}`)
                    }
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    )}
                  >
                    <UserIcon className="size-4.5 stroke-1" />
                    <span>Edit Bill Person</span>
                  </button>
                )}
              </MenuItem>

              {/* Add Sample */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      navigate(`/dashboards/testing/trfs-starts-jobs/add-sample/${trfId}`)
                    }
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    )}
                  >
                    <BeakerIcon className="size-4.5 stroke-1" />
                    <span>Add Sample</span>
                  </button>
                )}
              </MenuItem>

              {/* Assign Chemist */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      navigate(`/dashboards/testing/trfs-starts-jobs/assign-chemist/${trfId}`)
                    }
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    )}
                  >
                    <UserIcon className="size-4.5 stroke-1" />
                    <span>Assign Chemist</span>
                  </button>
                )}
              </MenuItem>

              {/* Perform Testing */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      navigate(`/dashboards/testing/trfs-starts-jobs/perform-testing/${trfId}`)
                    }
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    )}
                  >
                    <ClipboardDocumentCheckIcon className="size-4.5 stroke-1" />
                    <span>Perform Testing</span>
                  </button>
                )}
              </MenuItem>

              {/* Edit Work Order Detail */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      navigate(`/dashboards/testing/trfs-starts-jobs/edit-work-order/${trfId}`)
                    }
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    )}
                  >
                    <DocumentTextIcon className="size-4.5 stroke-1" />
                    <span>Edit Work Order</span>
                  </button>
                )}
              </MenuItem>

              {/* Edit Billing Detail */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      navigate(`/dashboards/testing/trfs-starts-jobs/edit-billing/${trfId}`)
                    }
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    )}
                  >
                    <BanknotesIcon className="size-4.5 stroke-1" />
                    <span>Edit Billing Detail</span>
                  </button>
                )}
              </MenuItem>

              {/* Edit Customer Responsible */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboards/testing/trfs-starts-jobs/edit-customer-responsible/${trfId}`
                      )
                    }
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    )}
                  >
                    <UserIcon className="size-4.5 stroke-1" />
                    <span>Edit Customer Responsible</span>
                  </button>
                )}
              </MenuItem>

              {/* Fill Feedback Form */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      navigate(`/dashboards/testing/trfs-starts-jobs/feedback/${trfId}`)
                    }
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                    )}
                  >
                    <ChatBubbleBottomCenterTextIcon className="size-4.5 stroke-1" />
                    <span>Fill Feedback Form</span>
                  </button>
                )}
              </MenuItem>

              {/* Divider */}
              <div className="my-1 h-px bg-gray-200 dark:bg-dark-500" />

              {/* Delete */}
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={openModal}
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide text-red-600 outline-hidden transition-colors dark:text-red-400",
                      focus && "bg-red-50 dark:bg-red-900/20"
                    )}
                  >
                    <TrashIcon className="size-4.5 stroke-1" />
                    <span>Delete</span>
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>
      </div>

      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeModal}
        messages={confirmMessages}
        onOk={handleDeleteTrf}
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