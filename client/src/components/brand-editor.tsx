import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertProjectSchema, ProjectWithDetails, BrandColor, BrandTypography } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ColorPicker from "./color-picker";
import FileUpload from "./file-upload";
import { Code, FileDown, FileText, FolderSync, Plus, Trash2, Loader2 } from "lucide-react";
import { z } from "zod";

interface BrandEditorProps {
  project?: ProjectWithDetails;
}

const formSchema = insertProjectSchema.extend({
  logoUrl: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function BrandEditor({ project }: BrandEditorProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEditing = !!project;
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      tagline: project?.tagline || "",
      category: project?.category || "",
      description: project?.description || "",
      logoUrl: project?.logoUrl || "",
      toneOfVoice: project?.toneOfVoice || "",
      usageGuidelines: project?.usageGuidelines || "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return await res.json();
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: "Your brand project has been created successfully.",
      });
      setLocation(`/projects/${newProject.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("PUT", `/api/projects/${project!.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project!.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project updated",
        description: "Your brand project has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isEditing) {
      await updateProjectMutation.mutateAsync(data);
    } else {
      await createProjectMutation.mutateAsync(data);
    }
  };

  const handleCancel = () => {
    setLocation("/");
  };

  const handleExport = async (format: string) => {
    if (!project) return;
    
    try {
      const res = await apiRequest("GET", `/api/projects/${project.id}/export/${format}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${project.name}-brand.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `Brand guidelines exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export brand guidelines",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-material-lg">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {isEditing ? `Brand Editor - ${project.name}` : "Create New Brand"}
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {(createProjectMutation.isPending || updateProjectMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isEditing ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            <Form {...form}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter project name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tagline</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter project tagline" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Mobile App">Mobile App</SelectItem>
                                <SelectItem value="Web App">Web App</SelectItem>
                                <SelectItem value="E-commerce">E-commerce</SelectItem>
                                <SelectItem value="SaaS">SaaS</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe your project" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Logo</h3>
                    <FileUpload 
                      value={form.watch("logoUrl")}
                      onChange={(url) => form.setValue("logoUrl", url)}
                    />
                  </div>

                  {/* Brand Voice */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Voice</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="toneOfVoice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tone of Voice</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your brand's personality and communication style..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="usageGuidelines"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usage Guidelines</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Key guidelines for using this brand..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Color Palette</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Color
              </Button>
            </div>
            
            {project?.colors && project.colors.length > 0 ? (
              <div className="space-y-3">
                {project.colors.map((color) => (
                  <ColorPicker key={color.id} color={color} projectId={project.id} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No colors added yet. {isEditing ? "Save the project first to add colors." : "Create the project to start adding colors."}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="typography" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Typography</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Font
              </Button>
            </div>
            
            {project?.typography && project.typography.length > 0 ? (
              <div className="space-y-4">
                {project.typography.map((typo) => (
                  <Card key={typo.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium capitalize">{typo.type} Font</h4>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-lg" style={{ fontFamily: typo.fontFamily }}>
                      {typo.fontFamily}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No typography added yet. {isEditing ? "Save the project first to add fonts." : "Create the project to start adding fonts."}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export & FolderSync</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col"
                  onClick={() => handleExport("css")}
                  disabled={!project}
                >
                  <Code className="w-6 h-6 mb-2 text-gray-600" />
                  <span className="text-sm font-medium">CSS/SCSS</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col"
                  onClick={() => handleExport("json")}
                  disabled={!project}
                >
                  <FileText className="w-6 h-6 mb-2 text-gray-600" />
                  <span className="text-sm font-medium">JSON</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col"
                  disabled={!project}
                >
                  <FileDown className="w-6 h-6 mb-2 text-gray-600" />
                  <span className="text-sm font-medium">PDF Guide</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col"
                  disabled={!project}
                >
                  <FolderSync className="w-6 h-6 mb-2 text-gray-600" />
                  <span className="text-sm font-medium">FolderSync Figma</span>
                </Button>
              </div>
              
              {!project && (
                <p className="text-sm text-gray-500 mt-4">
                  Create and save your project to enable export options.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
