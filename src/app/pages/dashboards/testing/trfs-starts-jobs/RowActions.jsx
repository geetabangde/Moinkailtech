// Import Dependencies
import {
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
import { useCallback, useState } from "react";
import PropTypes from "prop-types";

import { ConfirmModal } from "components/shared/ConfirmModal";
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

function ActionPill({ onClick, icon: Icon, label, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150",
        danger
          ? "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
          : "dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 dark:hover:bg-dark-600 border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100",
      )}
    >
      <Icon className="size-3.5 shrink-0 stroke-[1.5]" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

export function RowActions({ row, table }) {
  const navigate = useNavigate();

  const trfId = row.original.id;
  const status = Number(row.original.status);

  // ✅ hasProducts — multiple fields se check karo
  const hasProducts =
    !!row.original.products_display ||
    !!row.original.brn_nos_display ||
    !!row.original.lrn_nos_display ||
    (Array.isArray(row.original.products) && row.original.products.length > 0);

  // Permissions from localStorage
  const permissions =
    localStorage.getItem("userPermissions")?.split(",").map(Number) || [];

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const closeModal = () => setDeleteModalOpen(false);
  const openModal = () => {
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
      toast.success("TRF entry deleted successfully ✅", {
        duration: 1000,
        icon: "🗑️",
      });
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
  const base = `/dashboards/testing/trfs-starts-jobs`;

  // ✅ KEY FIX: navigate ke saath trfStatus pass karo (route state mein)
  // TrfProductsList mein useLocation().state?.trfStatus se milega
  // PHP: $trfstatus = $trfrow['status'] — yahi value hai jo Add Item button control karta hai
  const go = (path) => () =>
    navigate(path, { state: { trfStatus: status } });

  const actions = [
    // Add Items — status 0 or 98, permission 98
    ...(status === 0 || status === 98
      ? [
          {
            label: "Add Items",
            icon: FolderOpenIcon,
            permission: 98,
            onClick: go(`${base}/trfitems/${trfId}`),
          },
        ]
      : []),

    // Sample Review — status 1
    ...(status === 1
      ? [
          {
            label: "Sample Review",
            icon: DocumentMagnifyingGlassIcon,
            permission: 125,
            onClick: go(`${base}/samplereview/${trfId}`),
          },
        ]
      : []),

    // Technical Acceptance — status 2
    ...(status === 2
      ? [
          {
            label: "Technical Acceptance",
            icon: ClipboardDocumentCheckIcon,
            permission: 126,
            onClick: go(`${base}/trfitems/${trfId}`),
          },
        ]
      : []),

    // Allot Sample — status 3
    ...(status === 3
      ? [
          {
            label: "Allot Sample",
            icon: BeakerIcon,
            permission: 128,
            onClick: go(`${base}/trfitems/${trfId}`),
          },
        ]
      : []),

    // Assign Chemist — status 3 or 4
    ...(status === 3 || status === 4
      ? [
          {
            label: "Assign Chemist",
            icon: UserIcon,
            permission: 6,
            onClick: go(`${base}/trfitems/${trfId}`),
          },
        ]
      : []),

    // Details — always visible
    {
      label: "Details",
      icon: DocumentTextIcon,
      onClick: go(`${base}/trfitems/${trfId}`),
    },

    // Perform Testing — status 5
    ...(status === 5
      ? [
          {
            label: "Perform Testing",
            icon: ClipboardDocumentCheckIcon,
            anyPermission: [7, 182],
            onClick: go(`${base}/trfitems/${trfId}`),
          },
        ]
      : []),

    // View Draft Report — status 6
    ...(status === 6
      ? [
          {
            label: "View Draft Report",
            icon: DocumentTextIcon,
            permission: 179,
            onClick: go(`${base}/trfitems/${trfId}`),
          },
        ]
      : []),

    // HOD Review — status 7
    ...(status === 7
      ? [
          {
            label: "HOD Review",
            icon: ClipboardDocumentCheckIcon,
            permission: 180,
            onClick: go(`${base}/trfitems/${trfId}`),
          },
        ]
      : []),

    // QA Review — status 8
    ...(status === 8
      ? [
          {
            label: "QA Review",
            icon: ClipboardDocumentCheckIcon,
            permission: 181,
            onClick: go(`${base}/trfitems/${trfId}`),
          },
        ]
      : []),

    // Generate ULR — status 9
    ...(status === 9
      ? [
          {
            label: "Generate ULR",
            icon: DocumentTextIcon,
            permission: 182,
            onClick: go(`${base}/trfitems/${trfId}`),
          },
        ]
      : []),

    // View Reports — status 10
    ...(status === 10
      ? [
          {
            label: "View Reports",
            icon: FolderOpenIcon,
            permission: 182,
            onClick: go(`${base}/trfitems/${trfId}`),
          },
        ]
      : []),

    // Print Slip — status > 3
    ...(status > 3
      ? [
          {
            label: "Print Slip",
            icon: PrinterIcon,
            onClick: go(`${base}/print-slip/${trfId}`),
          },
        ]
      : []),

    // Edit TRF — status < 10 or 98
    ...(status < 10 || status === 98
      ? [
          {
            label: "Edit TRF",
            icon: PencilIcon,
            permission: 2,
            onClick: go(`${base}/edit/${trfId}`),
          },
        ]
      : []),

    // Edit Work Order
    {
      label: "Edit Work Order detail",
      icon: DocumentTextIcon,
      permission: 284,
      onClick: go(`${base}/addPoDetailToTrf/${trfId}`),
    },

    // Edit Billing Detail
    {
      label: "Edit Billing Detail",
      icon: BanknotesIcon,
      permission: 284,
      onClick: go(`${base}/editBillingDetailTrf/${trfId}`),
    },

    // Edit Customer Responsible
    {
      label: "Edit Customer Responsible for Payment",
      icon: UserIcon,
      permission: 297,
      onClick: go(`${base}/editmaincustomerTrf/${trfId}`),
    },

    // Edit BD Person
    {
      label: "Edit BD Person",
      icon: PencilIcon,
      permission: 406,
      onClick: go(`${base}/edit_bd_person/${trfId}`),
    },

    // Fill Feedback Form
    {
      label: "Fill Feedback Form",
      icon: ChatBubbleBottomCenterTextIcon,
      permission: 283,
      onClick: go(`${base}/customerFeedbackForm/${trfId}`),
    },
  ];

  const filteredActions = actions.filter((action) => {
    if (action.anyPermission) {
      return action.anyPermission.some((p) => permissions.includes(p));
    }
    if (action.permission) {
      return permissions.includes(action.permission);
    }
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap gap-1.5 py-1">
        {filteredActions.map((action, index) => (
          <ActionPill
            key={index}
            onClick={action.onClick}
            icon={action.icon}
            label={action.label}
          />
        ))}

        {permissions.includes(395) && !hasProducts && (
          <ActionPill
            onClick={openModal}
            icon={TrashIcon}
            label="Delete"
            danger
          />
        )}
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