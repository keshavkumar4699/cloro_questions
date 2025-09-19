// components/Layout/HomeMidBar.js
"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import QuestionList from "@/components/ReadQuestions/QuestionList";
import QuestionCardSkeleton from "./QuestionCardSkeleton";

const HomeMidBar = () => {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllQuestions = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/content/${session.user.id}/fetchAllQuestions`
      );
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
        setFilteredQuestions(data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchSubjects = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(
        `/api/content/${session.user.id}/fetchSubject`
      );
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }, [session]);

  const fetchTopics = useCallback(
    async (subjectId) => {
      if (!session?.user?.id || !subjectId) return;

      try {
        const response = await fetch(
          `/api/content/${session.user.id}/${subjectId}/fetchTopics`
        );
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    },
    [session]
  );

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllQuestions();
      fetchSubjects();
    }
  }, [session, fetchAllQuestions, fetchSubjects]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject);
    } else {
      setTopics([]);
      setSelectedTopic(null);
    }
  }, [selectedSubject, fetchTopics]);

  useEffect(() => {
    let filtered = questions;

    if (selectedTopic) {
      filtered = questions.filter((q) => q.topic._id === selectedTopic);
    } else if (selectedSubject) {
      filtered = questions.filter((q) => q.subject._id === selectedSubject);
    }

    setFilteredQuestions(filtered);
  }, [questions, selectedSubject, selectedTopic]);

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId === selectedSubject ? null : subjectId);
    setSelectedTopic(null);
  };

  const handleTopicChange = (topicId) => {
    setSelectedTopic(topicId === selectedTopic ? null : topicId);
  };

  const handleToggleImportant = useCallback(
    async (questionId, important) => {
      try {
        const question = questions.find((q) => q._id === questionId);
        if (!question) return;

        const response = await fetch(
          `/api/content/${session.user.id}/${question.subject._id}/${question.topic._id}/questions/${questionId}`,
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
    [session, questions]
  );

  const handleUpdateQuestion = useCallback(() => {
    // TODO: Implement question update modal for home page
    // Update functionality will be implemented in a future update
  }, []);

  const handleDeleteQuestion = useCallback(
    async (questionId) => {
      if (!confirm("Are you sure you want to delete this question?")) return;

      try {
        const question = questions.find((q) => q._id === questionId);
        if (!question) return;

        const response = await fetch(
          `/api/content/${session.user.id}/${question.subject._id}/${question.topic._id}/questions/${questionId}`,
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
    [session, questions]
  );

  const handleDifficultySelect = useCallback(async () => {
    // Review functionality has been removed - questions are reviewed directly in topic pages
    return;
  }, []);

  if (loading) {
    return <QuestionCardSkeleton count={8} />;
  }

  return (
    <div className="mx-auto">
      {/* Filter Bar */}
      {subjects.length > 0 && (
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-sm font-medium text-base-content/70">
              Subjects:
            </span>
            {subjects.map((subject) => (
              <button
                key={subject._id}
                onClick={() => handleSubjectChange(subject._id)}
                className={`btn btn-sm ${
                  selectedSubject === subject._id
                    ? "btn-primary"
                    : "btn-outline btn-primary"
                }`}
              >
                {subject.emoji} {subject.title}
              </button>
            ))}
          </div>

          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-base-content/70">
                Topics:
              </span>
              {topics.map((topic) => (
                <button
                  key={topic._id}
                  onClick={() => handleTopicChange(topic._id)}
                  className={`btn btn-xs ${
                    selectedTopic === topic._id
                      ? "btn-secondary"
                      : "btn-outline btn-secondary"
                  }`}
                >
                  {topic.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Suspense fallback={<QuestionCardSkeleton />}>
        <QuestionList
          questions={filteredQuestions}
          showCreateCard={false}
          isHomePage={true}
          onToggleImportant={handleToggleImportant}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onDifficultySelect={handleDifficultySelect}
          showDifficultyButtons={true}
        />
      </Suspense>
    </div>
  );
};

export default HomeMidBar;
