import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import Index from "./pages/Index";
import Finance from "./pages/Finance";
import IT from "./pages/IT";
import Vehicles from "./pages/Vehicles";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { CVPage } from "./pages/CVPage";
import { SkillsPage } from "./pages/SkillsPage";
import { StrictMode } from "react";
import { ProjectionsPage } from "./pages/finance/ProjectionsPage";
import { MainLayout } from "./components/layout/MainLayout";
import { Spinner } from "./components/ui/spinner";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import TaskDetail from "./pages/TaskDetail";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";
import Home from "./pages/Home";
import Assets from "./pages/Assets";
import Liabilities from "./pages/Liabilities";
import Ledger from "./pages/Ledger";
import FixedCosts from "./pages/FixedCosts";
import Categories from "./pages/Categories";
import Agenda from "./pages/Agenda";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/cv" element={<CVPage />} />
              <Route path="/cv/skills" element={<SkillsPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                {/* These routes are now children of MainLayout */}
                <Route path="/" element={<Index />} />
                <Route path="/old" element={<Home />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/finance/projections" element={<ProjectionsPage />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/liabilities" element={<Liabilities />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/fixed-costs" element={<FixedCosts />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/it" element={<IT />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/tasks/:taskId" element={<TaskDetail />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/contacts/:contactId" element={<ContactDetail />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);

export default App;
