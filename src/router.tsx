import { createBrowserRouter, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Criar um cliente de consulta para o React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Criar o componente Root que envolve a aplicação com os providers necessários
const Root = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="dark">
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

// Criar o router
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Root>
        <Login />
      </Root>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Root>
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: "*",
    element: (
      <Root>
        <NotFound />
      </Root>
    ),
  },
]);
