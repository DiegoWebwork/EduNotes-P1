import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Search, BookOpen, Clock, Calendar, Users, ChevronRight } from "lucide-react";

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch enrolled courses
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/enrollments/my-courses"],
  });

  // Filter courses based on search query and status filter
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && course.active) ||
                         (statusFilter === "inactive" && !course.active);
    return matchesSearch && matchesStatus;
  });

  // Navigate to course details (placeholder for future implementation)
  const viewCourseDetails = (courseId: number) => {
    // In a real implementation, this would navigate to a course details page
    toast({
      title: "Course Selected",
      description: `Viewing course ID: ${courseId}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Courses</h1>
          <p className="text-muted-foreground">Courses you're enrolled in</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-10" 
              placeholder="Search courses" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              <SelectItem value="active">Active courses</SelectItem>
              <SelectItem value="inactive">Inactive courses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCourses?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Card key={course.id} className="overflow-hidden">
              <div className={`h-2 ${course.active ? "bg-primary" : "bg-gray-300"}`} />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                  <Badge variant={course.active ? "default" : "secondary"}>
                    {course.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{course.instructor}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {course.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration} weeks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <Calendar className="h-4 w-4" />
                    <span>Started on {formatDate(course.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t bg-muted/20 px-6 py-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => viewCourseDetails(course.id)} 
                  className="text-primary"
                >
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/20">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium text-center mb-1">No courses found</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search filters to find courses."
              : "You're not enrolled in any courses yet. Check with your administrator for available courses."}
          </p>
        </div>
      )}
    </div>
  );
}