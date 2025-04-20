import { useState } from "react";
import { Menu, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  toggleSidebar: () => void;
  pageTitle: string;
}

export default function Header({ toggleSidebar, pageTitle }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 md:hidden text-gray-500" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-medium text-gray-900">{pageTitle}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-600 focus:outline-none">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </div>
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-600 focus:outline-none">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
