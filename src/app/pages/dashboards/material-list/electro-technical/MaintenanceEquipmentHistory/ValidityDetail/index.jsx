import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useRef, useState, useEffect, useCallback } from "react";
import axios from "utils/axios";
import { useLocation } from "react-router";
import toast, { Toaster } from 'react-hot-toast';

// Local Imports
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { ColumnFilter } from "components/shared/table/ColumnFilter";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { Button, Card, Table, THead, TBody, Th, Tr, Input, Td } from "components/ui";
import {
  useLockScrollbar,
  useLocalStorage,
  useDidUpdate,
} from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { SelectedRowsActions } from "./SelectedRowsActions";
import { columns, uncertaintyColumns } from "./columns";
import { Toolbar } from "./Toolbar";
import { useThemeContext } from "app/contexts/theme/context";
import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";
import { useNavigate } from "react-router";

const isSafari = getUserAgentBrowser() === "Safari";

export default function ValidityDetailsTable() {
  const { cardSkin } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Get URL params
  const [urlParams, setUrlParams] = useState({ fid: '', cid: '', labId: '' });

  // Matrix Data State
  const [matrixData, setMatrixData] = useState([]);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [matrixRecordsFiltered, setMatrixRecordsFiltered] = useState(0);

  // Uncertainty Data State
  const [uncertaintyData, setUncertaintyData] = useState([]);
  const [uncertaintyLoading, setUncertaintyLoading] = useState(true);
  const [uncertaintyRecordsTotal, setUncertaintyRecordsTotal] = useState(0);

  const [tableSettings, setTableSettings] = useState({
    enableSorting: true,
    enableColumnFilters: true,
    enableFullScreen: false,
    enableRowDense: false,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [uncertaintyGlobalFilter, setUncertaintyGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [uncertaintySorting, setUncertaintySorting] = useState([]);

  const [matrixPagination, setMatrixPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [uncertaintyPagination, setUncertaintyPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-validity",
    {}
  );

  const [uncertaintyColumnVisibility, setUncertaintyColumnVisibility] =
    useLocalStorage("column-visibility-uncertainty", {});

  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-validity",
    {}
  );

  const cardRef = useRef();
  const uncertaintyCardRef = useRef();

  // Extract URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fid = params.get("fid") || "";
    const cid = params.get("cid") || "";
    const labId = params.get("labId") || "";

    setUrlParams({ fid, cid, labId });
  }, [location.search]);

  // Function to handle back navigation with params
  const handleBackNavigation = () => {
    if (urlParams.fid && urlParams.labId) {
      navigate(`/dashboards/material-list/electro-technical/maintenance-equipment-history?fid=${urlParams.fid}&labId=${urlParams.labId}`);
    } else if (urlParams.fid) {
      navigate(`/dashboards/material-list/electro-technical/maintenance-equipment-history?fid=${urlParams.fid}`);
    } else {
      navigate('/dashboards/material-list/electro-technical/maintenance-equipment-history');
    }
  };

  // API: Delete Master Matrix
  const deleteMasterMatrix = async (id) => {
    try {
      const response = await axios.delete(`/material/delete-mastermatrix`, {
        params: { id }
      });

      if (response.data?.success || response.data?.status) {
        // Immediately remove from UI
        setMatrixData((prev) => prev.filter((row) => row.id !== id));
        // Show success toast
        toast.success(response.data?.message || "Record deleted successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to delete record");
        return false;
      }
    } catch (err) {
      console.error("Error deleting master matrix:", err);
      toast.error(err.response?.data?.message || "Failed to delete record");
      return false;
    }
  };

  // API: Delete Master Uncertainty Matrix
  const deleteMasterUncertaintyMatrix = async (id) => {
    try {
      const response = await axios.delete(`/material/delete-MasterUncertainty-Matrix/${id}`);

      if (response.data?.success || response.data?.status) {
        // Immediately remove from UI
        setUncertaintyData((prev) => prev.filter((row) => row.id !== id));
        // Show success toast
        toast.success(response.data?.message || "Record deleted successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to delete record");
        return false;
      }
    } catch (err) {
      console.error("Error deleting master uncertainty matrix:", err);
      toast.error(err.response?.data?.message || "Failed to delete record");
      return false;
    }
  };

  // API: Fetch Matrix Data
  const fetchMatrixData = useCallback(async (fid, cid) => {
    try {
      setMatrixLoading(true);

      const response = await axios.get(`/material/masters-matrix-detail`, {
        params: {
          fid: fid,
          cid: cid,
          draw: 1,
          start: matrixPagination.pageIndex * matrixPagination.pageSize,
          length: matrixPagination.pageSize,
          "search[value]": globalFilter,
        },
      });

      if (response.data) {
        setMatrixData(
          Array.isArray(response.data.data) ? response.data.data : []
        );
        setMatrixRecordsFiltered(response.data.recordsFiltered || 0);
      }
    } catch (err) {
      console.error("Error fetching matrix data:", err);
      setMatrixData([]);
    } finally {
      setMatrixLoading(false);
    }
  }, [matrixPagination.pageIndex, matrixPagination.pageSize, globalFilter]);

  // API: Fetch Uncertainty Data
  const fetchUncertaintyData = useCallback(async (fid, cid) => {
    try {
      setUncertaintyLoading(true);

      const response = await axios.get(`/material/masters-validity-detail`, {
        params: {
          fid: fid,
          cid: cid,
          draw: 1,
          start: uncertaintyPagination.pageIndex * uncertaintyPagination.pageSize,
          length: uncertaintyPagination.pageSize,
          "search[value]": uncertaintyGlobalFilter,
        },
      });

      if (response.data) {
        setUncertaintyData(
          Array.isArray(response.data.data) ? response.data.data : []
        );
        setUncertaintyRecordsTotal(response.data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching uncertainty data:", err);
      setUncertaintyData([]);
    } finally {
      setUncertaintyLoading(false);
    }
  }, [uncertaintyPagination.pageIndex, uncertaintyPagination.pageSize, uncertaintyGlobalFilter]);

  // Fetch Matrix Data
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fid = params.get("fid") || "";
    const cid = params.get("cid") || "";

    if (fid && cid) {
      fetchMatrixData(fid, cid);
    } else {
      setMatrixLoading(false);
      setMatrixData([]);
    }
  }, [location.search, fetchMatrixData]);

  // Fetch Uncertainty Data
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fid = params.get("fid") || "";
    const cid = params.get("cid") || "";

    if (fid && cid) {
      fetchUncertaintyData(fid, cid);
    } else {
      setUncertaintyLoading(false);
      setUncertaintyData([]);
    }
  }, [location.search, fetchUncertaintyData]);

  // Main Matrix Table
  const table = useReactTable({
    data: matrixData,
    columns: columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
      pagination: matrixPagination,
    },
    meta: {
      setTableSettings,
      deleteRow: async (row) => {
        await deleteMasterMatrix(row.original.id);
        skipAutoResetPageIndex();
      },
      deleteRows: async (rows) => {
        skipAutoResetPageIndex();
        for (const row of rows) {
          await deleteMasterMatrix(row.original.id);
        }
      },
    },
    filterFns: { fuzzy: fuzzyFilter },
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setMatrixPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    autoResetPageIndex,
    pageCount: Math.ceil(matrixRecordsFiltered / matrixPagination.pageSize),
    manualPagination: true,
  });

  // Uncertainty Table
  const uncertaintyTable = useReactTable({
    data: uncertaintyData,
    columns: uncertaintyColumns,
    state: {
      globalFilter: uncertaintyGlobalFilter,
      sorting: uncertaintySorting,
      columnVisibility: uncertaintyColumnVisibility,
      pagination: uncertaintyPagination,
    },
    meta: {
      isUncertaintyTable: true,
      deleteRow: async (row) => {
        await deleteMasterUncertaintyMatrix(row.original.id);
        skipAutoResetPageIndex();
      },
      deleteRows: async (rows) => {
        skipAutoResetPageIndex();
        for (const row of rows) {
          await deleteMasterUncertaintyMatrix(row.original.id);
        }
      },
    },
    filterFns: { fuzzy: fuzzyFilter },
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setUncertaintyGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setUncertaintySorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setUncertaintyPagination,
    onColumnVisibilityChange: setUncertaintyColumnVisibility,
    autoResetPageIndex,
    pageCount: Math.ceil(uncertaintyRecordsTotal / uncertaintyPagination.pageSize),
    manualPagination: true,
  });

  useDidUpdate(() => table.resetRowSelection(), [matrixData]);
  useDidUpdate(() => uncertaintyTable.resetRowSelection(), [uncertaintyData]);
  useLockScrollbar(tableSettings.enableFullScreen);

  // Loading State
  if (matrixLoading && uncertaintyLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-600">
        <svg
          className="animate-spin h-6 w-6 mr-2 text-blue-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
          ></path>
        </svg>
        Loading Validity Details...
      </div>
    );
  }

  return (
    <div className="transition-content grid grid-cols-1 grid-rows-[auto_auto_1fr] px-(--margin-x) py-4">
      {/* Toast Notification */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="flex items-center justify-between space-x-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Masters Validity Details
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            color="primary"
            onClick={handleBackNavigation}
          >
            ← Back To Master Validity
          </Button>

          <Button
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            color="primary"
            onClick={() => {
              const params = new URLSearchParams();
              if (urlParams.fid) params.append('fid', urlParams.fid);
              if (urlParams.cid) params.append('cid', urlParams.cid);
              if (urlParams.labId) params.append('labId', urlParams.labId);

              navigate(
                `/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail/add-new-master-matrix?${params.toString()}`
              );
            }}
          >
            Add New Master Matrix
          </Button>
        </div>
      </div>

      <div className="flex flex-col pt-4 space-y-6">
        {/* 1. Main Matrix Table */}
        <Card
          className={clsx(
            "relative flex grow flex-col",
            tableSettings.enableFullScreen && "overflow-hidden"
          )}
          ref={cardRef}
        >
          <Toolbar table={table} />
          <div className="table-wrapper min-w-full grow overflow-x-auto">
            <Table
              hoverable
              dense={tableSettings.enableRowDense}
              sticky={tableSettings.enableFullScreen}
              className="w-full text-left rtl:text-right"
            >
              <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        className={clsx(
                          "bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg",
                          header.column.getCanPin() && [
                            header.column.getIsPinned() === "left" &&
                            "sticky z-2 ltr:left-0 rtl:right-0",
                            header.column.getIsPinned() === "right" &&
                            "sticky z-2 ltr:right-0 rtl:left-0",
                          ]
                        )}
                      >
                        {header.column.getCanSort() ? (
                          <div
                            className="flex cursor-pointer select-none items-center space-x-3"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="flex-1">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                            </span>
                            <TableSortIcon
                              sorted={header.column.getIsSorted()}
                            />
                          </div>
                        ) : header.isPlaceholder ? null : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                        {header.column.getCanFilter() ? (
                          <ColumnFilter column={header.column} />
                        ) : null}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>
              <TBody>
                {table.getRowModel().rows.map((row) => (
                  <Tr
                    key={row.id}
                    className={clsx(
                      "relative border-y border-transparent border-b-gray-200 dark:border-b-dark-500",
                      row.getIsSelected() &&
                      !isSafari &&
                      "row-selected after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td
                        key={cell.id}
                        className={clsx(
                          "relative",
                          cardSkin === "shadow"
                            ? "dark:bg-dark-700"
                            : "dark:bg-dark-900",
                          cell.column.getCanPin() && [
                            cell.column.getIsPinned() === "left" &&
                            "sticky z-2 ltr:left-0 rtl:right-0",
                            cell.column.getIsPinned() === "right" &&
                            "sticky z-2 ltr:right-0 rtl:left-0",
                          ]
                        )}
                      >
                        {cell.column.getIsPinned() && (
                          <div
                            className={clsx(
                              "pointer-events-none absolute inset-0 border-gray-200 dark:border-dark-500",
                              cell.column.getIsPinned() === "left"
                                ? "ltr:border-r rtl:border-l"
                                : "ltr:border-l rtl:border-r"
                            )}
                          ></div>
                        )}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
          <SelectedRowsActions table={table} />
          {matrixData.length > 0 && (
            <div className="px-4 pb-4 sm:px-5 sm:pt-4">
              <PaginationSection table={table} />
            </div>
          )}
        </Card>

        {/* 2. Uncertainty Table */}
        <Card
          className={clsx(
            "relative flex grow flex-col",
            tableSettings.enableFullScreen && "overflow-hidden"
          )}
          ref={uncertaintyCardRef}
        >
          <div className="flex justify-between items-center mb-4 px-4 pt-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-50">
              Masters Validity Uncertainty Detail
            </h3>
            <Button
              className="h-8 space-x-1.5 rounded-md px-3 text-xs"
              color="primary"
              onClick={() => {
                const params = new URLSearchParams();
                if (urlParams.fid) params.append('fid', urlParams.fid);
                if (urlParams.cid) params.append('cid', urlParams.cid);
                if (urlParams.labId) params.append('labId', urlParams.labId);

                navigate(
                  `/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail/add-new-uncertainty-matrix?${params.toString()}`
                );
              }}
            >
              Add New Uncertainty Matrix
            </Button>
          </div>
          <div className="table-wrapper min-w-full grow overflow-x-auto">
            <Table
              hoverable
              dense={tableSettings.enableRowDense}
              sticky={tableSettings.enableFullScreen}
              className="w-full text-left rtl:text-right"
            >
              <THead>
                {uncertaintyTable.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        className={clsx(
                          "bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg"
                        )}
                      >
                        {header.column.getCanSort() ? (
                          <div
                            className="flex cursor-pointer select-none items-center space-x-3"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="flex-1">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                            </span>
                            <TableSortIcon
                              sorted={header.column.getIsSorted()}
                            />
                          </div>
                        ) : header.isPlaceholder ? null : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>
              <TBody>
                {uncertaintyTable.getRowModel().rows.map((row) => (
                  <Tr
                    key={row.id}
                    className={clsx(
                      "relative border-y border-transparent border-b-gray-200 dark:border-b-dark-500"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id} className="relative">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
          <SelectedRowsActions table={uncertaintyTable} />
          {uncertaintyData.length > 0 && (
            <div className="px-4 pb-4 sm:px-5 sm:pt-4">
              <PaginationSection table={uncertaintyTable} />
            </div>
          )}
        </Card>

        {/* 3. Interpolation Formula Section */}
        <Card className="relative flex grow flex-col">
          <div className="flex justify-between items-center mb-5 px-4 pt-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-50">
              Interpolation Formula Detail
            </h3>
          </div>
          <div className="border border-gray-300 rounded-md p-3 mx-4">
            <div className="flex space-x-4">
              <label className="flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-dark-200">
                  Formula
                </span>
                <Input
                  type="text"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
                  placeholder="Enter interpolation formula..."
                />
              </label>
            </div>
          </div>
          <div className="flex justify-end mt-4 px-4 pb-4">
            <Button className="h-8 px-4 text-sm" color="primary">
              Save Master Matrix
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}