// components/QuestionComponents/QuestionsList.jsx
"use client";
import { useEffect, useState } from "react";
// import { useRouter, usePathname } from "next/navigation";
import { QuestionSkeleton } from "./QuestionSkeleton";

export default function QuestionsList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const router = useRouter();
  // const pathname = usePathname();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/content/[userId]/questions");
        if (!res.ok) {
          const errData = await res
            .json()
            .catch(() => ({ message: "Server error" }));
          throw new Error(
            errData.message || `Failed to fetch questions: ${res.status}`
          );
        }
        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error("Fetch questions error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleQuestionClick = (question) => {
    // You can implement your own navigation logic here if needed
    // For now, just log the question or navigate to a question detail page if you have one
    console.log("Question clicked:", question);
  };

  const handleSM2 = (level, questionId, e) => {
    e.stopPropagation();
    console.log(`SM2 level ${level} for question ${questionId}`);
    // Implement SM2 algorithm logic here
  };

  const handleMarkImportant = (questionId, e) => {
    e.stopPropagation();
    console.log(`Mark question ${questionId} as important`);
    // Implement mark important logic here
  };

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-3">
        {[...Array(6)].map((_, i) => (
          <QuestionSkeleton key={i} />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="text-error text-center mt-8 p-4">Error: {error}</div>
    );
  if (!questions || questions.length === 0)
    return (
      <div className="text-center mt-8 text-base-content/70">
        No questions found.
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-3">
      {questions.map((question) => (
        <div
          key={question._id}
          className="card rounded-xl p-4 transition-all duration-300 border cursor-pointer bg-base-100 border-base-300 hover:bg-base-200 hover:border-primary/20 hover:shadow-md"
          onClick={() => handleQuestionClick(question)}
        >
          {/* Question Content */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {question.title}
            </h3>
            {question.content && (
              <p className="text-base-content/90 text-sm leading-relaxed line-clamp-3">
                {question.content}
              </p>
            )}
            {question.imageUrl && (
              <div className="rounded-lg overflow-hidden max-h-80 md:max-h-96 flex justify-center bg-base-200/30 mt-2">
                <img
                  src={question.imageUrl}
                  alt={question.title || "Question image"}
                  className="object-contain max-h-80 md:max-h-96 w-full"
                />
              </div>
            )}
          </div>

          {/* SM-2 and Important Buttons */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-1">
              {[0, 1, 2, 3].map((level) => (
                <button
                  key={level}
                  className="btn btn-xs btn-outline btn-primary"
                  onClick={(e) => handleSM2(level, question._id, e)}
                >
                  {level}
                </button>
              ))}
            </div>
            <button
              className="btn btn-xs btn-outline btn-secondary"
              onClick={(e) => handleMarkImportant(question._id, e)}
            >
              ★ Important
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
