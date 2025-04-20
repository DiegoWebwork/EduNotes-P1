import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Course } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, BookOpen, Clock, Calendar, 
  FileText, ArrowRight, LayoutGrid
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function MyCoursesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch enrolled courses
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/enrollments/my-courses"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load enrolled courses. Please try again.",
      variant: "destructive",
    });
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">My Courses</h1>
        <p className="text-red-500">Failed to load courses. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Courses</h1>
          <p className="text-muted-foreground">Courses you are currently enrolled in</p>
        </div>
        
        <Button 
          onClick={() => navigate("/available-courses")}
          className="md:w-auto w-full"
        >
          Browse Available Courses
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {courses?.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map(course => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                  <Badge variant={course.active ? "default" : "secondary"}>
                    {course.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{course.instructor}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{course.duration} weeks</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Started {formatDate(course.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/course/${course.id}/notes`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Notes
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Course Content
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
          <h3 className="text-xl font-medium text-center mb-1">No enrolled courses</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            You are not enrolled in any courses yet. Browse available courses to enroll.
          </p>
          <Button onClick={() => navigate("/available-courses")}>
            Browse Available Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}