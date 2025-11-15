"use client";

import { useState } from "react";

export default function UploadPage() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [image, setImage] = useState("");
  const [savedQuestions, setSavedQuestions] = useState([]);

  const handleAddQuestion = () => {
    const newQ = {
      slug,
      title,
      question,
      options,
      correctIndex,
      image,
    };

    setSavedQuestions([...savedQuestions, newQ]);

    // Reset fields
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(null);
    setImage("");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-14">
      <div className="max-w-3xl mx-auto">

        {/* Page Heading */}
        <h1 className="text-5xl font-extrabold mb-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Upload Quiz Questions
        </h1>

        <p className="text-lg text-gray-600 text-center mb-10">
          Add questions to any quiz category
        </p>

        {/* Form Card */}
        <div className="border border-gray-200 shadow-xl p-8 rounded-2xl mb-10 bg-white">
          
          {/* Slug */}
          <input
            type="text"
            placeholder="Quiz Slug (e.g., frontend-basics)"
            className="w-full border p-3 rounded-lg mb-4"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          {/* Title */}
          <input
            type="text"
            placeholder="Quiz Title (e.g., Frontend Basics)"
            className="w-full border p-3 rounded-lg mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Question */}
          <input
            type="text"
            placeholder="Question"
            className="w-full border p-3 rounded-lg mb-4"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          {/* Image URL */}
          <input
            type="text"
            placeholder="Image URL (optional)"
            className="w-full border p-3 rounded-lg mb-4"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          {/* Options */}
          <div className="space-y-3 mb-4">
            {options.map((opt, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Option ${index + 1}`}
                className="w-full border p-3 rounded-lg"
                value={opt}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
              />
            ))}
          </div>

          {/* Correct Option */}
          <select
            className="w-full border p-3 rounded-lg mb-6"
            value={correctIndex ?? ""}
            onChange={(e) => setCorrectIndex(parseInt(e.target.value))}
          >
            <option value="">Select correct option</option>
            {options.map((_, index) => (
              <option key={index} value={index}>Option {index + 1}</option>
            ))}
          </select>

          {/* Button */}
          <button
            onClick={handleAddQuestion}
            className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all duration-200 shadow-md cursor-pointer"
          >
            Add Question
          </button>
        </div>

        {/* Saved Questions Preview */}
        <h2 className="text-2xl font-semibold mb-4 text-center">Saved Questions Preview</h2>
        <div className="space-y-3">
          {savedQuestions.map((q, i) => (
            <div key={i} className="border border-gray-200 p-4 rounded-xl shadow-sm">
              <p className="font-semibold">{q.question}</p>
              <p className="text-gray-600 text-sm">Correct Answer: {q.options[q.correctIndex]}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
