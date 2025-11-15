"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { QUIZZES } from "@/app/data/quizzes";

export default function QuizPage() {
  const { slug } = useParams();
  const quiz = QUIZZES.find((q) => q.slug === slug);

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!quiz) return <h2 className="text-center text-xl font-semibold mt-10">Quiz not found!</h2>;

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
    setSelected(index);
    setShowAnswer(true);
  };

  const getOptionStyles = (index) => {
    if (!showAnswer) return "bg-white border-gray-300 hover:bg-gray-100";

    if (index === quiz.questions[current].correctIndex)
      return "bg-green-500 text-white border-green-600";

    if (index === selected)
      return "bg-red-500 text-white border-red-600";

    return "bg-white border-gray-300 opacity-50";
  };

  const progress = ((current + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-3 rounded-full mb-8">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h1 className="text-4xl font-bold mb-2 text-center">{quiz.title}</h1>
        <p className="text-lg text-gray-600 text-center mb-10">{quiz.description}</p>

        {!isFinished ? (
          <div className="border border-gray-200 shadow-sm p-8 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">
              {current + 1}. {quiz.questions[current].question}
            </h2>

            {/* Question Image */}
            {quiz.questions[current].image && (
              <img
                src={quiz.questions[current].image}
                alt="Question Visual"
                className="w-full max-h-60 object-cover rounded-lg mb-6 shadow-md"
              />
            )}

            <div className="space-y-3 mb-8">
              {quiz.questions[current].options.map((opt, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={showAnswer}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer ${getOptionStyles(index)}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!showAnswer}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer
                ${showAnswer
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {current === quiz.questions.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        ) : (
          <div className="text-center mt-10 p-8 rounded-2xl shadow-xl bg-white/70 backdrop-blur-md border border-gray-200">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text animate-pulse">
              🎉 Quiz Completed!
            </h2>

            <p className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-green-500 to-teal-400 text-transparent bg-clip-text">
              {score} / {quiz.questions.length}
            </p>

            <p className="text-lg text-gray-600 mb-6">
              Great job! Keep practicing and improving 🚀
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all duration-200 shadow-md cursor-pointer"
              >
                Try Again
              </button>

              <a
                href="/"
                className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-all duration-200 shadow-md cursor-pointer"
              >
                Back to Quizzes
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
