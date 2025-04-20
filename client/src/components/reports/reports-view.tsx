import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Download, Eye, BarChart2, PieChart, LineChart } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

export default function ReportsView() {
  const [currentTab, setCurrentTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  // Fetch reports data
  const { data: coursesReportData, isLoading: isLoadingCoursesReport } = useQuery({
    queryKey: ["/api/reports/courses"],
  });

  const { data: usersReportData, isLoading: isLoadingUsersReport } = useQuery({
    queryKey: ["/api/reports/users"],
  });

  const isLoading = isLoadingCoursesReport || isLoadingUsersReport;

  // Filter reports based on search query
  const filteredCoursesReport = coursesReportData?.filter(item => 
    item.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsersReport = usersReportData?.filter(item => 
    item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chart colors
  const COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];
  
  // Prepare data for the bar chart - top 5 courses by notes
  const courseBarChartData = coursesReportData
    ?.sort((a, b) => b.noteCount - a.noteCount)
    .slice(0, 5)
    .map(item => ({
      name: item.course.name.length > 15 ? item.course.name.substring(0, 15) + '...' : item.course.name,
      notes: item.noteCount,
      students: item.studentCount
    }));

  // Prepare data for the pie chart - notes distribution by course
  const coursePieChartData = coursesReportData
    ?.sort((a, b) => b.noteCount - a.noteCount)
    .slice(0, 5)
    .map(item => ({
      name: item.course.name,
      value: item.noteCount
    }));

  // Prepare data for the bar chart - top 5 users by notes
  const userBarChartData = usersReportData
    ?.sort((a, b) => b.noteCount - a.noteCount)
    .slice(0, 5)
    .map(item => ({
      name: item.user.name.length > 15 ? item.user.name.substring(0, 15) + '...' : item.user.name,
      notes: item.noteCount
    }));

  // Handle download report (this would be implemented with a proper export functionality in production)
  const handleDownloadReport = () => {
    // Placeholder for report download functionality
    alert('Report download would be implemented here');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                View analytics and reports on courses and notes
              </CardDescription>
            </div>
            <Button className="mt-4 md:mt-0" onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="courses" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="courses">Courses Report</TabsTrigger>
              <TabsTrigger value="users">Students Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Notes by Course</CardTitle>
                    <CardDescription>Top 5 courses</CardDescription>
                  </CardHeader>
                  <CardContent className="h-48">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courseBarChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="notes" fill="#4F46E5" name="Notes" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Students by Course</CardTitle>
                    <CardDescription>Top 5 courses</CardDescription>
                  </CardHeader>
                  <CardContent className="h-48">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courseBarChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="students" fill="#F59E0B" name="Students" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Notes Distribution</CardTitle>
                    <CardDescription>By course</CardDescription>
                  </CardHeader>
                  <CardContent className="h-48">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={coursePieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {coursePieChartData?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    className="pl-10" 
                    placeholder="Search by course or instructor" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="ml-3">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="month">Last month</SelectItem>
                      <SelectItem value="quarter">Last 3 months</SelectItem>
                      <SelectItem value="year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Total Students</TableHead>
                      <TableHead>Total Notes</TableHead>
                      <TableHead>Avg. Notes per Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : filteredCoursesReport?.length ? (
                      filteredCoursesReport.map(item => {
                        const averageNotes = item.studentCount > 0 
                          ? (item.noteCount / item.studentCount).toFixed(1) 
                          : '0.0';
                          
                        return (
                          <TableRow key={item.course.id}>
                            <TableCell className="font-medium">{item.course.name}</TableCell>
                            <TableCell>{item.course.instructor}</TableCell>
                            <TableCell>{item.studentCount}</TableCell>
                            <TableCell>{item.noteCount}</TableCell>
                            <TableCell>{averageNotes}</TableCell>
                            <TableCell>
                              <Badge variant={item.course.active ? "default" : "secondary"} className={item.course.active ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
                                {item.course.active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="text-primary">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No courses found matching your search criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Students by Notes</CardTitle>
                    <CardDescription>Most active note takers</CardDescription>
                  </CardHeader>
                  <CardContent className="h-48">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={userBarChartData} 
                          layout="vertical" 
                          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="notes" fill="#4F46E5" name="Notes" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Notes Distribution</CardTitle>
                    <CardDescription>By student</CardDescription>
                  </CardHeader>
                  <CardContent className="h-48">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={usersReportData?.slice(0, 5).map(item => ({
                              name: item.user.name,
                              value: item.noteCount
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {usersReportData?.slice(0, 5).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    className="pl-10" 
                    placeholder="Search by student name or username" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="ml-3">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="month">Last month</SelectItem>
                      <SelectItem value="quarter">Last 3 months</SelectItem>
                      <SelectItem value="year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Total Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : filteredUsersReport?.length ? (
                      filteredUsersReport.map(item => (
                        <TableRow key={item.user.id}>
                          <TableCell className="font-medium">{item.user.name}</TableCell>
                          <TableCell>{item.user.username}</TableCell>
                          <TableCell>{item.noteCount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="text-primary">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No students found matching your search criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
