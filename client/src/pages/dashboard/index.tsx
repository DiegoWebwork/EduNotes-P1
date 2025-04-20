import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import AdminDashboard from "./admin-dashboard";
import StudentDashboard from "./student-dashboard";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [location] = useLocation();
  
  // Set page title based on location
  useEffect(() => {
    switch (location) {
      case "/":
      case "/dashboard":
        setPageTitle("Dashboard");
        break;
      case "/courses":
        setPageTitle("Manage Courses");
        break;
      case "/my-courses":
        setPageTitle("My Courses");
        break;
      case "/my-notes":
        setPageTitle("My Notes");
        break;
      case "/users":
        setPageTitle("Manage Users");
        break;
      case "/reports":
        setPageTitle("Reports");
        break;
      case "/profile":
        setPageTitle("My Profile");
        break;
      default:
        setPageTitle("Dashboard");
    }
  }, [location]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 transform transition duration-200 ease-in-out md:relative z-30 md:translate-x-0`}
      >
        <Sidebar isMobile={isMobile} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} pageTitle={pageTitle} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {user?.role === "admin" ? (
            <AdminDashboard />
          ) : (
            <StudentDashboard />
          )}
        </main>
      </div>
    </div>
  );
}
