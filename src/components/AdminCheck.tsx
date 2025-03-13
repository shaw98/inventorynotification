"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { isUserAdmin, isUserInitialAdmin } from "@/lib/firebase/adminUtils";

export default function AdminCheck({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isInitialAdmin, setIsInitialAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsInitialAdmin(false);
        setCheckingAdmin(false);
        return;
      }
      
      try {
        const adminStatus = await isUserAdmin(user.email || "");
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          // If user is an admin, check if they are the initial admin
          const initialAdminStatus = await isUserInitialAdmin(user.email || "");
          setIsInitialAdmin(initialAdminStatus);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setIsInitialAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);
  
  useEffect(() => {
    // If not loading and either no user or user is not an admin
    if (!loading && !checkingAdmin && !isAdmin) {
      router.push("/input");
    }
  }, [isAdmin, loading, checkingAdmin, router]);
  
  // Show loading state while checking
  if (loading || checkingAdmin || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Checking access...</h2>
          <p className="text-gray-600">
            {loading || checkingAdmin ? "Loading..." : "You don't have access to this page."}
          </p>
        </div>
      </div>
    );
  }
  
  // If user is an admin, render the children with isInitialAdmin prop
  return (
    <div data-is-initial-admin={isInitialAdmin.toString()}>
      {children}
    </div>
  );
} 