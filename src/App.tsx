import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { ChatPage } from "./pages/ChatPage";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import QuestionsList from './pages/QuestionsList';

const queryClient = new QueryClient();

// AuthenticatedRoute component
function AuthenticatedRoute({ children, onlyUser = false }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (onlyUser && user.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <Auth />
  },
  {
    path: '/questions',
    element: (
      <AuthenticatedRoute onlyUser={true}>
        <QuestionsList />
      </AuthenticatedRoute>
    )
  },
  {
    path: '/dashboard',
    element: (
      <AuthenticatedRoute>
        <Dashboard />
      </AuthenticatedRoute>
    )
  },
  {
    path: '/admin',
    element: (
      <AuthenticatedRoute>
        <AdminDashboard />
      </AuthenticatedRoute>
    )
  },
  {
    path: '/chat',
    element: <ChatPage />
  },
  {
    path: '*',
    element: <NotFound />
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
