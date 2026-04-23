import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import { StrictMode, lazy, Suspense, useEffect } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { Spinner } from "./components/ui/spinner";

// Lazy load all page components
const Index = lazy(() => import("./pages/Index"));
const Finance = lazy(() => import("./pages/Finance"));
const IT = lazy(() => import("./pages/IT"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const VehicleDetail = lazy(() => import("./pages/VehicleDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CVPage = lazy(() => import("./pages/CVPage").then(module => ({ default: module.CVPage })));
const SkillsPage = lazy(() => import("./pages/SkillsPage").then(module => ({ default: module.SkillsPage })));
const ProjectionsPage = lazy(() => import("./pages/finance/ProjectionsPage").then(module => ({ default: module.ProjectionsPage })));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Nodes = lazy(() => import("./pages/Nodes"));
const NodeDetail = lazy(() => import("./pages/NodeDetail"));
const TaskDetail = lazy(() => import("./pages/TaskDetail"));
const Contacts = lazy(() => import("./pages/Contacts"));
const ContactDetail = lazy(() => import("./pages/ContactDetail"));
const Home = lazy(() => import("./pages/Home"));
const GTD = lazy(() => import("./pages/GTD"));
const Ledger = lazy(() => import("./pages/Ledger"));
const FixedCosts = lazy(() => import("./pages/FixedCosts"));
const Categories = lazy(() => import("./pages/Categories"));
const Agenda = lazy(() => import("./pages/Agenda"));
const ParaDashboard = lazy(() => import("./pages/ParaDashboard"));
const Landing = lazy(() => import("./pages/Landing"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const TransactionDetail = lazy(() => import("./pages/finance/TransactionDetail"));
const AgentsHub = lazy(() => import("./pages/AgentsHub"));
const PersonaDashboard = lazy(() => import("./pages/PersonaDashboard"));
const AgentStudio = lazy(() => import("./pages/AgentStudio"));
const SharedNode = lazy(() => import("./pages/SharedNode"));
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
    return <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner />
    </div>;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const LoadingBoundary = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <Spinner />
  </div>
);

const App = () => {
  // Add this to your App.tsx or root layout temporarily
  useEffect(() => {
    console.log('=== SCROLL MONITOR ACTIVATED ===');

    // Track scroll position
    let lastScrollY = window.scrollY;
    let freezeDetected = false;

    const checkScroll = () => {
      const currentScroll = window.scrollY;
      const canScroll = document.body.style.overflow !== 'hidden';
      const bodyOverflow = document.body.style.overflow;
      const htmlOverflow = document.documentElement.style.overflow;
      const bodyHeight = document.body.style.height;
      const htmlHeight = document.documentElement.style.height;
      const overflowHiddenElements = document.querySelectorAll('[style*="overflow: hidden"]').length;

      // Detect if scroll is frozen (position hasn't changed but user tried to scroll)
      if (lastScrollY === currentScroll && !canScroll) {
        if (!freezeDetected) {
          console.warn('🚨 SCROLL FREEZE DETECTED', {
            lastScrollY,
            currentScroll,
            bodyOverflow,
            htmlOverflow,
            bodyHeight,
            htmlHeight,
            overflowHiddenElements,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            // Try to capture what might have caused it
            activeElement: document.activeElement?.tagName,
            activeElementId: document.activeElement?.id,
            modalElements: document.querySelectorAll('[role="dialog"], [class*="modal"]').length,
          });

          // Capture stack trace to see what caused the style change
          console.trace('Style change origin:');

          freezeDetected = true;
        }
      } else {
        freezeDetected = false;
      }

      lastScrollY = currentScroll;
    };

    // Monitor scroll events
    window.addEventListener('scroll', checkScroll, { passive: true });

    // Monitor style changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          const newOverflow = document.body.style.overflow;
          const oldOverflow = mutation.oldValue?.includes('overflow: hidden') ? 'hidden' : 'visible';

          if (newOverflow !== oldOverflow) {
            console.log('📋 Body style changed:', {
              from: oldOverflow,
              to: newOverflow,
              timestamp: new Date().toISOString(),
              stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
            });
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
      attributeOldValue: true
    });

    return () => {
      window.removeEventListener('scroll', checkScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner richColors />
            <BrowserRouter future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true,
            }}>
              <Suspense fallback={<LoadingBoundary />}>
                <Routes>
                  <Route path="/" element={
                    <Landing />
                  } />
                  <Route path="/login" element={
                    <AuthRedirect>
                      <Login />
                    </AuthRedirect>
                  } />
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
                    <Route path="/dashboard" element={<Index />} />
                    <Route path="/old" element={<Home />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/finance/projections" element={<ProjectionsPage />} />
                    <Route path="/finance/transactions/:id" element={<TransactionDetail />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/assets" element={<Navigate to="/portfolio?tab=assets" replace />} />
                    <Route path="/liabilities" element={<Navigate to="/portfolio?tab=liabilities" replace />} />
                    <Route path="/ledger" element={<Ledger />} />
                    <Route path="/fixed-costs" element={<FixedCosts />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/agenda" element={<Agenda />} />
                    <Route path="/vehicles" element={<Vehicles />} />
                    <Route path="/vehicles/:vehicleId" element={<VehicleDetail />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/it" element={<IT />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/nodes" element={<ParaDashboard />} />
                    <Route path="/projects" element={<Nodes type="PROJECT" />} />
                    <Route path="/areas" element={<Nodes type="AREA" />} />
                    <Route path="/resources" element={<Nodes type="RESOURCE" />} />
                    <Route path="/goals" element={<Nodes type="GOAL" />} />
                    <Route path="/archive" element={<Nodes type="ARCHIVE" />} />
                    <Route path="/nodes/:nodeId" element={<NodeDetail />} />
                    <Route path="/tasks" element={<Navigate to="/gtd/all" replace />} />
                    <Route path="/tasks/:taskId" element={<TaskDetail />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/contacts/:contactId" element={<ContactDetail />} />

                    <Route path="/gtd" element={<Navigate to="/gtd/inbox" replace />} />
                    <Route path="/gtd/:tab" element={<GTD />} />
                    
                    {/* Workforce Routing */}
                    <Route path="/agents" element={<AgentsHub />} />
                    <Route path="/agents/:personaId" element={<PersonaDashboard />} />
                    <Route path="/agents/:personaId/worker/:workerId" element={<AgentStudio />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="/share/:token" element={<SharedNode />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>
  );
};

export default App;
