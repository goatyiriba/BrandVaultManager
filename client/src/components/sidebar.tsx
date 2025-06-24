import { Button } from "@/components/ui/button";
import { Project } from "@shared/schema";
import { Plus, Folder, Clock } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface SidebarProps {
  projects: Project[];
  onCreateProject: () => void;
}

export default function Sidebar({ projects, onCreateProject }: SidebarProps) {
  const recentProjects = projects.slice(0, 3);

  const getProjectGradient = (index: number) => {
    const gradients = [
      "from-blue-400 to-purple-500",
      "from-green-400 to-teal-500", 
      "from-orange-400 to-red-500",
      "from-purple-400 to-pink-500",
      "from-yellow-400 to-orange-500"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white shadow-material h-screen sticky top-16">
      <div className="p-6">
        <Button 
          onClick={onCreateProject}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg shadow-material hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="font-medium">New Project</span>
        </Button>
      </div>
      
      <div className="flex-1 px-6 pb-6">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Recent Projects
          </h3>
          <div className="space-y-2">
            {recentProjects.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No projects yet
              </div>
            ) : (
              recentProjects.map((project, index) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <a className={`block p-3 rounded-lg transition-colors ${
                    index === 0 ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-gray-50"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${getProjectGradient(index)} rounded-lg flex items-center justify-center`}>
                        <Folder className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{project.name}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              ))
            )}
          </div>
        </div>
        

      </div>
    </aside>
  );
}
