import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getProblemById } from "@/data/dsaProblems";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';

interface UserSubmission {
  _id: string;
  problemId: string;
  code: string;
  result: { passedTests: number; totalTests: number };
  promptHistory?: Array<{ role: string; content: string }>;
  timestamp: string;
  questionsSubmitted: number;
  testCasesPassed: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  submissions: UserSubmission[];
  tabSwitches: number;
  prompts_used: Map<string, number>;
}

// API base URL
const API_URL = 'http://localhost:5000/api';

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'submissions' | 'tabSwitches'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<UserSubmission | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
      // Auto-refresh every 10 seconds
      const interval = setInterval(() => {
        loadUsers();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      if (!user || !user.token) return;
      
      const { data } = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Get submissions for each user
      const usersWithSubmissions = await Promise.all(
        data.map(async (userData: any) => {
          try {
            const { data: submissions } = await axios.get(
              `${API_URL}/users/${userData._id}/submissions`,
              {
                headers: {
                  Authorization: `Bearer ${user.token}`
                }
              }
            );
            
            return {
              ...userData,
              submissions: submissions || []
            };
          } catch (error) {
            console.error(`Error fetching submissions for user ${userData._id}:`, error);
            return {
              ...userData,
              submissions: []
            };
          }
        })
      );
      
      setUsers(usersWithSubmissions);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSort = (field: 'name' | 'submissions' | 'tabSwitches') => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending order for new sort field
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedUsers = [...users]
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'submissions') {
        comparison = (a.submissions?.length || 0) - (b.submissions?.length || 0);
      } else if (sortBy === 'tabSwitches') {
        comparison = (a.tabSwitches || 0) - (b.tabSwitches || 0);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-4">
          <Input 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select 
              value={sortBy} 
              onValueChange={(value) => handleSort(value as 'name' | 'submissions' | 'tabSwitches')}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="submissions">Submissions</SelectItem>
                <SelectItem value="tabSwitches">Tab Switches</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Submissions</TableHead>
                <TableHead className="text-center">Tab Switches</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-center">
                      {user.submissions?.length || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.tabSwitches || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        {selectedUser && selectedUser._id === user._id && (
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{user.name}'s Activity</DialogTitle>
                            </DialogHeader>
                            
                            <Tabs defaultValue="submissions">
                              <TabsList>
                                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                                <TabsTrigger value="stats">Stats</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="submissions">
                                <div className="space-y-4">
                                  {user.submissions && user.submissions.length > 0 ? (
                                    user.submissions.map((submission, index) => {
                                      const problem = getProblemById(submission.problemId);
                                      const problemTitle = problem?.title || `Problem #${submission.problemId}`;
                                      const testCasesPassed = typeof submission.testCasesPassed === 'number' ? submission.testCasesPassed : 0;
                                      return (
                                        <div key={index} className="border rounded-lg p-3">
                                          <div className="flex justify-between items-start mb-2">
                                            <div>
                                              <h4 className="font-medium">
                                                {problemTitle}
                                              </h4>
                                              <div className="text-sm text-gray-500">
                                                {new Date(submission.timestamp).toLocaleString()}
                                              </div>
                                            </div>
                                            <Badge className={testCasesPassed > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                              {testCasesPassed} test cases passed
                                            </Badge>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            {submission.promptHistory && submission.promptHistory.length > 0 && (
                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    className="ml-2"
                                                  >
                                                    View AI Chat History
                                                  </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                  <DialogHeader>
                                                    <DialogTitle>AI Chat History</DialogTitle>
                                                  </DialogHeader>
                                                  <div className="space-y-3 mt-4">
                                                    {submission.promptHistory.map((message, i) => (
                                                      <div 
                                                        key={i} 
                                                        className={`p-3 rounded-lg ${
                                                          message.role === 'user' 
                                                            ? 'bg-primary text-white ml-6' 
                                                            : 'bg-gray-100 text-gray-800 mr-6'
                                                        }`}
                                                      >
                                                        <div className="text-xs font-medium mb-1">
                                                          {message.role === 'user' ? 'User' : 'AI Assistant'}
                                                        </div>
                                                        <div className="text-sm whitespace-pre-wrap">
                                                          {message.content}
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </DialogContent>
                                              </Dialog>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                      No submissions yet.
                                    </div>
                                  )}
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="stats">
                                <div className="space-y-4">
                                  <div className="border rounded-lg p-4">
                                    <div className="text-xl mb-2">Performance Summary</div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <div className="text-sm text-gray-500">Total Submissions</div>
                                        <div className="text-2xl font-semibold">
                                          {user.submissions?.length || 0}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-sm text-gray-500">Tab Switches</div>
                                        <div className="text-2xl font-semibold">
                                          {user.tabSwitches || 0}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-sm text-gray-500">Problems Solved</div>
                                        <div className="text-2xl font-semibold">
                                          {user.submissions?.filter(s => 
                                            s.testCasesPassed > 0
                                          ).length || 0}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-sm text-gray-500">Total AI Prompts</div>
                                        <div className="text-2xl font-semibold">
                                          {Object.values(user.prompts_used || {}).reduce((total, count) => total + count, 0)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;
