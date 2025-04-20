import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, Book, Users, BarChart2, StickyNote, User,
  LogOut, Menu, X 
} from "lucide-react";

interface SidebarProps {
  isMobile: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isMobile, toggleSidebar }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const isAdmin = user?.role === "admin";
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <div className="bg-white w-64 h-full flex flex-col shadow-md">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">EduNotes</h1>
          {isMobile && (
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-600 focus:outline-none">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">Sistema de Gestão</p>
      </div>

      <div className="pt-2 pb-4">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4F46E5&color=fff`} />
              <AvatarFallback className="bg-primary text-white">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">{isAdmin ? 'Administrator' : 'Student'}</p>
            </div>
          </div>
        </div>

        <nav className="mt-5 px-3 space-y-1">
          {isAdmin ? (
            // Admin Links
            <>
              <NavLink 
                icon={<Home className="h-4 w-4 mr-3" />} 
                label="Dashboard" 
                active={location === "/" || location === "/dashboard"} 
                onClick={() => handleNavigation("/")} 
              />
              <NavLink 
                icon={<Book className="h-4 w-4 mr-3" />} 
                label="Manage Courses" 
                active={location === "/courses"} 
                onClick={() => handleNavigation("/courses")} 
              />
              <NavLink 
                icon={<Users className="h-4 w-4 mr-3" />} 
                label="Manage Users" 
                active={location === "/users"} 
                onClick={() => handleNavigation("/users")} 
              />
              <NavLink 
                icon={<BarChart2 className="h-4 w-4 mr-3" />} 
                label="Reports" 
                active={location === "/reports"} 
                onClick={() => handleNavigation("/reports")} 
              />
              <NavLink 
                icon={<User className="h-4 w-4 mr-3" />} 
                label="My Profile" 
                active={location === "/profile"} 
                onClick={() => handleNavigation("/profile")} 
              />
            </>
          ) : (
            // Student Links
            <>
              <NavLink 
                icon={<Home className="h-4 w-4 mr-3" />} 
                label="Dashboard" 
                active={location === "/" || location === "/dashboard"} 
                onClick={() => handleNavigation("/")} 
              />
              <NavLink 
                icon={<Book className="h-4 w-4 mr-3" />} 
                label="My Courses" 
                active={location === "/my-courses"} 
                onClick={() => handleNavigation("/my-courses")} 
              />
              <NavLink 
                icon={<Users className="h-4 w-4 mr-3" />} 
                label="Available Courses" 
                active={location === "/available-courses"} 
                onClick={() => handleNavigation("/available-courses")} 
              />
              <NavLink 
                icon={<StickyNote className="h-4 w-4 mr-3" />} 
                label="My Notes" 
                active={location === "/my-notes"} 
                onClick={() => handleNavigation("/my-notes")} 
              />
              <NavLink 
                icon={<User className="h-4 w-4 mr-3" />} 
                label="My Profile" 
                active={location === "/profile"} 
                onClick={() => handleNavigation("/profile")} 
              />
            </>
          )}
        </nav>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 mt-auto">
        <Button
          variant="ghost"
          className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:bg-gray-100"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavLink({ icon, label, active, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md",
        active 
          ? "bg-primary text-white" 
          : "text-gray-900 hover:bg-gray-100"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
