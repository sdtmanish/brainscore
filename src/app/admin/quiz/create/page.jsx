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

  // Media uploading progress
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Quiz metadata
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizType, setQuizType] = useState("text");

  const [questions, setQuestions] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (uploading) {
      toast.error("Please wait until the media finishes uploading.");
      setLoading(false);
      return;
    }

    const quizData = {
      slug: slug.toLowerCase().trim(),
      title: title.trim(),
      description: description.trim(),
      type: quizType,
      questions: questions.map((q) => ({
        question: q.question.trim(),
        image: q.image ? q.image.trim() : undefined,
        options: q.options.map((opt) => opt.trim()),
        correctIndex: q.correctIndex,
      })),
    };

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
      toast.error(error.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, qIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
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
        setUploading(false);
        setUploadProgress(0);
        toast.success("Media uploaded successfully");
      } else {
        toast.error("Failed to upload file");
        setUploading(false);
      }
    };

    xhr.onerror = () => {
      toast.error("Upload error");
      setUploading(false);
    };

    xhr.send(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Button onClick={() => router.push("/admin")} variant="ghost" className="mb-2 cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Quiz
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Quiz details */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Basic information about your quiz</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label>Quiz Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div>
                <Label>Slug *</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>

              <div>
                <Label>Type *</Label>
                <Select value={quizType} onValueChange={setQuizType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Only</SelectItem>
                    <SelectItem value="image">Image/Video Only</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Questions</h2>
            <Button type="button" onClick={handleAddQuestion} variant="outline" className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>

          {questions.map((question, qIndex) => (
            <Card key={qIndex}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>Question {qIndex + 1}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveQuestion(qIndex)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <Textarea
                  value={question.question}
                  onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                  placeholder="Enter question text"
                  required
                />

                {(quizType === "image" || quizType === "mixed") && (
                  <div className="space-y-2">
                    <Label>Upload Image / Video</Label>

                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e, qIndex)}
                      className="border p-2 rounded"
                    />

                    {uploading && (
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}

                    {question.image && !uploading && (
                      <>
                        {question.image.includes(".mp4") ||
                        question.image.includes("video") ? (
                          <video src={question.image} className="w-48 h-32 rounded mt-2" controls />
                        ) : (
                          <img src={question.image} className="w-32 h-32 rounded mt-2 object-cover" />
                        )}
                      </>
                    )}
                  </div>
                )}

                <Separator />

                <div>
                  <Label>Options *</Label>
                  <RadioGroup
                    value={question.correctIndex.toString()}
                    onValueChange={(value) =>
                      handleQuestionChange(qIndex, "correctIndex", parseInt(value))
                    }
                  >
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex gap-2 items-center mt-1">
                        <RadioGroupItem value={oIndex.toString()} 
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"/>

                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          required
                        />

                        {question.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = [...questions];
                              updated[qIndex].options.splice(oIndex, 1);
                              setQuestions(updated);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </RadioGroup>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddOption(qIndex)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Option
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/admin")} className="flex-1 cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer">
              {uploading ? "Uploading media..." : loading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
