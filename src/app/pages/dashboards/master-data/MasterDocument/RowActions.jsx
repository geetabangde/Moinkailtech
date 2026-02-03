import { useState } from "react";
import { Button } from "components/ui";
import { useNavigate } from "react-router";


export function RowActions({ row, table }) {
  const navigate = useNavigate();
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
    // Open document_path in new tab if available, otherwise fallback to old URL
    const viewUrl = data.document_path || `/textmasterdoument.php?docID=${data.id}`;
    window.open(viewUrl, '_blank');
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
    // Navigate to Add Master Document form with resume parameter
    navigate(`/dashboards/master-data/document-master/add?resumeId=${data.id}`);
  };

  const handleReview = async () => {
    await reviewDocument(data.id);
  };

  const handleApprove = async () => {
    await approveDocument(data.id);
  };

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
    </div>
  );
}