import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";

export function ViewPricesModal({ isOpen, onClose, instrumentId, instrumentName }) {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && instrumentId) {
      fetchPriceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, instrumentId]);

  const fetchPriceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/calibrationoperations/get-calibrationprice-byid/${instrumentId}`
      );

      if (response.data.status) {
        setPriceData(response.data.data || []);
      } else {
        toast.error("Failed to fetch price data");
        setPriceData([]);
      }
    } catch (error) {
      console.error("Error fetching price data:", error);
      toast.error("Error loading price data");
      setPriceData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-750">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4 dark:border-dark-500">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-dark-100"
                  >
                    Calibration Price List
                    {instrumentName && (
                      <span className="ml-2 text-sm font-normal text-gray-600 dark:text-dark-300">
                        ({instrumentName})
                      </span>
                    )}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-dark-600"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="mt-4">
                  {loading ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-6 w-6 animate-spin text-blue-600"
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
                        <span className="text-gray-600 dark:text-dark-300">
                          Loading price data...
                        </span>
                      </div>
                    </div>
                  ) : priceData.length === 0 ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <p className="text-gray-500 dark:text-dark-400">
                        No price data available for this instrument.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-500">
                        <thead className="bg-gray-50 dark:bg-dark-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-dark-200">
                              ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-dark-200">
                              Package Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-dark-200">
                              Package Description
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-dark-200">
                              Accreditation
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-dark-200">
                              Location
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-dark-200">
                              Days Required
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-dark-200">
                              Rate
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-dark-200">
                              Added On
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-dark-500 dark:bg-dark-750">
                          {priceData.map((price, index) => (
                            <tr
                              key={price.id}
                              className={
                                index % 2 === 0
                                  ? "bg-white dark:bg-dark-750"
                                  : "bg-gray-50 dark:bg-dark-700/50"
                              }
                            >
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-dark-100">
                                {price.id}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-dark-100">
                                {price.packagename || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-300">
                                {price.packagedesc || "N/A"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    price.accreditation === "Nabl"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {price.accreditation || "N/A"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    price.location === "Site"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                  }`}
                                >
                                  {price.location || "N/A"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-dark-100">
                                {price.daysrequired || "N/A"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-dark-100">
                                ₹{price.rate || "0"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-dark-300">
                                {formatDate(price.added_on)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {!loading && priceData.length > 0 && (
                  <div className="mt-4 border-t pt-4 dark:border-dark-500">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-dark-300">
                      <span>
                        Showing {priceData.length} price{" "}
                        {priceData.length === 1 ? "entry" : "entries"}
                      </span>
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

ViewPricesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  instrumentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  instrumentName: PropTypes.string,
};