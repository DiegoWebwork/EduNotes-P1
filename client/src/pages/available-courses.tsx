import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Course } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

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
import { Loader2, Search, BookOpen, Clock, Users, Calendar } from "lucide-react";

export default function AvailableCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch available courses
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses/active"],
  });

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest("POST", "/api/enrollments", {
        userId: user!.id,
        courseId
      });
    },
    onSuccess: () => {
      // Invalidate both available courses and enrolled courses queries
      queryClient.invalidateQueries({ queryKey: ["/api/courses/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/my-courses"] });
      
      toast({
        title: "Success",
        description: "You have successfully enrolled in the course",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    },
  });

  // Filter courses based on search query
  const filteredCourses = courses?.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEnroll = (courseId: number) => {
    enrollMutation.mutate(courseId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Available Courses</h1>
          <p className="text-muted-foreground">Courses you can enroll in</p>
        </div>
        
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            className="w-full pl-10" 
            placeholder="Search courses" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
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
              <div className="h-2 bg-primary" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                  <Badge variant="outline">
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
                </div>
              </CardContent>
              <CardFooter className="border-t py-3">
                <Button 
                  className="w-full" 
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending && enrollMutation.variables === course.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Enroll Now
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
          <h3 className="text-xl font-medium text-center mb-1">No available courses</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {searchQuery
              ? "Try adjusting your search to find courses."
              : "There are no courses available for enrollment right now."}
          </p>
        </div>
      )}
    </div>
  );
}