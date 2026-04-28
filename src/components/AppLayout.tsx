import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-display text-primary font-bold">Textify AI</h1>
              <span className="text-sm text-muted-foreground hidden sm:inline ml-2">
                Intelligent OCR, translation, and AI writing in one professional workspace.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <span className="text-sm text-muted-foreground">{user.email}</span>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  Log in / Sign up
                </Button>
              )}
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
