"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminCheck from "@/components/AdminCheck";
import {
  getAllTransfers,
  getTransferStats,
  getTransfersByDateRange,
  getTransfersByDriver,
  getTransfersByLocation,
  Transfer
} from "@/lib/firebase/transferUtils";
import { isUserInitialAdmin } from "@/lib/firebase/adminUtils";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Location options
const LOCATIONS = ["Lakewood", "Longmont", "Fountain", "Airstream", "Storage"];

export default function AdminDashboardPage() {
  return (
    <AdminCheck>
      <AdminDashboard />
    </AdminCheck>
  );
}

function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State for transfers data
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialAdmin, setIsInitialAdmin] = useState(false);
  
  // Filter state
  const [filterType, setFilterType] = useState<"all" | "date" | "driver" | "location">("all");
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [driverList, setDriverList] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>(LOCATIONS[0]);
  const [isFromLocation, setIsFromLocation] = useState<boolean>(true);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);
  
  // Check if user is initial admin
  useEffect(() => {
    const checkInitialAdminStatus = async () => {
      if (!user) return;
      
      try {
        const initialAdminStatus = await isUserInitialAdmin(user.email || "");
        setIsInitialAdmin(initialAdminStatus);
      } catch (error) {
        console.error("Error checking initial admin status:", error);
      }
    };
    
    checkInitialAdminStatus();
  }, [user]);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get all transfers
        const transfersData = await getAllTransfers();
        setTransfers(transfersData);
        
        // Get stats
        const statsData = await getTransferStats();
        setStats(statsData);
        
        // Extract unique driver names for filter dropdown
        const drivers = Array.from(new Set(transfersData.map(t => t.driverName)));
        setDriverList(drivers);
        if (drivers.length > 0) {
          setSelectedDriver(drivers[0]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  // Apply filters
  const applyFilters = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let filteredTransfers: Transfer[] = [];
      
      if (filterType === "date") {
        filteredTransfers = await getTransfersByDateRange(
          new Date(startDate),
          new Date(endDate)
        );
      } else if (filterType === "driver") {
        filteredTransfers = await getTransfersByDriver(selectedDriver);
      } else if (filterType === "location") {
        filteredTransfers = await getTransfersByLocation(selectedLocation, isFromLocation);
      } else {
        filteredTransfers = await getAllTransfers();
      }
      
      setTransfers(filteredTransfers);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle exports
  const handleExportPDF = () => {
    exportToPDF(transfers, `Inventory Transfers Report - ${filterType === "all" ? "All" : 
      filterType === "date" ? `${startDate} to ${endDate}` : 
      filterType === "driver" ? `Driver: ${selectedDriver}` :
      `Location: ${selectedLocation} (${isFromLocation ? "From" : "To"})`}`);
  };
  
  const handleExportCSV = () => {
    exportToCSV(transfers, `Inventory Transfers - ${filterType === "all" ? "All" : 
      filterType === "date" ? `${startDate} to ${endDate}` : 
      filterType === "driver" ? `Driver: ${selectedDriver}` :
      `Location: ${selectedLocation} (${isFromLocation ? "From" : "To"})`}`);
  };
  
  // Prepare chart data for drivers
  const driverChartData = {
    labels: stats ? Object.keys(stats.driverCounts) : [],
    datasets: [
      {
        label: "Transfers by Driver",
        data: stats ? Object.values(stats.driverCounts) : [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare chart data for locations
  const locationChartData = {
    labels: LOCATIONS,
    datasets: [
      {
        label: "From Location",
        data: LOCATIONS.map(
          (loc) => (stats?.fromLocationCounts[loc] || 0)
        ),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "To Location",
        data: LOCATIONS.map(
          (loc) => (stats?.toLocationCounts[loc] || 0)
        ),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Track and analyze inventory transfers</p>
            </div>
            
            {/* Only show Manage Admins button for initial admin */}
            {isInitialAdmin && (
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/admin/manage-admins")}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Manage Admins
                </button>
              </div>
            )}
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Total Transfers</h2>
              <p className="text-4xl font-bold text-blue-600">
                {isLoading ? "Loading..." : stats?.totalTransfers || 0}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Active Drivers</h2>
              <p className="text-4xl font-bold text-green-600">
                {isLoading ? "Loading..." : driverList.length || 0}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Locations</h2>
              <p className="text-4xl font-bold text-purple-600">
                {LOCATIONS.length}
              </p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Transfers</h2>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="filter-all"
                  name="filter-type"
                  value="all"
                  checked={filterType === "all"}
                  onChange={() => setFilterType("all")}
                  className="mr-2"
                />
                <label htmlFor="filter-all" className="text-gray-800 font-medium">All Transfers</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="filter-date"
                  name="filter-type"
                  value="date"
                  checked={filterType === "date"}
                  onChange={() => setFilterType("date")}
                  className="mr-2"
                />
                <label htmlFor="filter-date" className="text-gray-800 font-medium">By Date Range</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="filter-driver"
                  name="filter-type"
                  value="driver"
                  checked={filterType === "driver"}
                  onChange={() => setFilterType("driver")}
                  className="mr-2"
                />
                <label htmlFor="filter-driver" className="text-gray-800 font-medium">By Driver</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="filter-location"
                  name="filter-type"
                  value="location"
                  checked={filterType === "location"}
                  onChange={() => setFilterType("location")}
                  className="mr-2"
                />
                <label htmlFor="filter-location" className="text-gray-800 font-medium">By Location</label>
              </div>
            </div>
            
            {filterType === "date" && (
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            )}
            
            {filterType === "driver" && (
              <div className="mb-4">
                <label htmlFor="driver-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Driver
                </label>
                <select
                  id="driver-select"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs"
                >
                  {driverList.map((driver) => (
                    <option key={driver} value={driver}>
                      {driver}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {filterType === "location" && (
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <label htmlFor="location-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Location
                  </label>
                  <select
                    id="location-select"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs"
                  >
                    {LOCATIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Type
                  </label>
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="from-location"
                        name="location-direction"
                        checked={isFromLocation}
                        onChange={() => setIsFromLocation(true)}
                        className="mr-2"
                      />
                      <label htmlFor="from-location" className="text-sm text-gray-700">From Location</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="to-location"
                        name="location-direction"
                        checked={!isFromLocation}
                        onChange={() => setIsFromLocation(false)}
                        className="mr-2"
                      />
                      <label htmlFor="to-location" className="text-sm text-gray-700">To Location</label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Apply Filters"}
            </button>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Transfers by Driver</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading chart data...</p>
                </div>
              ) : stats ? (
                <div className="h-64">
                  <Pie data={driverChartData} options={{ maintainAspectRatio: false }} />
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Transfers by Location</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading chart data...</p>
                </div>
              ) : stats ? (
                <div className="h-64">
                  <Bar
                    data={locationChartData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
          
          {/* Transfers Table */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Transfers</h2>
              
              {/* Export Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleExportPDF}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                  disabled={isLoading || transfers.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  Export PDF
                </button>
                <button
                  onClick={handleExportCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                  disabled={isLoading || transfers.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export Excel
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <p>Loading transfers...</p>
              </div>
            ) : transfers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand/Model
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transfers.map((transfer) => (
                      <tr key={transfer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transfer.transferDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transfer.driverName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transfer.fromLocation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transfer.toLocation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transfer.stockNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transfer.brand} {transfer.model}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No transfers found.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 