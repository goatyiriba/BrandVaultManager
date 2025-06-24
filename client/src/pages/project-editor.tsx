import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ProjectWithDetails } from "@shared/schema";
import AppHeader from "@/components/app-header";
import BrandEditor from "@/components/brand-editor";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ProjectEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const isNewProject = id === "new";
  
  const { data: project, isLoading, error } = useQuery<ProjectWithDetails>({
    queryKey: ["/api/projects", id],
    enabled: !!id && !isNewProject,
  });

  if (isNewProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader user={user} />
        <div className="p-6 max-w-6xl mx-auto">
          <BrandEditor />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader user={user} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader user={user} />
        <div className="p-6 max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
              <p className="text-gray-600">The project you're looking for doesn't exist or you don't have access to it.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} />
      <div className="p-6 max-w-6xl mx-auto">
        <BrandEditor project={project} />
      </div>
    </div>
  );
}
