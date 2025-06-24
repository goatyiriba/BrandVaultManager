import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Project } from "@shared/schema";
import AppHeader from "@/components/app-header";
import Sidebar from "@/components/sidebar";
import ProjectCard from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Folder, Palette, Search, Filter } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateProject, setShowCreateProject] = useState(false);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const stats = {
    totalProjects: projects?.length || 0,
    activeBrands: projects?.length || 0,
  };

  const handleCreateProject = () => {
    setLocation("/projects/new");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} />
      
      <div className="flex">
        <Sidebar projects={projects || []} onCreateProject={handleCreateProject} />
        
        <main className="flex-1 p-6 max-w-6xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600">Manage your brand identity across all projects</p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-material">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Projects</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Folder className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-material">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Brands</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.activeBrands}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Palette className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Project Management Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
              <div className="flex space-x-3">
                <Button onClick={handleCreateProject} className="bg-primary hover:bg-primary/90">
                  Create Project
                </Button>
              </div>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  {projects?.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  
                  {/* Create New Project Card */}
                  <Card 
                    className="border-2 border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                    onClick={handleCreateProject}
                  >
                    <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Create New Project</h3>
                      <p className="text-sm text-gray-500">Start building your brand identity</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
