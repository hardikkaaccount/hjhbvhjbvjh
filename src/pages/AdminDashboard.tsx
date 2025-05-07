import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserList from '@/components/admin/UserList';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // Redirect to login if not admin
    if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Prompt Wars - Admin Panel</h1>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Admin: {user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage users and view their progress</p>
        </div>
        
        <UserList />
      </main>
    </div>
  );
};

export default AdminDashboard;
