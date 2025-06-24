import AppHeader from "@/components/app-header";
import BrandEditor from "@/components/brand-editor";
import { useAuth } from "@/hooks/use-auth";

export default function NewProject() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} />
      <div className="p-6 max-w-6xl mx-auto">
        <BrandEditor />
      </div>
    </div>
  );
}
