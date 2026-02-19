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
  FolderOpenIcon,
  TrashIcon,
  UserIcon,
  BeakerIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  ChatBubbleBottomCenterTextIcon,
  PrinterIcon,
  DocumentMagnifyingGlassIcon,
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

  // ── Fields from actual API response ──────────────────────────────────────
  const trfId      = row.original.id;
  const status     = Number(row.original.status);
  const hasProducts = Array.isArray(row.original.products) && row.original.products.length > 0;

  // ── Delete modal state ────────────────────────────────────────────────────
  const [deleteModalOpen,      setDeleteModalOpen]      = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess,        setDeleteSuccess]        = useState(false);
  const [deleteError,          setDeleteError]          = useState(false);

  const closeModal = () => setDeleteModalOpen(false);
  const openModal  = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteTrf = useCallback(async () => {
    setConfirmDeleteLoading(true);
    try {
      await axios.delete(`/testing/delete-trf?id=${trfId}`);
      table.options.meta?.deleteRow(row);
      setDeleteSuccess(true);
      toast.success("TRF entry deleted successfully ✅", { duration: 1000, icon: "🗑️" });
      setTimeout(() => setDeleteModalOpen(false), 1000);
    } catch (error) {
      console.error("Delete failed:", error);
      setDeleteError(true);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete TRF entry";
      toast.error(`${errorMessage} ❌`, { duration: 2000 });
    } finally {
      setConfirmDeleteLoading(false);
    }
  }, [row, table, trfId]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  // ── Button class helper ───────────────────────────────────────────────────
  const btnCls = (focus, danger = false) =>
    clsx(
      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
      danger
        ? clsx("text-red-600 dark:text-red-400", focus && "bg-red-50 dark:bg-red-900/20")
        : clsx(focus && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100")
    );

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

              {/* ── Add Items — status 0 or 98 ── */}
              {(status === 0 || status === 98) && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/trfitems/${trfId}`)} className={btnCls(focus)}>
                      <FolderOpenIcon className="size-4.5 stroke-1" />
                      <span>Add Items</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── Sample Review — status 1 & has products ── */}
              {status === 1 && hasProducts && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/sample-review/${trfId}`)} className={btnCls(focus)}>
                      <DocumentMagnifyingGlassIcon className="size-4.5 stroke-1" />
                      <span>Sample Review</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── Technical Acceptance — status 2, has products ── */}
              {status === 2 && hasProducts && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/trfitems/${trfId}`)} className={btnCls(focus)}>
                      <ClipboardDocumentCheckIcon className="size-4.5 stroke-1" />
                      <span>Technical Acceptance</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── Allot Sample — status 3, has products ── */}
              {status === 3 && hasProducts && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/trfitems/${trfId}`)} className={btnCls(focus)}>
                      <BeakerIcon className="size-4.5 stroke-1" />
                      <span>Allot Sample</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── Assign Chemist — status 3 or 4, has products ── */}
              {(status === 3 || status === 4) && hasProducts && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/assign-chemist/${trfId}`)} className={btnCls(focus)}>
                      <UserIcon className="size-4.5 stroke-1" />
                      <span>Assign Chemist</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── Details — always ── */}
              <MenuItem>
                {({ focus }) => (
                  <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/trfitems/${trfId}`)} className={btnCls(focus)}>
                    <DocumentTextIcon className="size-4.5 stroke-1" />
                    <span>Details</span>
                  </button>
                )}
              </MenuItem>

              {/* ── Perform Testing — status 5 ── */}
              {status === 5 && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/perform-testing/${trfId}`)} className={btnCls(focus)}>
                      <ClipboardDocumentCheckIcon className="size-4.5 stroke-1" />
                      <span>Perform Testing</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── View Draft Report — status 6 ── */}
              {status === 6 && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/draft-report/${trfId}`)} className={btnCls(focus)}>
                      <DocumentTextIcon className="size-4.5 stroke-1" />
                      <span>View Draft Report</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── HOD Review — status 7 ── */}
              {status === 7 && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/hod-review/${trfId}`)} className={btnCls(focus)}>
                      <ClipboardDocumentCheckIcon className="size-4.5 stroke-1" />
                      <span>HOD Review</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── QA Review — status 8 ── */}
              {status === 8 && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/qa-review/${trfId}`)} className={btnCls(focus)}>
                      <ClipboardDocumentCheckIcon className="size-4.5 stroke-1" />
                      <span>QA Review</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── Generate ULR — status 9 ── */}
              {status === 9 && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/generate-ulr/${trfId}`)} className={btnCls(focus)}>
                      <DocumentTextIcon className="size-4.5 stroke-1" />
                      <span>Generate ULR</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── View Reports — status 10 ── */}
              {status === 10 && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/reports/${trfId}`)} className={btnCls(focus)}>
                      <FolderOpenIcon className="size-4.5 stroke-1" />
                      <span>View Reports</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── Print Slip — status > 3 ── */}
              {status > 3 && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/print-slip/${trfId}`)} className={btnCls(focus)}>
                      <PrinterIcon className="size-4.5 stroke-1" />
                      <span>Print Slip</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── Edit TRF — status < 10 or 98 ── */}
              {(status < 10 || status === 98) && (
                <MenuItem>
                  {({ focus }) => (
                    <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/edit/${trfId}`)} className={btnCls(focus)}>
                      <PencilIcon className="size-4.5 stroke-1" />
                      <span>Edit TRF</span>
                    </button>
                  )}
                </MenuItem>
              )}

              {/* ── Edit Work Order / Billing / Customer — status < 10 or 98 ── */}
              {(status < 10 || status === 98) && (
                <>
                  <MenuItem>
                    {({ focus }) => (
                      <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/edit-work-order/${trfId}`)} className={btnCls(focus)}>
                        <DocumentTextIcon className="size-4.5 stroke-1" />
                        <span>Edit Work Order</span>
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/edit-billing/${trfId}`)} className={btnCls(focus)}>
                        <BanknotesIcon className="size-4.5 stroke-1" />
                        <span>Edit Billing Detail</span>
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/edit-customer-responsible/${trfId}`)} className={btnCls(focus)}>
                        <UserIcon className="size-4.5 stroke-1" />
                        <span>Edit Customer Responsible</span>
                      </button>
                    )}
                  </MenuItem>
                </>
              )}

              {/* ── Edit BD Person — always ── */}
              <MenuItem>
                {({ focus }) => (
                  <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/edit_bd_person/${trfId}`)} className={btnCls(focus)}>
                    <PencilIcon className="size-4.5 stroke-1" />
                    <span>Edit BD Person</span>
                  </button>
                )}
              </MenuItem>

              {/* ── Fill Feedback Form — always ── */}
              <MenuItem>
                {({ focus }) => (
                  <button onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs/feedback/${trfId}`)} className={btnCls(focus)}>
                    <ChatBubbleBottomCenterTextIcon className="size-4.5 stroke-1" />
                    <span>Fill Feedback Form</span>
                  </button>
                )}
              </MenuItem>

              {/* Divider */}
              <div className="my-1 h-px bg-gray-200 dark:bg-dark-500" />

              {/* ── Delete ── */}
              <MenuItem>
                {({ focus }) => (
                  <button onClick={openModal} className={btnCls(focus, true)}>
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