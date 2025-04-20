import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatTimeAgo } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Home, Book, Users, BarChart2, Plus, UserPlus, PieChart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CourseList from "@/components/courses/course-list";
import ReportsView from "@/components/reports/reports-view";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  
  // Determine which component to show based on the location
  const renderContent = () => {
    if (location === "/courses") {
      return <CourseList />;
    } else if (location === "/reports") {
      return <ReportsView />;
    } else if (location === "/users") {
      return <UsersList />;
    } else {
      return <DashboardHome />;
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}

function DashboardHome() {
  // Fetch statistics data
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/courses"],
  });
  
  const { data: reportsData, isLoading: isLoadingReports } = useQuery({
    queryKey: ["/api/reports/courses"],
  });
  
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });
  
  const isLoading = isLoadingCourses || isLoadingReports || isLoadingUsers;
  
  // Calculate statistics
  const totalCourses = coursesData?.length || 0;
  const totalStudents = usersData?.filter(user => user.role === "student")?.length || 0;
  const totalNotes = reportsData?.reduce((sum, item) => sum + item.noteCount, 0) || 0;
  
  const [location, navigate] = useLocation();

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </Card>
          ))
        ) : (
          <>
            {/* Active Courses Card */}
            <Card className="bg-white rounded-lg shadow-md p-6">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary bg-opacity-10 text-primary">
                    <Book className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Courses</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalCourses}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">This month</span>
                    <span className="text-xs text-green-500 flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3 w-3 mr-1" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      8%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Students Card */}
            <Card className="bg-white rounded-lg shadow-md p-6">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-amber-500 bg-opacity-10 text-amber-500">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalStudents}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">This month</span>
                    <span className="text-xs text-green-500 flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3 w-3 mr-1" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      12%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Created Card */}
            <Card className="bg-white rounded-lg shadow-md p-6">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-500 bg-opacity-10 text-green-500">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Notes Created</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalNotes}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">This month</span>
                    <span className="text-xs text-green-500 flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3 w-3 mr-1" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      24%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src="https://ui-avatars.com/api/?name=Ana+Silva&background=4F46E5&color=fff" alt="User" />
                          <AvatarFallback>AS</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Ana Silva</p>
                          <p className="text-xs text-gray-600">ana.silva@email.com</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Added a note
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">Web Programming - Class 3</TableCell>
                    <TableCell className="text-sm text-gray-600">2 hours ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src="https://ui-avatars.com/api/?name=Pedro+Costa&background=4F46E5&color=fff" alt="User" />
                          <AvatarFallback>PC</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Pedro Costa</p>
                          <p className="text-xs text-gray-600">pedro.costa@email.com</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Created a course
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">Introduction to UI/UX</TableCell>
                    <TableCell className="text-sm text-gray-600">5 hours ago</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoading ? (
              Array(2).fill(0).map((_, i) => (
                <Card key={i} className="border rounded-lg overflow-hidden">
                  <div className="h-32 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </Card>
              ))
            ) : (
              coursesData?.slice(0, 2).map((course) => (
                <Card key={course.id} className="border rounded-lg overflow-hidden">
                  <div className="h-32 bg-gray-300 relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-3">
                      <h3 className="text-white font-medium">{course.name}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-600">{course.lessons} lessons</span>
                      <span className="text-xs font-medium text-green-500">
                        {reportsData?.find(r => r.course.id === course.id)?.studentCount || 0} students
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-600">Prof. {course.instructor}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <Card className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/courses")}
              className="w-full justify-start bg-primary bg-opacity-10 hover:bg-opacity-20 text-primary hover:text-primary"
              variant="ghost"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
            <Button
              onClick={() => navigate("/users")}
              className="w-full justify-start bg-amber-500 bg-opacity-10 hover:bg-opacity-20 text-amber-500 hover:text-amber-500"
              variant="ghost"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
            <Button
              onClick={() => navigate("/reports")}
              className="w-full justify-start bg-green-500 bg-opacity-10 hover:bg-opacity-20 text-green-500 hover:text-green-500"
              variant="ghost"
            >
              <PieChart className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function UsersList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  return (
    <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">User Management</h2>
        <Button className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative flex-grow">
          <Input 
            className="pl-10" 
            placeholder="Search users"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Student'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary-900">
                        <svg 
                          className="h-4 w-4" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" 
                          />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                        <svg 
                          className="h-4 w-4" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
