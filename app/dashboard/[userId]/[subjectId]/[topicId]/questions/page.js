"use client";

import { useEffect, useState } from "react";
import CreateQuestionModal from "@/components/Content/CreateQuestionModal";
import QuestionList from "@/components/ReadQuestions/QuestionList";
import QuestionSkeleton from "@/components/ReadQuestions/QuestionSkeleton";

export default function QuestionsPage({ params }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { userId, subjectId, topicId } = params;

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/content/${userId}/${subjectId}/${topicId}/fetchQuestions`
      );
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [userId, subjectId, topicId]);

  const handleQuestionCreated = async (newQuestion) => {
    setQuestions((prev) => [newQuestion, ...prev]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Questions</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn btn-primary"
        >
          Create Question
        </button>
      </div>

      {loading ? (
        <QuestionSkeleton count={3} />
      ) : (
        <QuestionList questions={questions} />
      )}

      <CreateQuestionModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        topicId={topicId}
        onQuestionCreated={handleQuestionCreated}
      />
    </div>
  );
}
