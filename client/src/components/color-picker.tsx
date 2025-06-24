import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandColor } from "@shared/schema";
import { Trash2, Edit } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ColorPickerProps {
  color: BrandColor;
  projectId: number;
}

export default function ColorPicker({ color, projectId }: ColorPickerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(color.name);
  const [hexCode, setHexCode] = useState(color.hexCode);
  const [usage, setUsage] = useState(color.usage || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateColorMutation = useMutation({
    mutationFn: async (data: { name: string; hexCode: string; usage: string }) => {
      const res = await apiRequest("PUT", `/api/colors/${color.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      setIsEditing(false);
      toast({
        title: "Color updated",
        description: "Brand color has been updated successfully.",
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

  const deleteColorMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/colors/${color.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({
        title: "Color deleted",
        description: "Brand color has been deleted successfully.",
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

  const handleSave = () => {
    updateColorMutation.mutate({ name, hexCode, usage });
  };

  const handleCancel = () => {
    setName(color.name);
    setHexCode(color.hexCode);
    setUsage(color.usage || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
        <input
          type="color"
          value={hexCode}
          onChange={(e) => setHexCode(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-300"
        />
        <div className="flex-1 space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Color name"
            className="text-sm"
          />
          <Input
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            placeholder="Usage description"
            className="text-xs"
          />
        </div>
        <div className="flex space-x-2">
          <Button size="sm" onClick={handleSave} disabled={updateColorMutation.isPending}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg group">
      <div 
        className="w-8 h-8 rounded cursor-pointer border border-gray-300" 
        style={{ backgroundColor: color.hexCode }}
        title="Click to edit"
        onClick={() => setIsEditing(true)}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{color.name}</p>
        <p className="text-xs text-gray-500">{color.hexCode}</p>
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-600">{color.usage}</p>
      </div>
      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setIsEditing(true)}
          className="p-1"
        >
          <Edit className="w-3 h-3" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => deleteColorMutation.mutate()}
          disabled={deleteColorMutation.isPending}
          className="p-1 text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
