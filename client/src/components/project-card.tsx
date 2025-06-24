import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Project } from "@shared/schema";
import { MoreVertical, Download, Edit, Trash2, Clock, Folder } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getProjectIcon = () => {
    switch (project.category?.toLowerCase()) {
      case 'mobile app':
        return 'smartphone';
      case 'web app':
        return 'globe';
      case 'e-commerce':
        return 'store';
      case 'saas':
        return 'cloud';
      default:
        return 'folder';
    }
  };

  const getGradientClass = (id: number) => {
    const gradients = [
      "from-blue-400 to-purple-500",
      "from-green-400 to-teal-500", 
      "from-orange-400 to-red-500",
      "from-purple-400 to-pink-500",
      "from-yellow-400 to-orange-500"
    ];
    return gradients[id % gradients.length];
  };

  return (
    <Card className="shadow-material hover:shadow-material-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${getGradientClass(project.id)} rounded-xl flex items-center justify-center`}>
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-500">{project.category || 'Project'}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            {project.tagline || project.description || "No description available"}
          </p>
          
          {/* Mock color palette */}
          <div className="flex space-x-2 mb-3">
            <div className="w-4 h-4 rounded bg-blue-500" title="Primary Color"></div>
            <div className="w-4 h-4 rounded bg-purple-500" title="Secondary Color"></div>
            <div className="w-4 h-4 rounded bg-gray-700" title="Neutral Color"></div>
            <div className="w-4 h-4 rounded bg-green-500" title="Accent Color"></div>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>Last updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
            <Link href={`/projects/${project.id}`}>
              Edit Brand
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="px-3">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
