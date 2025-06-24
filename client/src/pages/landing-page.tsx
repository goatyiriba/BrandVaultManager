import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Palette } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white p-8 text-center">
      <div className="max-w-xl">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-2">
            <Palette className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold">BrandVault</h1>
        </div>
        <p className="text-lg mb-8">
          Centralize and manage all your brand assets in one place.
        </p>
        <Link href="/auth">
          <Button className="bg-white text-primary hover:bg-white/90">Get Started</Button>
        </Link>
      </div>
    </div>
  );
}
