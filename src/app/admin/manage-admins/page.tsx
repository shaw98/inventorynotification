"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminCheck from "@/components/AdminCheck";
import { 
  getAllAdmins, 
  addAdminUser, 
  removeAdminUser, 
  AdminUser,
  isUserInitialAdmin
} from "@/lib/firebase/adminUtils";

function AdminManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // State
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isInitialAdmin, setIsInitialAdmin] = useState(false);
  
  // Check if user is initial admin
  useEffect(() => {
    const checkInitialAdminStatus = async () => {
      if (!user) {
        router.push("/admin");
        return;
      }
      
      try {
        const initialAdminStatus = await isUserInitialAdmin(user.email || "");
        setIsInitialAdmin(initialAdminStatus);
        
        if (!initialAdminStatus) {
          // If not initial admin, redirect back to admin dashboard
          router.push("/admin");
        }
      } catch (error) {
        console.error("Error checking initial admin status:", error);
        router.push("/admin");
      }
    };
    
    checkInitialAdminStatus();
  }, [user, router]);
  
  // Load admins
  useEffect(() => {
    const loadAdmins = async () => {
      if (!user || !isInitialAdmin) return;
      
      setIsLoading(true);
      try {
        const adminsList = await getAllAdmins();
        setAdmins(adminsList);
      } catch (error) {
        console.error("Error loading admins:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isInitialAdmin) {
      loadAdmins();
    }
  }, [user, isInitialAdmin]);
  
  // Add admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail) {
      setError("Email is required");
      return;
    }
    
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      const result = await addAdminUser(
        newAdminEmail,
        newAdminName,
        user?.email || ""
      );
      
      if (result) {
        setSuccess(`Admin ${newAdminEmail} added successfully`);
        setNewAdminEmail("");
        setNewAdminName("");
        
        // Refresh admin list
        const adminsList = await getAllAdmins();
        setAdmins(adminsList);
      } else {
        setError("Failed to add admin");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      setError("An error occurred while adding the admin");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove admin
  const handleRemoveAdmin = async (id: string, email: string) => {
    // Don't allow removing yourself
    if (email === user?.email) {
      setError("You cannot remove yourself as an admin");
      return;
    }
    
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      const result = await removeAdminUser(id);
      
      if (result) {
        setSuccess(`Admin ${email} removed successfully`);
        
        // Refresh admin list
        const adminsList = await getAllAdmins();
        setAdmins(adminsList);
      } else {
        setError("Failed to remove admin");
      }
    } catch (error) {
      console.error("Error removing admin:", error);
      setError("An error occurred while removing the admin");
    } finally {
      setIsLoading(false);
    }
  };
  
  // If not initial admin, show access denied
  if (!isInitialAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Only the initial admin can manage other admins.
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Admins</h1>
              <p className="text-gray-600">Add or remove admin users</p>
            </div>
            
            <button
              onClick={() => router.push("/admin")}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          
          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          {/* Add Admin Form */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Admin</h2>
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  placeholder="John Doe"
                />
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Admin"}
              </button>
            </form>
          </div>
          
          {/* Admin List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Admins</h2>
            
            {isLoading ? (
              <div className="text-center py-4">Loading admins...</div>
            ) : admins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added On
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin.id} className={admin.email === user?.email ? "bg-blue-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {admin.email}
                          {admin.email === user?.email && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.addedBy || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.addedAt?.toLocaleDateString() || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => admin.id && handleRemoveAdmin(admin.id, admin.email)}
                            className={`text-red-600 hover:text-red-900 ${
                              admin.email === user?.email ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={admin.email === user?.email}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No admins found.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminManagementPageWithCheck() {
  return <AdminManagementPage />;
} 