"use client";

import Link from "next/link";
import { QUIZZES } from "@/app/data/quizzes";

export default function QuizHome() {
  return (
    <div className="min-h-screen bg-white text-gray-900 px-2 sm:px-6 py-14">
      <div className="max-w-3xl mx-auto border border-gray-300 rounded-2xl p-2  ">
        <h1 className=" text-xl sm:text-5xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent text-center mb-3">
          Available Quizzes
        </h1>
        <p className=" text-md sm:text-lg text-gray-600 text-center mb-6 sm:mb-12">
          Select a quiz to begin your learning journey
        </p>

        <div className="space-y-3 sm:space-y-6">
          {QUIZZES.map((quiz) => (
            <div
              key={quiz.slug}
              className="border border-gray-200 bg-white shadow-md rounded-2xl p-6 
              hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-semibold">{quiz.title}</h2>
                <span className="text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                  {quiz.questions.length} Qs
                </span>
              </div>

              <p className="text-gray-600 mt-2 mb-6 text-sm sm:text-lg">{quiz.description}</p>

              <Link href={`/quiz/${quiz.slug}`}>
                <button
                  className="w-full px-6 py-2 sm:py-3 rounded-xl bg-slate-900 text-white font-semibold cursor-pointer
                  hover:bg-slate-800 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
                >
                  Start Quiz
                  <span className="text-lg">→</span>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
