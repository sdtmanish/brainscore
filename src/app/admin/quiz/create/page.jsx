"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createQuiz, validateQuizData } from "@/lib/quizService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Trash2, Plus, ArrowLeft } from "lucide-react";

export default function CreateQuizPage() {
  return (
    <ProtectedRoute>
      <CreateQuizForm />
    </ProtectedRoute>
  );
}

function CreateQuizForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Quiz metadata
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizType, setQuizType] = useState("text");
  
  // Questions
  const [questions, setQuestions] = useState([
    {
      question: "",
      image: "",
      options: ["", "", "", ""],
      correctIndex: 0,
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        image: "",
        options: ["", "", "", ""],
        correctIndex: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) {
      toast.error("Quiz must have at least one question");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleAddOption = (questionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.push("");
    setQuestions(updated);
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length <= 2) {
      toast.error("Question must have at least 2 options");
      return;
    }
    updated[questionIndex].options.splice(optionIndex, 1);
    // Adjust correctIndex if necessary
    if (updated[questionIndex].correctIndex >= updated[questionIndex].options.length) {
      updated[questionIndex].correctIndex = updated[questionIndex].options.length - 1;
    }
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const quizData = {
      slug: slug.toLowerCase().trim(),
      title: title.trim(),
      description: description.trim(),
      type: quizType,
      questions: questions.map((q) => ({
        question: q.question.trim(),
        image: q.image.trim() || undefined,
        options: q.options.map((opt) => opt.trim()),
        correctIndex: q.correctIndex,
      })),
    };

    // Validate
    const errors = validateQuizData(quizData);
    if (errors.length > 0) {
      toast.error(errors[0]);
      setLoading(false);
      return;
    }

    try {
      await createQuiz(quizData);
      toast.success("Quiz created successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("Failed to create quiz:", error);
      toast.error(error.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Button
            onClick={() => router.push("/admin")}
            variant="ghost"
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Quiz
          </h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Basic information about your quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Frontend Basics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., frontend-basics"
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                  required
                />
                <p className="text-sm text-gray-500">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the quiz content"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Quiz Type *</Label>
                <Select value={quizType} onValueChange={setQuizType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Only</SelectItem>
                    <SelectItem value="image">Image Only</SelectItem>
                    <SelectItem value="mixed">Mixed (Text & Images)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  {quizType === "text" && "All questions will be text-based"}
                  {quizType === "image" && "All questions will include images"}
                  {quizType === "mixed" && "Questions can optionally include images"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Questions</h2>
              <Button type="button" onClick={handleAddQuestion} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={qIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Text *</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "question", e.target.value)
                      }
                      placeholder="Enter your question"
                      rows={2}
                      required
                    />
                  </div>

                  {(quizType === "image" || quizType === "mixed") && (
                    <div className="space-y-2">
                      <Label>
                        Image URL {quizType === "image" ? "*" : "(Optional)"}
                      </Label>
                      <Input
                        value={question.image}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, "image", e.target.value)
                        }
                        placeholder="https://images.unsplash.com/photo-xxx/image.jpg"
                        type="url"
                        required={quizType === "image"}
                      />
                      <p className="text-xs text-amber-600">
                        ⚠️ Use direct image URLs (ending in .jpg, .png, .gif, etc.). For Unsplash: Right-click image → "Copy Image Address"
                      </p>
                      {question.image && (
                        <div className="mt-2">
                          <img
                            src={question.image}
                            alt="Preview"
                            className="max-h-48 rounded-lg border"
                            onError={(e) => {
                              e.target.style.display = "none";
                              toast.error("Invalid image URL");
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Options (Select Correct Answer) *</Label>
                      <Button
                        type="button"
                        onClick={() => handleAddOption(qIndex)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Option
                      </Button>
                    </div>

                    <RadioGroup
                      value={question.correctIndex.toString()}
                      onValueChange={(value) =>
                        handleQuestionChange(qIndex, "correctIndex", parseInt(value))
                      }
                    >
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <RadioGroupItem
                            value={oIndex.toString()}
                            id={`q${qIndex}-o${oIndex}`}
                          />
                          <Input
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            required
                            className="flex-1"
                          />
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              onClick={() => handleRemoveOption(qIndex, oIndex)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => router.push("/admin")}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
