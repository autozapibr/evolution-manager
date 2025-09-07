import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Obter o basename a partir da configuração do Vite import.meta.env
// Remove barras iniciais e finais extras se existirem
const normalizeBasename = (path: string) => {
  // Se não houver base path ou for apenas "/", não use basename
  if (!path || path === "/") return "";

  // Normaliza para garantir que começa com / e não termina com /
  return path.startsWith("/") ? path : `/${path}`;
};

// Obter o basename a partir do base no HTML
const getBaseNameFromMeta = (): string => {
  // Usar o caminho base definido no Vite
  const basePath = import.meta.env.BASE_URL || "/";
  return normalizeBasename(basePath);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Page title component
const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    let title = "Evolution Manager";

    // Add path-specific titles
    if (location.pathname === "/") {
      title = "Login | Evolution Manager";
    } else if (location.pathname === "/dashboard") {
      title = "Dashboard | Evolution Manager";
    } else if (location.pathname === "*") {
      title = "Page Not Found | Evolution Manager";
    }

    document.title = title;
  }, [location]);

  return null;
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PageTitle />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
