import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Note } from "@shared/schema";
import { formatTimeAgo } from "@/lib/utils";

import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Edit, Trash2, Plus, MoreVertical } from "lucide-react";
import NoteForm from "./note-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NoteList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | undefined>(undefined);
  const [noteToDelete, setNoteToDelete] = useState<Note | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery<Note[]>({
    queryKey: ["/api/notes/my-notes"],
  });

  // Fetch enrolled courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/enrollments/my-courses"],
  });

  const isLoading = isLoadingNotes || isLoadingCourses;

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await apiRequest("DELETE", `/api/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes/my-notes"] });
      if (courseFilter !== "all") {
        queryClient.invalidateQueries({ queryKey: [`/api/notes/course/${courseFilter}`] });
      }
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      setNoteToDelete(undefined);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  // Filter notes based on search query and course filter
  const filteredNotes = notes?.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "all" || note.courseId.toString() === courseFilter;
    return matchesSearch && matchesCourse;
  });

  // Handle edit note
  const handleEditNote = (note: Note) => {
    setNoteToEdit(note);
    setNoteFormOpen(true);
  };

  // Handle add new note
  const handleAddNote = () => {
    setNoteToEdit(undefined);
    setNoteFormOpen(true);
  };

  // Handle delete note
  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note);
  };

  // Confirm delete note
  const confirmDeleteNote = () => {
    if (noteToDelete) {
      deleteMutation.mutate(noteToDelete.id);
    }
  };

  // Get course name by ID
  const getCourseNameById = (courseId: number) => {
    const course = courses?.find(c => c.id === courseId);
    return course?.name || "Unknown Course";
  };

  // Get background color based on note color
  const getNoteBackgroundColor = (color: string) => {
    switch (color) {
      case "yellow": return "bg-yellow-50";
      case "blue": return "bg-blue-50";
      case "green": return "bg-green-50";
      case "purple": return "bg-purple-50";
      default: return "bg-gray-50";
    }
  };

  // Get badge color based on course name
  const getCourseBadgeColor = (courseId: number) => {
    const courseName = getCourseNameById(courseId).toLowerCase();
    if (courseName.includes("web")) return "bg-primary/10 text-primary";
    if (courseName.includes("ui")) return "bg-amber-500/10 text-amber-500";
    if (courseName.includes("data")) return "bg-green-500/10 text-green-500";
    return "bg-gray-500/10 text-gray-500";
  };

  return (
    <>
      <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">My Notes</h2>
          <Button onClick={handleAddNote} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-10" 
              placeholder="Search notes" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {courses?.map(course => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredNotes?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map(note => (
              <Card 
                key={note.id} 
                className={`border rounded-lg p-4 ${getNoteBackgroundColor(note.color)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{note.title}</h3>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-600 mr-2">{formatTimeAgo(note.createdAt)}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditNote(note)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteNote(note)} className="text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {note.content}
                </p>
                <div className="flex justify-between items-center">
                  <Badge className={getCourseBadgeColor(note.courseId)}>
                    {getCourseNameById(note.courseId)}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <svg 
              className="h-16 w-16 text-gray-300 mb-4" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900">No notes found</h3>
            <p className="text-gray-600 mt-2 mb-4">
              {searchQuery || courseFilter !== "all"
                ? "Try adjusting your search filters."
                : "Create your first note to get started."}
            </p>
            {!(searchQuery || courseFilter !== "all") && (
              <Button onClick={handleAddNote}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Note
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Note Form Dialog */}
      <NoteForm 
        open={noteFormOpen}
        onOpenChange={setNoteFormOpen}
        noteToEdit={noteToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the note "{noteToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteNote}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
