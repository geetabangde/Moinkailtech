// import {
//   flexRender,
//   getCoreRowModel,
//   getExpandedRowModel,
//   getFacetedMinMaxValues,
//   getFacetedUniqueValues,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import clsx from "clsx";
// import { Fragment, useRef, useState } from "react";

// // Local Imports
// import { TableSortIcon } from "components/shared/table/TableSortIcon";
// import { ColumnFilter } from "components/shared/table/ColumnFilter";
// import { PaginationSection } from "components/shared/table/PaginationSection";
// import { Button, Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
// import {
//   useBoxSize,
//   useLockScrollbar,
//   useLocalStorage,
//   useDidUpdate,
// } from "hooks";
// import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
// import { useSkipper } from "utils/react-table/useSkipper";
// import { SelectedRowsActions } from "./SelectedRowsActions";
// import { SubRowComponent } from "./SubRowComponent";



// // ✅ Replace with new Validity Details columns
// import { columns  } from "./columns";

// // ✅ Replace with Validity Details data
// import { validityDetailsList } from "./data";

// import { Toolbar } from "./Toolbar";
// import { useThemeContext } from "app/contexts/theme/context";
// import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";
// import { useNavigate } from "react-router";

// const isSafari = getUserAgentBrowser() === "Safari";

// export default function ValidityDetailsTable() {
//   const { cardSkin } = useThemeContext();
//   const navigate = useNavigate();

//   const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

//   // ✅ Validity Data
//   const [validityData, setValidityData] = useState([...validityDetailsList]);

//   const [tableSettings, setTableSettings] = useState({
//     enableSorting: true,
//     enableColumnFilters: true,
//     enableFullScreen: false,
//     enableRowDense: false,
//   });

//   const [globalFilter, setGlobalFilter] = useState("");
//   const [sorting, setSorting] = useState([]);

//   const [columnVisibility, setColumnVisibility] = useLocalStorage(
//     "column-visibility-validity",
//     {},
//   );

//   const [columnPinning, setColumnPinning] = useLocalStorage(
//     "column-pinning-validity",
//     {},
//   );

//   const cardRef = useRef();
//   const { width: cardWidth } = useBoxSize({ ref: cardRef });

//   const table = useReactTable({
//     data: validityData,
//     columns: columns,
//     state: {
//       globalFilter,
//       sorting,
//       columnVisibility,
//       columnPinning,
//       tableSettings,
//     },
//     meta: {
//       setTableSettings,
//       deleteRow: (row) => {
//         skipAutoResetPageIndex();
//         setValidityData((old) =>
//           old.filter(
//             (oldRow) => oldRow.unit_type !== row.original.unit_type
//           )
//         );
//       },
//       deleteRows: (rows) => {
//         skipAutoResetPageIndex();
//         const rowIds = rows.map((row) => row.original.unit_type);
//         setValidityData((old) =>
//           old.filter((row) => !rowIds.includes(row.unit_type))
//         );
//       },
//     },
//     filterFns: { fuzzy: fuzzyFilter },
//     enableSorting: tableSettings.enableSorting,
//     enableColumnFilters: tableSettings.enableColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     onGlobalFilterChange: setGlobalFilter,
//     getFilteredRowModel: getFilteredRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getFacetedMinMaxValues: getFacetedMinMaxValues(),
//     globalFilterFn: fuzzyFilter,
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     getExpandedRowModel: getExpandedRowModel(),
//     getRowCanExpand: () => true,
//     getPaginationRowModel: getPaginationRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onColumnPinningChange: setColumnPinning,
//     autoResetPageIndex,
//   });

//   useDidUpdate(() => table.resetRowSelection(), [validityData]);
//   useLockScrollbar(tableSettings.enableFullScreen);

//   return (
//     <div className="transition-content grid grid-cols-1 grid-rows-[auto_auto_1fr] px-(--margin-x) py-4">
//       <div className="flex items-center justify-between space-x-4">
//         <div className="min-w-0">
//           <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
//             Masters Validity Detail
//           </h2>
//         </div>
//         {/* Right Side Actions */}
//      <div className="flex flex-wrap items-center gap-3">
//   {/* Back button first */}
//   <Button
//     className="h-8 space-x-1.5 rounded-md px-3 text-xs"
//     color="primary"
//     onClick={() =>
//       navigate(
//         "/dashboards/material-list/electro-technical/maintenance-equipment-history"
//       )
//     }
//   >
//     ← Back To Master Validity
//   </Button>

//   {/* Add button second */}
//   <Button
//     className="h-8 space-x-1.5 rounded-md px-3 text-xs"
//     color="primary"
//     onClick={() =>
//       navigate(
//         "/dashboards/material-list/electro-technical/maintenance-equipment-history/add-new-equipment-history"
//       )
//     }
//   >
//     Add New Master Matrix
//   </Button>
// </div>

//       </div>

//       <div
//         className={clsx(
//           "flex flex-col pt-4",
//           tableSettings.enableFullScreen &&
//             "fixed inset-0 z-61 h-full w-full bg-white pt-3 dark:bg-dark-900"
//         )}
//       >
//         <Toolbar table={table} />
//         <Card
//           className={clsx(
//             "relative mt-3 flex grow flex-col",
//             tableSettings.enableFullScreen && "overflow-hidden"
//           )}
//           ref={cardRef}
//         >
//           <div className="table-wrapper min-w-full grow overflow-x-auto">
//             <Table
//               hoverable
//               dense={tableSettings.enableRowDense}
//               sticky={tableSettings.enableFullScreen}
//               className="w-full text-left rtl:text-right"
//             >
//               <THead>
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <Tr key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => (
//                       <Th
//                         key={header.id}
//                         className={clsx(
//                           "bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg",
//                           header.column.getCanPin() && [
//                             header.column.getIsPinned() === "left" &&
//                               "sticky z-2 ltr:left-0 rtl:right-0",
//                             header.column.getIsPinned() === "right" &&
//                               "sticky z-2 ltr:right-0 rtl:left-0",
//                           ]
//                         )}
//                       >
//                         {header.column.getCanSort() ? (
//                           <div
//                             className="flex cursor-pointer select-none items-center space-x-3"
//                             onClick={header.column.getToggleSortingHandler()}
//                           >
//                             <span className="flex-1">
//                               {header.isPlaceholder
//                                 ? null
//                                 : flexRender(
//                                     header.column.columnDef.header,
//                                     header.getContext()
//                                   )}
//                             </span>
//                             <TableSortIcon
//                               sorted={header.column.getIsSorted()}
//                             />
//                           </div>
//                         ) : header.isPlaceholder ? null : (
//                           flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )
//                         )}
//                         {header.column.getCanFilter() ? (
//                           <ColumnFilter column={header.column} />
//                         ) : null}
//                       </Th>
//                     ))}
//                   </Tr>
//                 ))}
//               </THead>
//               <TBody>
//                 {table.getRowModel().rows.map((row) => (
//                   <Fragment key={row.id}>
//                     <Tr
//                       className={clsx(
//                         "relative border-y border-transparent border-b-gray-200 dark:border-b-dark-500",
//                         row.getIsExpanded() && "border-dashed",
//                         row.getIsSelected() &&
//                           !isSafari &&
//                           "row-selected after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500"
//                       )}
//                     >
//                       {row.getVisibleCells().map((cell) => (
//                         <Td
//                           key={cell.id}
//                           className={clsx(
//                             "relative",
//                             cardSkin === "shadow"
//                               ? "dark:bg-dark-700"
//                               : "dark:bg-dark-900",
//                             cell.column.getCanPin() && [
//                               cell.column.getIsPinned() === "left" &&
//                                 "sticky z-2 ltr:left-0 rtl:right-0",
//                               cell.column.getIsPinned() === "right" &&
//                                 "sticky z-2 ltr:right-0 rtl:left-0",
//                             ]
//                           )}
//                         >
//                           {cell.column.getIsPinned() && (
//                             <div
//                               className={clsx(
//                                 "pointer-events-none absolute inset-0 border-gray-200 dark:border-dark-500",
//                                 cell.column.getIsPinned() === "left"
//                                   ? "ltr:border-r rtl:border-l"
//                                   : "ltr:border-l rtl:border-r"
//                               )}
//                             ></div>
//                           )}
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext()
//                           )}
//                         </Td>
//                       ))}
//                     </Tr>
//                     {row.getIsExpanded() && (
//                       <tr>
//                         <td
//                           colSpan={row.getVisibleCells().length}
//                           className="p-0"
//                         >
//                           <SubRowComponent row={row} cardWidth={cardWidth} />
//                         </td>
//                       </tr>
//                     )}
//                   </Fragment>
//                 ))}
//               </TBody>
//             </Table>
//           </div>
//           <SelectedRowsActions table={table} />
//           {table.getCoreRowModel().rows.length && (
//             <div
//               className={clsx(
//                 "px-4 pb-4 sm:px-5 sm:pt-4",
//                 tableSettings.enableFullScreen && "bg-gray-50 dark:bg-dark-800",
//                 !(
//                   table.getIsSomeRowsSelected() ||
//                   table.getIsAllRowsSelected()
//                 ) && "pt-4"
//               )}
//             >
//               <PaginationSection table={table} />
//             </div>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// }


// import {
//   flexRender,
//   getCoreRowModel,
//   getExpandedRowModel,
//   getFacetedMinMaxValues,
//   getFacetedUniqueValues,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import clsx from "clsx";
// import { Fragment, useRef, useState } from "react";

// // Local Imports
// import { TableSortIcon } from "components/shared/table/TableSortIcon";
// import { ColumnFilter } from "components/shared/table/ColumnFilter";
// import { PaginationSection } from "components/shared/table/PaginationSection";
// import { Button, Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
// import {
//   useBoxSize,
//   useLockScrollbar,
//   useLocalStorage,
//   useDidUpdate,
// } from "hooks";
// import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
// import { useSkipper } from "utils/react-table/useSkipper";
// import { SelectedRowsActions } from "./SelectedRowsActions";
// import { SubRowComponent } from "./SubRowComponent";

// // ✅ Replace with new Validity Details columns
// import { columns } from "./columns";  // Only main columns, uncertinity in sub

// // ✅ Replace with Validity Details data
// import { validityDetailsList } from "./data";  // Nested data now

// import { Toolbar } from "./Toolbar";
// import { useThemeContext } from "app/contexts/theme/context";
// import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";
// import { useNavigate } from "react-router";

// const isSafari = getUserAgentBrowser() === "Safari";

// export default function ValidityDetailsTable() {
//   const { cardSkin } = useThemeContext();
//   const navigate = useNavigate();

//   const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

//   // ✅ Validity Data (nested with uncertinity)
//   const [validityData, setValidityData] = useState([...validityDetailsList]);

//   const [tableSettings, setTableSettings] = useState({
//     enableSorting: true,
//     enableColumnFilters: true,
//     enableFullScreen: false,
//     enableRowDense: false,
//   });

//   const [globalFilter, setGlobalFilter] = useState("");
//   const [sorting, setSorting] = useState([]);

//   const [columnVisibility, setColumnVisibility] = useLocalStorage(
//     "column-visibility-validity",
//     {},
//   );

//   const [columnPinning, setColumnPinning] = useLocalStorage(
//     "column-pinning-validity",
//     {},
//   );

//   const cardRef = useRef();
//   const { width: cardWidth } = useBoxSize({ ref: cardRef });

//   const table = useReactTable({
//     data: validityData,
//     columns: columns,  // Only main columns
//     state: {
//       globalFilter,
//       sorting,
//       columnVisibility,
//       columnPinning,
//       tableSettings,
//     },
//     meta: {
//       setTableSettings,
//       deleteRow: (row) => {
//         skipAutoResetPageIndex();
//         setValidityData((old) =>
//           old.filter(
//             (oldRow) => oldRow.unit_type !== row.original.unit_type
//           )
//         );
//       },
//       deleteRows: (rows) => {
//         skipAutoResetPageIndex();
//         const rowIds = rows.map((row) => row.original.unit_type);
//         setValidityData((old) =>
//           old.filter((row) => !rowIds.includes(row.unit_type))
//         );
//       },
//     },
//     filterFns: { fuzzy: fuzzyFilter },
//     enableSorting: tableSettings.enableSorting,
//     enableColumnFilters: tableSettings.enableColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     onGlobalFilterChange: setGlobalFilter,
//     getFilteredRowModel: getFilteredRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getFacetedMinMaxValues: getFacetedMinMaxValues(),
//     globalFilterFn: fuzzyFilter,
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     getExpandedRowModel: getExpandedRowModel(),
//     getRowCanExpand: () => true,
//     getPaginationRowModel: getPaginationRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onColumnPinningChange: setColumnPinning,
//     autoResetPageIndex,
//   });

//   useDidUpdate(() => table.resetRowSelection(), [validityData]);
//   useLockScrollbar(tableSettings.enableFullScreen);

//   return (
//     <div className="transition-content grid grid-cols-1 grid-rows-[auto_auto_1fr] px-(--margin-x) py-4">
//       <div className="flex items-center justify-between space-x-4">
//         <div className="min-w-0">
//           <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
//             Masters Validity Detail
//           </h2>
//         </div>
//         {/* Right Side Actions */}
//         <div className="flex flex-wrap items-center gap-3">
//           {/* Back button first */}
//           <Button
//             className="h-8 space-x-1.5 rounded-md px-3 text-xs"
//             color="primary"
//             onClick={() =>
//               navigate(
//                 "/dashboards/material-list/electro-technical/maintenance-equipment-history"
//               )
//             }
//           >
//             ← Back To Master Validity
//           </Button>

//           {/* Add button second */}
//           <Button
//             className="h-8 space-x-1.5 rounded-md px-3 text-xs"
//             color="primary"
//             onClick={() =>
//               navigate(
//                 "/dashboards/material-list/electro-technical/maintenance-equipment-history/add-new-equipment-history"
//               )
//             }
//           >
//             Add New Master Matrix
//           </Button>
//         </div>
//       </div>

//       <div
//         className={clsx(
//           "flex flex-col pt-4",
//           tableSettings.enableFullScreen &&
//             "fixed inset-0 z-61 h-full w-full bg-white pt-3 dark:bg-dark-900"
//         )}
//       >
//         <Toolbar table={table} />
//         <Card
//           className={clsx(
//             "relative mt-3 flex grow flex-col",
//             tableSettings.enableFullScreen && "overflow-hidden"
//           )}
//           ref={cardRef}
//         >
//           <div className="table-wrapper min-w-full grow overflow-x-auto">
//             <Table
//               hoverable
//               dense={tableSettings.enableRowDense}
//               sticky={tableSettings.enableFullScreen}
//               className="w-full text-left rtl:text-right"
//             >
//               <THead>
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <Tr key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => (
//                       <Th
//                         key={header.id}
//                         className={clsx(
//                           "bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg",
//                           header.column.getCanPin() && [
//                             header.column.getIsPinned() === "left" &&
//                               "sticky z-2 ltr:left-0 rtl:right-0",
//                             header.column.getIsPinned() === "right" &&
//                               "sticky z-2 ltr:right-0 rtl:left-0",
//                           ]
//                         )}
//                       >
//                         {header.column.getCanSort() ? (
//                           <div
//                             className="flex cursor-pointer select-none items-center space-x-3"
//                             onClick={header.column.getToggleSortingHandler()}
//                           >
//                             <span className="flex-1">
//                               {header.isPlaceholder
//                                 ? null
//                                 : flexRender(
//                                     header.column.columnDef.header,
//                                     header.getContext()
//                                   )}
//                             </span>
//                             <TableSortIcon
//                               sorted={header.column.getIsSorted()}
//                             />
//                           </div>
//                         ) : header.isPlaceholder ? null : (
//                           flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )
//                         )}
//                         {header.column.getCanFilter() ? (
//                           <ColumnFilter column={header.column} />
//                         ) : null}
//                       </Th>
//                     ))}
//                   </Tr>
//                 ))}
//               </THead>
//               <TBody>
//                 {table.getRowModel().rows.map((row) => (
//                   <Fragment key={row.id}>
//                     <Tr
//                       className={clsx(
//                         "relative border-y border-transparent border-b-gray-200 dark:border-b-dark-500",
//                         row.getIsExpanded() && "border-dashed",
//                         row.getIsSelected() &&
//                           !isSafari &&
//                           "row-selected after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500"
//                       )}
//                     >
//                       {row.getVisibleCells().map((cell) => (
//                         <Td
//                           key={cell.id}
//                           className={clsx(
//                             "relative",
//                             cardSkin === "shadow"
//                               ? "dark:bg-dark-700"
//                               : "dark:bg-dark-900",
//                             cell.column.getCanPin() && [
//                               cell.column.getIsPinned() === "left" &&
//                                 "sticky z-2 ltr:left-0 rtl:right-0",
//                               cell.column.getIsPinned() === "right" &&
//                                 "sticky z-2 ltr:right-0 rtl:left-0",
//                             ]
//                           )}
//                         >
//                           {cell.column.getIsPinned() && (
//                             <div
//                               className={clsx(
//                                 "pointer-events-none absolute inset-0 border-gray-200 dark:border-dark-500",
//                                 cell.column.getIsPinned() === "left"
//                                   ? "ltr:border-r rtl:border-l"
//                                   : "ltr:border-l rtl:border-r"
//                               )}
//                             ></div>
//                           )}
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext()
//                           )}
//                         </Td>
//                       ))}
//                     </Tr>
//                     {row.getIsExpanded() && (
//                       <tr>
//                         <td
//                           colSpan={row.getVisibleCells().length}
//                           className="p-0"
//                         >
//                           <SubRowComponent row={row} cardWidth={cardWidth} />
//                         </td>
//                       </tr>
//                     )}
//                   </Fragment>
//                 ))}
//               </TBody>
//             </Table>
//           </div>
//           <SelectedRowsActions table={table} />
//           {table.getCoreRowModel().rows.length && (
//             <div
//               className={clsx(
//                 "px-4 pb-4 sm:px-5 sm:pt-4",
//                 tableSettings.enableFullScreen && "bg-gray-50 dark:bg-dark-800",
//                 !(
//                   table.getIsSomeRowsSelected() ||
//                   table.getIsAllRowsSelected()
//                 ) && "pt-4"
//               )}
//             >
//               <PaginationSection table={table} />
//             </div>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// }













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
import { useRef, useState } from "react";

// Local Imports
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { ColumnFilter } from "components/shared/table/ColumnFilter";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { Button, Card, Table, THead, TBody, Th, Tr,Input, Td } from "components/ui";
import {
  
  useLockScrollbar,
  useLocalStorage,
  useDidUpdate,
} from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { SelectedRowsActions } from "./SelectedRowsActions";

// ✅ Replace with new Validity Details columns
import { columns, uncertinityColumns } from "./columns";

// ✅ Replace with Validity Details data
import { validityDetailsList, uncertinityDetailsList } from "./data";

import { Toolbar } from "./Toolbar";
import { useThemeContext } from "app/contexts/theme/context";
import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";
import { useNavigate } from "react-router";

const isSafari = getUserAgentBrowser() === "Safari";

export default function ValidityDetailsTable() {
  const { cardSkin } = useThemeContext();
  const navigate = useNavigate();

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // ✅ Validity Data
  const [validityData, setValidityData] = useState([...validityDetailsList]);
  
  // ✅ uncertinity Data
  const [uncertinityData, setuncertinityData] = useState([...uncertinityDetailsList]);

  const [tableSettings, setTableSettings] = useState({
    enableSorting: true,
    enableColumnFilters: true,
    enableFullScreen: false,
    enableRowDense: false,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [uncertinityGlobalFilter, setuncertinityGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [uncertinitySorting, setuncertinitySorting] = useState([]);

  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-validity",
    {},
  );

  const [uncertinityColumnVisibility, setuncertinityColumnVisibility] = useLocalStorage(
    "column-visibility-uncertinity",
    {},
  );

  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-validity",
    {},
  );

  const cardRef = useRef();
  const uncertinityCardRef = useRef();
 
  // Main Validity Table
  const table = useReactTable({
    data: validityData,
    columns: columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
    },
    meta: {
      setTableSettings,
      deleteRow: (row) => {
        skipAutoResetPageIndex();
        setValidityData((old) =>
          old.filter(
            (oldRow) => oldRow.unit_type !== row.original.unit_type
          )
        );
      },
      deleteRows: (rows) => {
        skipAutoResetPageIndex();
        const rowIds = rows.map((row) => row.original.unit_type);
        setValidityData((old) =>
          old.filter((row) => !rowIds.includes(row.unit_type))
        );
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
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    autoResetPageIndex,
  });

  // uncertinity Table
  const uncertinityTable = useReactTable({
    data: uncertinityData,
    columns: uncertinityColumns,
    state: {
      globalFilter: uncertinityGlobalFilter,
      sorting: uncertinitySorting,
      columnVisibility: uncertinityColumnVisibility,
    },
    meta: {
      isUncertinityTable: true,

      deleteRow: (row) => {
        skipAutoResetPageIndex();
        setuncertinityData((old) =>
          old.filter(
            (oldRow) => oldRow.unit_type !== row.original.unit_type
          )
        );
      },
      deleteRows: (rows) => {
        skipAutoResetPageIndex();
        const rowIds = rows.map((row) => row.original.unit_type);
        setuncertinityData((old) =>
          old.filter((row) => !rowIds.includes(row.unit_type))
        );
      },
    },
    filterFns: { fuzzy: fuzzyFilter },
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setuncertinityGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setuncertinitySorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setuncertinityColumnVisibility,
    autoResetPageIndex,
  });

  useDidUpdate(() => table.resetRowSelection(), [validityData]);
  useDidUpdate(() => uncertinityTable.resetRowSelection(), [uncertinityData]);
  useLockScrollbar(tableSettings.enableFullScreen);

  return (
    <div className="transition-content grid grid-cols-1 grid-rows-[auto_auto_1fr] px-(--margin-x) py-4">
      <div className="flex items-center justify-between space-x-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Masters Validity Detail
          </h2>
        </div>
        {/* Right Side Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Back button first */}
          <Button
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            color="primary"
            onClick={() =>
              navigate(
                "/dashboards/material-list/electro-technical/maintenance-equipment-history"
              )
            }
          >
            ← Back To Master Validity
          </Button>

          {/* Add button second */}
          <Button
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            color="primary"
            onClick={() =>
              navigate(
                "/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail/add-new-master-matrix"
              )
            }
          >
            Add New Master Matrix
          </Button>
        </div>
      </div>

      <div className="flex flex-col pt-4 space-y-6">
        {/* 1. Main Validity Table */}
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
          {table.getCoreRowModel().rows.length && (
            <div
              className={clsx(
                "px-4 pb-4 sm:px-5 sm:pt-4",
                tableSettings.enableFullScreen && "bg-gray-50 dark:bg-dark-800",
                !(
                  table.getIsSomeRowsSelected() ||
                  table.getIsAllRowsSelected()
                ) && "pt-4"
              )}
            >
              <PaginationSection table={table} />
            </div>
          )}
        </Card>

        {/* 2. uncertinity Table */}
        <Card
          className={clsx(
            "relative flex grow flex-col",
            tableSettings.enableFullScreen && "overflow-hidden"
          )}
          ref={uncertinityCardRef}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-50">
              Masters Validity uncertinity Detail
            </h3>
            <Button
             className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            color="primary"
            onClick={() =>
              navigate(
                "/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail/add-new-uncertinity-matrix"
              )
            }>
              Add New uncertinity Matrix
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
                {uncertinityTable.getHeaderGroups().map((headerGroup) => (
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
                {uncertinityTable.getRowModel().rows.map((row) => (
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
          <SelectedRowsActions table={uncertinityTable} />
          {uncertinityTable.getCoreRowModel().rows.length && (
            <div className="px-4 pb-4 sm:px-5 sm:pt-4">
              <PaginationSection table={uncertinityTable} />
            </div>
          )}
        </Card>

        {/* 3. Interpolation Formula Section */}
        <Card className="relative flex grow flex-col">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-50">
              Interpolation Formula Detail
            </h3>
          </div>
          <div className="border border-gray-300 rounded-md p-3">
            <div className="flex space-x-4">
              <label className="flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-dark-200">Formula</span>
                <Input
                  type="text"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
                  placeholder="Enter interpolation formula..."
                 
                />
              </label>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              className="h-8 px-4 text-sm"
              color="primary"
            >
              Save Master Matrix
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}