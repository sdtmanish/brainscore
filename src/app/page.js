"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllQuizzes } from "@/lib/quizService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowRight, BookOpen } from "lucide-react";

export default function QuizHome() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-8 sm:py-14">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              BrainScore
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Challenge yourself with interactive quizzes and boost your knowledge
          </p>
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
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
          <Card className="text-center py-16">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quizzes Available</h2>
              <p className="text-gray-600 mb-6">
                Check back soon for exciting new quizzes!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="group p-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-2"
              >
                <CardHeader className="bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {quiz.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getQuizTypeColor(quiz.type)} variant="outline">
                      {quiz.type}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-200">
                      {quiz.questions?.length || 0} Questions
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardDescription className="text-gray-600 mb-6 line-clamp-2">
                    {quiz.description}
                  </CardDescription>
                  <Link href={`/quiz/${quiz.slug}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer hover:from-blue-700 hover:to-purple-700 group ">
                      Start Quiz
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
