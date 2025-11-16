"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { getAllQuizzes, deleteQuiz } from "@/lib/quizService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const { logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;

    try {
      await deleteQuiz(quizToDelete.id);
      toast.success("Quiz deleted successfully");
      setQuizzes(quizzes.filter((q) => q.id !== quizToDelete.id));
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  const getQuizTypeColor = (type) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "image":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "mixed":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">Welcome, {user?.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Manage Quizzes</h2>
            <p className="text-gray-600 mt-2">Create, edit, and delete quiz content</p>
          </div>
          <Button
            onClick={() => router.push("/admin/quiz/create")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create New Quiz
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 text-lg mb-4">No quizzes found</p>
              <Button
                onClick={() => router.push("/admin/quiz/create")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Create Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{quiz.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={getQuizTypeColor(quiz.type)} variant="outline">
                      {quiz.type}
                    </Badge>
                    <Badge variant="secondary">{quiz.questions?.length || 0} Questions</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => router.push(`/admin/quiz/edit/${quiz.id}`)}
                    className="w-full"
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      setQuizToDelete(quiz);
                      setDeleteDialogOpen(true);
                    }}
                    className="w-full"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => router.push(`/quiz/${quiz.slug}`)}
                    className="w-full"
                    variant="secondary"
                  >
                    Preview
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
