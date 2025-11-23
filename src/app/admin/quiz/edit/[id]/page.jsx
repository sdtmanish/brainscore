"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getQuizById, updateQuiz, validateQuizData } from "@/lib/quizService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2, Plus, ArrowLeft } from "lucide-react";

export default function EditQuizPage() {
  return (
    <ProtectedRoute>
      <EditQuizForm />
    </ProtectedRoute>
  );
}

function EditQuizForm() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizType, setQuizType] = useState("text");
  const [questions, setQuestions] = useState([]);

  const questionEndRef = useRef(null);

  const scrollToBottom = () => {
    questionEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const quiz = await getQuizById(quizId);
      if (!quiz) {
        toast.error("Quiz not found");
        router.push("/admin");
        return;
      }

      setSlug(quiz.slug);
      setTitle(quiz.title);
      setDescription(quiz.description);
      setQuizType(quiz.type);
      setQuestions(
        (quiz.questions || []).map(q => ({
          ...q,
          image: q.image || q.imageUrl || "",
        }))
      );
    } catch (error) {
      toast.error("Failed to load quiz");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question: "",
        image: "",
        options: ["", "", "", ""],
        correctIndex: 0,
      },
    ]);
    setTimeout(scrollToBottom, 80);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length <= 2) {
      toast.error("Question must have at least 2 options");
      return;
    }
    updated[qIndex].options.splice(oIndex, 1);
    if (updated[qIndex].correctIndex >= updated[qIndex].options.length) {
      updated[qIndex].correctIndex = updated[qIndex].options.length - 1;
    }
    setQuestions(updated);
  };

  const handleFileUpload = async (e, qIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingIndex(qIndex);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const endpoint = file.type.startsWith("video")
      ? `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`
      : `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        handleQuestionChange(qIndex, "image", response.secure_url);
        setUploadingIndex(null);
        toast.success("Media uploaded successfully");
      } else {
        toast.error("Upload failed");
        setUploadingIndex(null);
      }
    };

    xhr.onerror = () => {
      toast.error("Upload error");
      setUploadingIndex(null);
    };

    xhr.send(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (uploadingIndex !== null) {
      toast.error("Please wait until upload completes.");
      setSaving(false);
      return;
    }

    const quizData = {
      slug: slug.toLowerCase().trim(),
      title: title.trim(),
      description: description.trim(),
      type: quizType,
      questions: questions.map((q) => ({
        question: q.question.trim(),
        image: q.image?.trim() || undefined,
        options: q.options.map((opt) => opt.trim()),
        correctIndex: q.correctIndex,
      })),
    };

    const errors = validateQuizData(quizData);
    if (errors.length > 0) {
      toast.error(errors[0]);
      setSaving(false);
      return;
    }

    try {
      await updateQuiz(quizId, quizData);
      toast.success("Quiz updated successfully!");
      router.push("/admin");
    } catch (error) {
      toast.error(error.message || "Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <header className="bg-white border-b border-gray-200 p-4">
          <Skeleton className="h-8 w-48" />
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Button onClick={() => router.push("/admin")} variant="ghost" className="cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Quiz
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Basic information</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label>Quiz Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div>
                <Label>URL Slug *</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} pattern="[a-z0-9-]+" required />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>

              <div>
                <Label>Quiz Type *</Label>
                <Select value={quizType} onValueChange={setQuizType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Only</SelectItem>
                    <SelectItem value="image/Video">Image/Video Only</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Questions</h2>
              <Button type="button" onClick={handleAddQuestion} variant="outline" className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={qIndex}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Question {qIndex + 1}</CardTitle>
                    <Button type="button" variant="ghost" size="sm" className="cursor-pointer"
                      onClick={() => handleRemoveQuestion(qIndex)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Textarea
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                    rows={2}
                    required
                  />

                  {(quizType === "image/Video" || quizType === "mixed") && (
                    <div className="space-y-2">
                      <Label>Upload Image / Video</Label>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e, qIndex)}
                        className="border p-2 rounded cursor-pointer"
                        disabled={uploadingIndex !== null}
                      />

                      {uploadingIndex === qIndex && (
                        <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                          <div
                            className="bg-blue-600 h-3 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}

                      {question.image && uploadingIndex !== qIndex && (
                        <>
                          {question.image.includes("/video/") ? (
                            <video src={question.image} className="w-48 h-32 rounded mt-2" controls />
                          ) : (
                            <img src={question.image} className="w-32 h-32 rounded mt-2 object-cover" />
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <Separator />

                  <RadioGroup
                    value={question.correctIndex.toString()}
                    onValueChange={(val) =>
                      handleQuestionChange(qIndex, "correctIndex", parseInt(val))
                    }
                  >
                    {question.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <RadioGroupItem value={oIndex.toString()}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                        <Input
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          required
                          className="flex-1"
                        />
                        {question.options.length > 2 && (
                          <Button type="button" variant="ghost" size="sm" className="cursor-pointer"
                            onClick={() => handleRemoveOption(qIndex, oIndex)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </RadioGroup>

                  <Button type="button" variant="outline" size="sm" className="cursor-pointer"
                    onClick={() => handleAddOption(qIndex)}>
                    <Plus className="w-3 h-3 mr-1" /> Add Option
                  </Button>
                </CardContent>
              </Card>
            ))}

            <div ref={questionEndRef} />
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin")} className="flex-1 cursor-pointer">
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving || uploadingIndex !== null}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer"
            >
              {uploadingIndex !== null ? "Uploading media..." : saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

        </form>
      </main>
    </div>
  );
}
