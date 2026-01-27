import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "components/ui";
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PaginationSection } from "components/shared/table/PaginationSection";

const Logbook = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  // State for API data
  const [logData, setLogData] = useState([]);
  const [instrumentName, setInstrumentName] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State for table
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => info.getValue() || '-',
      },
      {
        accessorKey: 'startDateTime',
        header: 'Start Date Time',
        cell: (info) => info.getValue() || info.row.original.start_date_time || '-',
      },
      {
        accessorKey: 'endDateTime',
        header: 'End Date Time',
        cell: (info) => info.getValue() || info.row.original.end_date_time || '-',
      },
      {
        accessorKey: 'chemist',
        header: 'Chemist',
        cell: (info) => info.getValue() || info.row.original.user_name || '-',
      },
    ],
    []
  );

  // Fetch logbook data from API
  useEffect(() => {
    const fetchLogbookData = async () => {
      if (!id) {
        toast.error('No instrument ID provided');
        setTimeout(() => navigate(-1), 1500);
        return;
      }

      try {
        setLoading(true);
        console.log('📡 Fetching logbook data for instrument ID:', id);
        
        const response = await axios.get(`/material/log-book/${id}`);
        
        console.log('✅ Logbook API Response:', response.data);
        
        // Extract instrument name and data
        const instrumentInfo = response.data?.instrument || 'Unknown Instrument';
        const logbookData = response.data?.data || [];
        
        setInstrumentName(instrumentInfo);
        setLogData(logbookData);
        
        console.log('📊 Instrument:', instrumentInfo);
        console.log('📊 Logbook entries:', logbookData.length);
        
      } catch (error) {
        console.error('❌ Error fetching logbook data:', error);
        console.error('❌ Error details:', error.response?.data);
        
        const errorMsg = error.response?.data?.message || 'Failed to load logbook data';
        toast.error(errorMsg);
        
        // Set empty data on error
        setInstrumentName('Unknown Instrument');
        setLogData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogbookData();
  }, [id, navigate]);

  // Initialize React Table
  const table = useReactTable({
    data: logData,
    columns: columns,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleBackToElectroTechnical = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="flex h-[60vh] items-center justify-center text-gray-600">
          <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
          </svg>
          Loading Logbook Data...
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            maxWidth: '500px',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div style={{marginLeft:"20px"}}>
              <h1 className="text-lg font-medium text-gray-900">Log Book</h1>
              <p className="text-sm text-gray-600">{instrumentName}</p>
            </div>
            <Button
              onClick={handleBackToElectroTechnical}
              className="text-white bg-indigo-500 hover:bg-fuchsia-500 px-6 py-2"
            >
              Back
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6" style={{background:"white"}}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row, index) => (
                      <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                        No logbook entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Section - Only show when data exists */}
            {table.getFilteredRowModel().rows.length > 0 && (
              <PaginationSection table={table} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Logbook;