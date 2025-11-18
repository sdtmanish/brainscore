"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getQuizBySlug } from "@/lib/quizService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Home, RotateCcw, ArrowRight, Trophy, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function QuizPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [slug]);

  const loadQuiz = async () => {
    try {
      const data = await getQuizBySlug(slug);
      if (!data) {
        toast.error("Quiz not found");
        router.push("/");
        return;
      }
      setQuiz(data);
    } catch (error) {
      toast.error("Failed to load quiz");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const handleNext = () => {
    if (selected === quiz.questions[current].correctIndex) {
      setScore(score + 1);
    }

    if (current === quiz.questions.length - 1) {
      setIsFinished(true);
    } else {
      setCurrent(current + 1);
    }

    setSelected(null);
    setShowAnswer(false);
  };

  const handleSelect = (index) => {
    if (showAnswer) return;
    setSelected(index);
    setShowAnswer(true);
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setIsFinished(false);
    setShowAnswer(false);
  };

  const getOptionClassName = (index) => {
    if (!showAnswer) return "border-gray-300 hover:bg-gray-50 cursor-pointer";
    if (index === quiz.questions[current].correctIndex)
      return "border-green-500 bg-green-50 text-green-900";
    if (index === selected) return "border-red-500 bg-red-50 text-red-900";
    return "border-gray-300 opacity-50";
  };

  const getOptionIcon = (index) => {
    if (!showAnswer) return null;
    if (index === quiz.questions[current].correctIndex)
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (index === selected) return <XCircle className="w-5 h-5 text-red-600" />;
    return null;
  };

  if (quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
          <Card className="p-6 border-2 shadow-lg">
            <p className="text-lg font-medium text-gray-700">
              🚧 This quiz currently has no questions.
            </p>
          </Card>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const progress = ((current + 1) / quiz.questions.length) * 100;
  const currentQuestion = quiz.questions[current];
  const isVideo =
    currentQuestion.image?.includes(".mp4") ||
    currentQuestion.image?.includes(".mov") ||
    currentQuestion.image?.includes("/video/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {!isFinished ? (
          <>
            <div className="mb-2 sm:mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Question {current + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="text-center mb-4  sm:mb-8">
              <h1 className="text-3xl font-bold">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.description}</p>
            </div>

            <Card className="shadow-xl border-2 p-2">
              <CardHeader >
                <CardTitle className="text-xl sm:text-2xl ">Q{current + 1}. {currentQuestion.question}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* MEDIA LEFT, OPTIONS RIGHT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-6 items-start">

                  {/* MEDIA */}
                  {currentQuestion.image && currentQuestion.image.trim() !== "" && (
                    <div className="rounded-lg overflow-hidden border-2 border-gray-200 max-h-[200px] sm:max-h-[500px]">
                      {isVideo ? (
                        <video
                          src={currentQuestion.image}
                          controls
                          className="w-full max-h-[500px] object-contain"
                          onError={() => toast.error("Failed to load video")}
                        />
                      ) : (
                        <img
                          src={currentQuestion.image}
                          alt="Question visual"
                          className="w-full max-h-[200px] sm:max-h-[500px] object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            toast.error("Failed to load image");
                          }}
                        />
                      )}
                    </div>
                  )}


                  {/* OPTIONS */}
                  <div>
                    <RadioGroup value={selected?.toString()} className="space-y-1">
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelect(index)}
                          className={`flex items-center space-x-3 border-2 rounded-lg p-2 sm:p-4 transition-all ${getOptionClassName(
                            index
                          )}`}
                        >
                          <RadioGroupItem
                            value={index.toString()}
                            checked={selected === index}
                            disabled={showAnswer}
                          />
                          <Label className="flex-1 cursor-pointer text-base">{option}</Label>
                          {getOptionIcon(index)}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                </div>

                <Button
                  onClick={handleNext}
                  disabled={!showAnswer}
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-lg py-6"
                >
                  {current === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="shadow-2xl border-2 mt-16">
            <CardHeader className="text-center space-y-4 pb-2">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
              <CardTitle className="text-4xl font-extrabold">Quiz Completed!</CardTitle>
              <CardDescription className="text-lg">Great job completing {quiz.title}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2">
                <p className="text-6xl font-extrabold text-green-500 mb-2">
                  {score} / {quiz.questions.length}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                <Button onClick={handleRestart} variant="outline" className="w-full py-6 text-lg cursor-pointer">
                  <RotateCcw className="w-5 h-5 mr-2" /> Try Again
                </Button>

                <Link href="/" className="w-full ">
                  <Button className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer ">
                    <Home className="w-5 h-5 mr-2" /> Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
