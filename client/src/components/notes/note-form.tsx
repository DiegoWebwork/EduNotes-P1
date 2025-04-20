import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Note, insertNoteSchema } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { z } from "zod";

// Extended schema with validation rules
const noteFormSchema = insertNoteSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  courseId: z.number().min(1, "Please select a course"),
});

// Form values type
type NoteFormValues = z.infer<typeof noteFormSchema>;

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteToEdit?: Note;
}

export default function NoteForm({ open, onOpenChange, noteToEdit }: NoteFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!noteToEdit;

  // Fetch enrolled courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/enrollments/my-courses"],
  });

  // Initialize form with default values or values from noteToEdit
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: noteToEdit 
      ? { 
          ...noteToEdit,
          courseId: noteToEdit.courseId
        }
      : {
          title: "",
          content: "",
          courseId: 0,
          color: "yellow",
          userId: user?.id || 0,
        },
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: NoteFormValues) => {
      const res = await apiRequest("POST", "/api/notes", {
        ...data,
        userId: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes/my-notes"] });
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create note",
        variant: "destructive",
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async (data: NoteFormValues) => {
      const res = await apiRequest("PUT", `/api/notes/${noteToEdit?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes/my-notes"] });
      queryClient.invalidateQueries({ queryKey: [`/api/notes/course/${form.getValues().courseId}`] });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update note",
        variant: "destructive",
      });
    },
  });

  const isPending = createNoteMutation.isPending || updateNoteMutation.isPending || isLoadingCourses;

  // Handle form submission
  const onSubmit = (data: NoteFormValues) => {
    if (isEditing) {
      updateNoteMutation.mutate(data);
    } else {
      createNoteMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Note" : "Add New Note"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your note details below." 
              : "Create a new note for your course."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Important concept from lecture 3" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select 
                    value={field.value.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={isLoadingCourses || isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses?.map(course => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Your note content..." 
                      rows={5} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Color</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-2"
                    >
                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="yellow" id="yellow" className="sr-only" />
                        </FormControl>
                        <label 
                          htmlFor="yellow" 
                          className={`h-8 w-8 rounded-full bg-yellow-50 border-2 cursor-pointer ${field.value === 'yellow' ? 'border-yellow-500' : 'border-yellow-200'}`}
                        ></label>
                      </FormItem>

                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="blue" id="blue" className="sr-only" />
                        </FormControl>
                        <label 
                          htmlFor="blue" 
                          className={`h-8 w-8 rounded-full bg-blue-50 border-2 cursor-pointer ${field.value === 'blue' ? 'border-blue-500' : 'border-blue-200'}`}
                        ></label>
                      </FormItem>

                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="green" id="green" className="sr-only" />
                        </FormControl>
                        <label 
                          htmlFor="green" 
                          className={`h-8 w-8 rounded-full bg-green-50 border-2 cursor-pointer ${field.value === 'green' ? 'border-green-500' : 'border-green-200'}`}
                        ></label>
                      </FormItem>

                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="purple" id="purple" className="sr-only" />
                        </FormControl>
                        <label 
                          htmlFor="purple" 
                          className={`h-8 w-8 rounded-full bg-purple-50 border-2 cursor-pointer ${field.value === 'purple' ? 'border-purple-500' : 'border-purple-200'}`}
                        ></label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Note" : "Create Note"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
