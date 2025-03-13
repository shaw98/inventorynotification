"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { LOCATIONS, DRIVERS } from "@/lib/firebase/transferUtils";
import FirebaseStatus from "@/components/FirebaseStatus";

export default function InputPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    stockNumber: "",
    brand: "",
    model: "",
    driverName: "",
    customDriverName: "",
    transferDate: new Date().toISOString().split('T')[0], // Default to today's date
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomName, setUseCustomName] = useState(false);
  const [driverList, setDriverList] = useState<string[]>(DRIVERS);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If changing fromLocation and toLocation is the same, reset toLocation
    if (name === "fromLocation" && value === formData.toLocation) {
      setFormData(prev => ({ ...prev, [name]: value, toLocation: "" }));
    } 
    // If changing toLocation and fromLocation is the same, reset fromLocation
    else if (name === "toLocation" && value === formData.fromLocation) {
      setFormData(prev => ({ ...prev, [name]: value, fromLocation: "" }));
    } 
    // Normal case
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data
      if (!formData.fromLocation || !formData.toLocation || !formData.stockNumber || 
          !formData.brand || !formData.model || 
          (!formData.driverName && !useCustomName) || 
          (useCustomName && !formData.customDriverName)) {
        throw new Error("Please fill in all required fields");
      }
      
      // Prepare the data to send
      const dataToSend = {
        ...formData,
        driverName: useCustomName ? formData.customDriverName : formData.driverName,
        timestamp: new Date().toISOString(), // Keep for logging purposes
        userEmail: user?.email || "unknown",
      };
      
      // Save transfer data to Firebase via API endpoint
      if (user) {
        try {
          const response = await fetch("/api/transfers", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fromLocation: formData.fromLocation,
              toLocation: formData.toLocation,
              stockNumber: formData.stockNumber,
              brand: formData.brand,
              model: formData.model,
              driverName: useCustomName ? formData.customDriverName : formData.driverName,
              transferDate: formData.transferDate,
              userId: user.uid,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save transfer data");
          }
          
          console.log("Transfer data saved to Firebase successfully");
        } catch (apiError) {
          console.error("API error:", apiError);
          throw new Error("Failed to save transfer data to database");
        }
      }
      
      // Send the data to our notification API endpoint
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send notification");
      }
      
      // Redirect to confirmation page
      router.push(`/confirmation?stockNumber=${formData.stockNumber}&from=${formData.fromLocation}&to=${formData.toLocation}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available "To" locations based on selected "From" location
  const getAvailableToLocations = () => {
    // If Storage is selected as From, all locations are available for To
    if (formData.fromLocation === "Storage") {
      return LOCATIONS;
    }
    
    // If From is one of the restricted locations, filter it out from To options
    if (["Lakewood", "Longmont", "Fountain", "Airstream"].includes(formData.fromLocation)) {
      return LOCATIONS.filter(location => location !== formData.fromLocation);
    }
    
    // Default: all locations available
    return LOCATIONS;
  };

  // Get available "From" locations based on selected "To" location
  const getAvailableFromLocations = () => {
    // If Storage is selected as To, all locations are available for From
    if (formData.toLocation === "Storage") {
      return LOCATIONS;
    }
    
    // If To is one of the restricted locations, filter it out from From options
    if (["Lakewood", "Longmont", "Fountain", "Airstream"].includes(formData.toLocation)) {
      return LOCATIONS.filter(location => location !== formData.toLocation);
    }
    
    // Default: all locations available
    return LOCATIONS;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Where to today?</h1>
          
          <FirebaseStatus />
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* From Location */}
            <div>
              <label htmlFor="fromLocation" className="block text-sm font-medium text-gray-700 mb-1">
                From What Location
              </label>
              <select
                id="fromLocation"
                name="fromLocation"
                value={formData.fromLocation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="">Select location</option>
                {getAvailableFromLocations().map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            {/* To Location */}
            <div>
              <label htmlFor="toLocation" className="block text-sm font-medium text-gray-700 mb-1">
                To What Location
              </label>
              <select
                id="toLocation"
                name="toLocation"
                value={formData.toLocation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="">Select location</option>
                {getAvailableToLocations().map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            {/* Transfer Date */}
            <div>
              <label htmlFor="transferDate" className="block text-sm font-medium text-gray-700 mb-1">
                Transfer Date
              </label>
              <input
                type="date"
                id="transferDate"
                name="transferDate"
                value={formData.transferDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
            
            {/* Stock Number */}
            <div>
              <label htmlFor="stockNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Number
              </label>
              <input
                type="text"
                id="stockNumber"
                name="stockNumber"
                value={formData.stockNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
            
            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
            
            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
            
            {/* Driver Name */}
            <div>
              <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
                Driver Name
              </label>
              
              {!useCustomName ? (
                <select
                  id="driverName"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  required={!useCustomName}
                  disabled={useCustomName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="">Select driver</option>
                  {driverList.map(driver => (
                    <option key={driver} value={driver}>{driver}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="customDriverName"
                  name="customDriverName"
                  value={formData.customDriverName}
                  onChange={handleChange}
                  required={useCustomName}
                  placeholder="Enter driver name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              )}
              
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={useCustomName}
                    onChange={() => setUseCustomName(!useCustomName)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600">Use custom driver name</span>
                </label>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
} 