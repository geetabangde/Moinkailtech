import { useState } from "react";
import { Button } from "components/ui";


export function RowActions({ row, table }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const data = row.original;
  
  const { 
    deleteRow, 
    approveDocument, 
    reviewDocument 
  } = table.options.meta;

  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('employeeId') || null;

  const handleView = () => {
    // Open in new tab - adjust URL as per your routing
    window.open(`/textmasterdoument.php?docID=${data.id}`, '_blank');
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setIsDeleting(true);
      try {
        await deleteRow(row);
      } catch (error) {
        console.error("Error deleting:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleResume = () => {
    window.open(`/resumeMasterDocument.php?docID=${data.id}`, '_blank');
  };

  const handleReview = async () => {
    await reviewDocument(data.id);
  };

  const handleApprove = async () => {
    await approveDocument(data.id);
  };

  // const handleAddRevision = () => {
  //   window.open(`/addRevMasterDocument.php?docID=${data.id}`, '_blank');
  // };

  // const handleShareDocument = () => {
  //   // Implement share document modal
  //   alert("Share document functionality - implement modal");
  // };

  // Convert to numbers for comparison (handle both string and number types)
  const status = Number(data.status);
  const approvalStatus = Number(data.approval_status);
  const obsoleteStatus = Number(data.obsoletestatus);
  const reviewedBy = data.reviewedby ? String(data.reviewedby) : null;
  const approvedBy = data.approvedby ? String(data.approvedby) : null;

  // PHP Condition: if ($row['status'] == "-1" || $row['status'] == "0" || $row['status'] == "1")
  const showDelete = status === -1 || status === 0 || status === 1;
  
  // PHP Condition: if (($row['approval_status'] == 0 && $row['obsoletestatus'] == 0) && ($row['status'] == -1 || $row['status'] == 0 || $row['status'] == 1))
  const showResume = 
    approvalStatus === 0 && 
    obsoleteStatus === 0 && 
    (status === -1 || status === 0 || status === 1);
  
  // PHP Condition: if (($row['approval_status'] == 0) && ($row['obsoletestatus'] == 0) && ($row['status'] == 0))
  // AND if ($row['reviewedby'] == $employeeid)
  const showReview = 
    approvalStatus === 0 && 
    obsoleteStatus === 0 && 
    status === 0 &&
    reviewedBy && 
    currentUserId && 
    reviewedBy === currentUserId;
  
  // PHP Condition: elseif (($row['approval_status'] == 0) && ($row['obsoletestatus'] == 0) && ($row['status'] == 1))
  // AND if ($row['approvedby'] == $employeeid)
  const showApprove = 
    approvalStatus === 0 && 
    obsoleteStatus === 0 && 
    status === 1 &&
    approvedBy && 
    currentUserId && 
    approvedBy === currentUserId;

  // PHP Condition: if (($row['approval_status'] == 1) && ($row['obsoletestatus'] == 0) && ($row['status'] == 2))
  // const showAddRevAndShare = 
  //   approvalStatus === 1 && 
  //   obsoleteStatus === 0 && 
  //   status === 2;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* View Button - Always visible */}
      <Button
        size="sm"
        variant="flat"
        color="primary"
        onClick={handleView}
        className="h-7 px-3 text-xs whitespace-nowrap"
      >
        View
      </Button>

      {/* Delete Button */}
      {showDelete && (
        <Button
          size="sm"
          variant="flat"
          color="error"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-7 px-3 text-xs whitespace-nowrap"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      )}

      {/* Resume Button */}
      {showResume && (
        <Button
          size="sm"
          variant="flat"
          color="primary"
          onClick={handleResume}
          className="h-7 px-3 text-xs whitespace-nowrap"
        >
          Resume
        </Button>
      )}

      {/* Review Button */}
      {showReview && (
        <Button
          size="sm"
          variant="flat"
          color="warning"
          onClick={handleReview}
          className="h-7 px-3 text-xs whitespace-nowrap"
        >
          Review
        </Button>
      )}

      {/* Approve Button */}
      {showApprove && (
        <Button
          size="sm"
          variant="flat"
          color="success"
          onClick={handleApprove}
          className="h-7 px-3 text-xs whitespace-nowrap"
        >
          Approve
        </Button>
      )}

      {/* More Actions Menu - Only show for active documents */}
      {/* COMMENTED OUT - As per PHP code, these options are commented */}
      {/* {showAddRevAndShare && (
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton
            as={Button}
            variant="flat"
            size="sm"
            className="size-7 p-0"
          >
            <EllipsisHorizontalIcon className="size-4" />
          </MenuButton>
          <Transition
            as={MenuItems}
            enter="transition ease-out"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
            className="absolute z-100 mt-1.5 min-w-[10rem] whitespace-nowrap rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-700 dark:shadow-none ltr:right-0 rtl:left-0"
          >
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={handleAddRevision}
                  className={clsx(
                    "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                  )}
                >
                  <span>Add Revision</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={handleShareDocument}
                  className={clsx(
                    "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                  )}
                >
                  <span>Share Document</span>
                </button>
              )}
            </MenuItem>
          </Transition>
        </Menu>
      )} */}
    </div>
  );
}