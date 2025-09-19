"use client";
import { useCallback, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import QuestionsList from "@/components/ReadQuestions/QuestionList";
import CreateQuestionModal from "@/components/Content/CreateQuestionModal";
import QuestionCardSkeleton from "@/components/Layout/QuestionCardSkeleton";

const QuestionsPage = ({ params }) => {
  const { userId, subjectId, topicId } = params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { data: session } = useSession();

  const fetchQuestions = useCallback(async () => {
    if (!session?.user?.id) return;

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
  }, [session, userId, subjectId, topicId]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchQuestions();
    }
  }, [session, fetchQuestions]);

  const handleCreateQuestion = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

  const handleQuestionCreated = useCallback((newQuestion) => {
    setQuestions((prev) => [...prev, newQuestion]);
  }, []);

  const handleToggleImportant = useCallback(
    async (questionId, important) => {
      try {
        const response = await fetch(
          `/api/content/${userId}/${subjectId}/${topicId}/questions/${questionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ important }),
          }
        );

        if (response.ok) {
          setQuestions((prev) =>
            prev.map((q) => (q._id === questionId ? { ...q, important } : q))
          );
        }
      } catch (error) {
        console.error("Error updating question importance:", error);
      }
    },
    [userId, subjectId, topicId]
  );

  const handleUpdateQuestion = useCallback((questionId) => {
    // TODO: Implement question update modal
    console.log("Update question:", questionId);
  }, []);

  const handleDeleteQuestion = useCallback(
    async (questionId) => {
      if (!confirm("Are you sure you want to delete this question?")) return;

      try {
        const response = await fetch(
          `/api/content/${userId}/${subjectId}/${topicId}/questions/${questionId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setQuestions((prev) => prev.filter((q) => q._id !== questionId));
        }
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    },
    [userId, subjectId, topicId]
  );

  const handleDifficultySelect = useCallback(
    async (questionId, difficulty) => {
      try {
        const response = await fetch(
          `/api/spaced-repetition/${userId}/review`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ questionId, difficulty }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Update the question in the local state with new spaced repetition data
          setQuestions((prev) =>
            prev.map((q) =>
              q._id === questionId ? { ...q, ...data.question } : q
            )
          );

          // Refresh questions to apply new filtering logic
          // This will hide questions that are no longer due
          fetchQuestions();
        } else {
          const errorData = await response.json();
          console.error("Error reviewing question:", errorData.error);
        }
      } catch (error) {
        console.error("Error reviewing question:", error);
      }
    },
    [userId, fetchQuestions]
  );

  if (loading) {
    return <QuestionCardSkeleton count={6} />;
  }

  return (
    <div>
      <QuestionsList
        questions={questions}
        onCreateQuestion={handleCreateQuestion}
        onToggleImportant={handleToggleImportant}
        onUpdateQuestion={handleUpdateQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onDifficultySelect={handleDifficultySelect}
        showDifficultyButtons={true}
      />

      <CreateQuestionModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onQuestionCreated={handleQuestionCreated}
        userId={userId}
        subjectId={subjectId}
        topicId={topicId}
      />
    </div>
  );
};

export default QuestionsPage;
