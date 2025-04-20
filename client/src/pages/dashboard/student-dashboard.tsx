import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, Loader2, BarChart2, Calendar, Users, Clock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import NoteList from "@/components/notes/note-list";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Determine which component to show based on the location
  const renderContent = () => {
    if (location === "/my-notes") {
      return <NoteList />;
    } else if (location === "/my-courses") {
      return <MyCourses />;
    } else if (location === "/profile") {
      return <StudentProfile />;
    } else {
      return <StudentHome />;
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}

function StudentHome() {
  // Fetch enrolled courses
  const { data: enrolledCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/enrollments/my-courses"],
  });

  // Fetch notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ["/api/notes/my-notes"],
  });
  
  const isLoading = isLoadingCourses || isLoadingNotes;
  const totalCourses = enrolledCourses?.length || 0;
  const totalNotes = notes?.length || 0;
  
  const [_, navigate] = useLocation();

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
            {/* Enrolled Courses Card */}
            <Card className="bg-white rounded-lg shadow-md p-6">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary bg-opacity-10 text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalCourses}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate("/my-courses")}
                  >
                    View My Courses
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* My Notes Card */}
            <Card className="bg-white rounded-lg shadow-md p-6">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-amber-500 bg-opacity-10 text-amber-500">
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
                    <p className="text-sm font-medium text-gray-600">My Notes</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalNotes}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate("/my-notes")}
                  >
                    View My Notes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="bg-white rounded-lg shadow-md p-6">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-500 bg-opacity-10 text-green-500">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                    <h3 className="text-2xl font-bold text-gray-900">75%</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* My Courses */}
      <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">My Courses</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/my-courses")}>
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(2).fill(0).map((_, i) => (
              <Card key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-md bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledCourses?.slice(0, 4).map((course) => (
              <Card key={course.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-md bg-primary bg-opacity-10 flex items-center justify-center text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{course.name}</h3>
                    <p className="text-xs text-gray-600">Instructor: {course.instructor}</p>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-xs mr-2">
                        {course.lessons} lessons
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Notes */}
      <Card className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Notes</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/my-notes")}>
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border rounded-lg p-4 bg-gray-50">
                <div className="animate-pulse flex flex-col space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes?.slice(0, 3).map((note) => {
              const course = enrolledCourses?.find(c => c.id === note.courseId);
              
              return (
                <Card 
                  key={note.id} 
                  className={`border rounded-lg p-4 ${
                    note.color === 'yellow' ? 'bg-yellow-50' : 
                    note.color === 'blue' ? 'bg-blue-50' : 
                    note.color === 'green' ? 'bg-green-50' : 
                    note.color === 'purple' ? 'bg-purple-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{note.title}</h3>
                    <span className="text-xs text-gray-600">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {note.content}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge className={`text-xs ${
                      course?.name.toLowerCase().includes('web') ? 'bg-primary/10 text-primary' : 
                      course?.name.toLowerCase().includes('ui') ? 'bg-amber-500/10 text-amber-500' : 
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {course?.name || 'Unknown Course'}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <svg 
                          className="h-4 w-4 text-gray-500" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" 
                          />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <svg 
                          className="h-4 w-4 text-red-500" 
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
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function MyCourses() {
  // Fetch enrolled courses
  const { data: enrolledCourses, isLoading } = useQuery({
    queryKey: ["/api/enrollments/my-courses"],
  });

  return (
    <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">My Courses</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="border rounded-lg overflow-hidden">
              <div className="h-32 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </Card>
          ))
        ) : enrolledCourses?.length ? (
          enrolledCourses.map((course) => (
            <Card key={course.id} className="border rounded-lg overflow-hidden">
              <div className="h-32 bg-gray-300 relative">
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-3">
                  <h3 className="text-white font-medium">{course.name}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">{course.duration} weeks</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">{course.lessons} lessons</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-600 line-clamp-2">{course.description}</p>
                </div>
                <div className="flex items-center mt-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{course.instructor[0]}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-xs text-gray-600">Prof. {course.instructor}</span>
                </div>
                <div className="mt-4">
                  <Button size="sm" className="w-full">
                    View Course
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No courses yet</h3>
            <p className="text-gray-600 mt-2">You haven't enrolled in any courses yet.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function StudentProfile() {
  const { user } = useAuth();

  return (
    <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">My Profile</h2>
        <Button>
          Edit Profile
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col items-center mb-6 md:mb-0 md:mr-8">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4F46E5&color=fff&size=128`} />
            <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            Change Photo
          </Button>
        </div>
        
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <p className="text-gray-900 border rounded-md p-2 bg-gray-50">{user?.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <p className="text-gray-900 border rounded-md p-2 bg-gray-50">{user?.username}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-100">
                {user?.role === 'admin' ? 'Administrator' : 'Student'}
              </Badge>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <p className="text-gray-900 border rounded-md p-2 bg-gray-50">••••••••</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button variant="outline" className="mr-2">
              Reset Password
            </Button>
            <Button variant="destructive">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
