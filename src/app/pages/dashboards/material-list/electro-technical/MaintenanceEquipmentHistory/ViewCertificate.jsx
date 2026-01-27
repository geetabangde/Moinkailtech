import { useState, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "components/ui";

// ViewCertificate Component - Displays PDF certificate with modern UI
export const ViewCertificate = ({ fileUrl, fileName, onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset loading state when URL changes
    setIsLoading(true);
  }, [fileUrl]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "certificate.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ${
        isFullScreen ? "p-0" : "p-4 sm:p-6 md:p-8"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative flex flex-col bg-white shadow-2xl transition-all duration-300 dark:bg-dark-800 ${
          isFullScreen
            ? "h-full w-full rounded-none"
            : "h-full max-h-[90vh] w-full max-w-6xl rounded-xl"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-3 dark:border-dark-700 dark:from-dark-900 dark:to-dark-800 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                View Certificate
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fileName || "Certificate Document"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-dark-600 dark:bg-dark-700 sm:flex">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="rounded p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-dark-600"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>
              <span className="min-w-[3rem] text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="rounded p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-dark-600"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="rounded-lg border border-gray-200 bg-white p-2 transition-all hover:bg-gray-50 dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600"
              title="Download Certificate"
            >
              <Download className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullScreen}
              className="rounded-lg border border-gray-200 bg-white p-2 transition-all hover:bg-gray-50 dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600"
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              ) : (
                <Maximize2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white p-2 transition-all hover:bg-red-50 hover:border-red-200 dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-red-900/20"
              title="Close"
            >
              <X className="h-4 w-4 text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="relative flex-1 overflow-auto bg-gray-100 dark:bg-dark-900">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-dark-900/80">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 animate-spin text-blue-600"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
                  />
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Loading certificate...
                </p>
              </div>
            </div>
          )}

          <div className="flex h-full items-center justify-center p-4">
            <iframe
              src={`${fileUrl}#view=FitH`}
              className="h-full w-full rounded-lg border-2 border-gray-200 bg-white shadow-xl transition-all duration-300 dark:border-dark-700"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center top",
              }}
              title="Certificate PDF"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-dark-700 dark:bg-dark-900 sm:px-6">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>PDF Document Viewer</span>
            <span>Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to handle ESC key for closing modal
export const useEscapeKey = (callback) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        callback();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [callback]);
};