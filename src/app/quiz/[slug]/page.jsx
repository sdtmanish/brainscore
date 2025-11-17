"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getQuizBySlug } from "@/lib/quizService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
      console.log("Quiz data loaded:", data);
      console.log("Questions with images:", data.questions.map((q, i) => ({
        questionNum: i + 1,
        hasImage: !!q.image,
        imageUrl: q.image
      })));
      setQuiz(data);
    } catch (error) {
      console.error("Failed to load quiz:", error);
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

    if (index === quiz.questions[current].correctIndex) {
      return "border-green-500 bg-green-50 text-green-900";
    }

    if (index === selected) {
      return "border-red-500 bg-red-50 text-red-900";
    }

    return "border-gray-300 opacity-50";
  };

  const getOptionIcon = (index) => {
    if (!showAnswer) return null;
    
    if (index === quiz.questions[current].correctIndex) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    
    if (index === selected) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {!isFinished ? (
          <>
            {/* Progress bar */}
            <div className="mb-4 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {current + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2 sm:h-3" />
            </div>

            {/* Quiz Info */}
            <div className="text-center mb-4 sm:mb-8">
              <h1 className="text-xl sm:text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {quiz.title}
              </h1>
              <p className="text-gray-600">{quiz.description}</p>
            </div>

            {/* Question Card */}
            <Card className="shadow-xl border-2 p-2">
              <CardHeader>
                <CardTitle className="text-base sm:text-2xl">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Layout: Image on left, Options on right */}
                {currentQuestion.image && currentQuestion.image.trim() !== "" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Question Image - Left Side */}
                    <div className="rounded-lg overflow-hidden border-2 border-gray-200 h-fit">
                      <img
                        src={currentQuestion.image}
                        alt="Question visual"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Failed to load image:", currentQuestion.image);
                          e.target.style.display = "none";
                          toast.error("Failed to load image. Please check the URL.");
                        }}
                        onLoad={() => {
                          console.log("Image loaded successfully:", currentQuestion.image);
                        }}
                      />
                    </div>

                    {/* Options - Right Side */}
                    <RadioGroup value={selected?.toString()} className="space-y-1">
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelect(index)}
                          className={`flex items-center space-x-3 border-2 rounded-lg py-2 px-1 transition-all ${getOptionClassName(index)}`}
                        >
                          <RadioGroupItem
                            value={index.toString()}
                            id={`option-${index}`}
                            checked={selected === index}
                            disabled={showAnswer}
                          />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer text-base"
                          >
                            {option}
                          </Label>
                          {getOptionIcon(index)}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  /* Options only - No Image */
                  <RadioGroup value={selected?.toString()} className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelect(index)}
                        className={`flex items-center space-x-3 border-2 rounded-lg p-4 transition-all ${getOptionClassName(index)}`}
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                          checked={selected === index}
                          disabled={showAnswer}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer text-base"
                        >
                          {option}
                        </Label>
                        {getOptionIcon(index)}
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Next Button */}
                <Button
                  onClick={handleNext}
                  disabled={!showAnswer}
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-lg py-6"
                >
                  {current === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Results Screen */
          <Card className="shadow-2xl border-2 mt-8 sm:mt-16 lg:mt-24 mr-2">
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="flex justify-center">
                <Trophy className="w-20 h-20 text-yellow-500" />
              </div>
              <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quiz Completed!
              </CardTitle>
              <CardDescription className="text-lg">
                Great job completing {quiz.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Score Display */}
              <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2">
                <p className="text-6xl font-extrabold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent mb-2">
                  {score} / {quiz.questions.length}
                </p>
                <p className="text-gray-600 text-lg">
                  {score === quiz.questions.length
                    ? "Perfect Score! 🎉"
                    : score >= quiz.questions.length * 0.7
                    ? "Great Job! 🌟"
                    : score >= quiz.questions.length * 0.5
                    ? "Good Effort! 💪"
                    : "Keep Practicing! 📚"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="w-full py-6 text-lg cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5 mr-2 " />
                  Try Again
                </Button>
                <Link href="/" className="w-full">
                  <Button className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg">
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
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
