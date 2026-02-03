// Import Dependencies
import clsx from "clsx";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router";

import { Button, Input } from "components/ui";
import { TableConfig } from "./TableConfig";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";

// ----------------------------------------------------------------------

export function Toolbar({ table }) {
  const { isXs } = useBreakpointsContext();
  const isFullScreenEnabled = table.getState().tableSettings.enableFullScreen;
  const navigate = useNavigate();

  // Get filter states from table meta
  const {
    docType,
    setDocType,
    searchField,
    setSearchField,
    searchValue,
    setSearchValue,
    handleSearch,
  } = table.options.meta;

  return (
    <div className="table-toolbar">
      <div
        className={clsx(
          "transition-content flex items-center justify-between gap-4",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x) pt-4",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Heading */}
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
              View Master Document
            </h2>
          </div>

          {/* Button */}
          <div>
            <Button
              onClick={() => navigate("/dashboards/master-data/document-master/add")}
              className="h-9 rounded-md px-4 text-sm font-medium"
              color="primary"
            >
              + Add Master Document
            </Button>
          </div>
        </div>

        {isXs ? (
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton
              as={Button}
              variant="flat"
              className="size-8 shrink-0 rounded-full p-0"
            >
              <EllipsisHorizontalIcon className="size-4.5" />
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
                    className={clsx(
                      "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                    )}
                  >
                    <span>Share Selected</span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={clsx(
                      "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                    )}
                  >
                    <span>Export as PDF</span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={clsx(
                      "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                    )}
                  >
                    <span>Export as CSV</span>
                  </button>
                )}
              </MenuItem>
            </Transition>
          </Menu>
        ) : (
          <div className="flex space-x-2">
            <TableConfig table={table} />
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div
        className={clsx(
          "transition-content flex items-end justify-between gap-6 pb-4 pt-6",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x)",
        )}
      >
        {/* Doc In Section */}
        <div className="flex flex-col gap-2 w-48">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Doc in :
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="h-8 px-3 py-1 text-xs border border-gray-300 rounded bg-white dark:bg-dark-700 dark:border-dark-500 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="active">Active</option>
            <option value="obsolete">Obsolete</option>
            <option value="pending">Pending</option>
            <option value="save">Save</option>
          </select>
        </div>

        {/* Search In Section */}
        <div className="flex flex-col gap-2 w-48">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Search in :
          </label>
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="h-8 px-3 py-1 text-xs border border-gray-300 rounded bg-white dark:bg-dark-700 dark:border-dark-500 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All</option>
            <option value="name">Name</option>
            <option value="Code">Document No./Procedure No</option>
          </select>
        </div>

        {/* Value Section */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Value :
          </label>
          <div className="flex gap-2">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              classNames={{
                input: "h-8 text-xs ring-primary-500/50 focus:ring-3",
                root: "flex-1 max-w-md",
              }}
              placeholder="Search by name or document no..."
            />
            <Button
              onClick={handleSearch}
              className="h-8 rounded px-4 text-xs font-medium"
              color="primary"
            >
              Go
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}