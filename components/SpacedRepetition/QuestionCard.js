// components/SpacedRepetition/QuestionCard.js
"use client";
import { useState } from "react";
import {
  StarIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { isQuestionDue, isQuestionNew } from "@/libs/spacedRepetition";

const QuestionCard = ({
  question,
  onToggleImportant,
  onUpdate,
  onDelete,
  onDifficultySelect,
  showDifficultyButtons = false,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Determine card background based on question status
  const getCardBackground = () => {
    if (question.important) {
      return "bg-primary/10 border-primary";
    }
    if (isQuestionNew(question)) {
      return "bg-blue-50 border-blue-200";
    }
    return "bg-base-100 border-base-300";
  };

  // Determine if difficulty buttons should be shown
  const shouldShowDifficultyButtons = () => {
    return (
      showDifficultyButtons &&
      (isQuestionNew(question) || isQuestionDue(question))
    );
  };

  // Difficulty options with updated labels and intervals
  const difficultyOptions = [
    {
      key: "no idea",
      label: "No Idea",
      description: "1 day",
      color: "error",
      icon: <XMarkIcon className="w-4 h-4" />,
    },
    {
      key: "hard",
      label: "Hard",
      description: "2 days",
      color: "warning",
      icon: <ExclamationTriangleIcon className="w-4 h-4" />,
    },
    {
      key: "medium",
      label: "Medium",
      description: "5 days",
      color: "info",
      icon: <ClockIcon className="w-4 h-4" />,
    },
    {
      key: "easy",
      label: "Easy",
      description: "10 days",
      color: "success",
      icon: <CheckCircleIcon className="w-4 h-4" />,
    },
  ];

  const handleDifficultySelect = async (difficulty) => {
    if (!onDifficultySelect || isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);
      await onDifficultySelect(question._id, difficulty.key);
    } catch (err) {
      setError("Failed to process difficulty rating. Please try again.");
      console.error("Error processing difficulty:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleImportant = () => {
    if (onToggleImportant) {
      onToggleImportant(question._id, !question.important);
    }
  };

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(question._id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(question._id);
    }
  };

  return (
    <div
      className={`card shadow-lg hover:shadow-xl transition-all duration-300 border ${getCardBackground()}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="card-body p-4">
        {/* Header with subject name and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Subject name prominently displayed */}
            <div className="badge badge-primary badge-sm mb-2">
              {question.subject?.title || "Unknown Subject"}
            </div>

            {/* Question status indicator */}
            {isQuestionNew(question) && (
              <div className="badge badge-info badge-xs ml-2">New</div>
            )}
            {!isQuestionNew(question) && isQuestionDue(question) && (
              <div className="badge badge-warning badge-xs ml-2">Due</div>
            )}
          </div>

          {/* Action buttons */}
          <div
            className={`flex gap-1 transition-opacity duration-200 ${
              showActions ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Star button for importance */}
            <button
              onClick={handleToggleImportant}
              className={`btn btn-ghost btn-xs btn-circle ${
                question.important ? "text-primary" : "text-base-content/50"
              }`}
              title={
                question.important
                  ? "Remove from important"
                  : "Mark as important"
              }
            >
              {question.important ? (
                <StarIcon className="w-4 h-4" />
              ) : (
                <StarOutlineIcon className="w-4 h-4" />
              )}
            </button>

            {/* Update button */}
            <button
              onClick={handleUpdate}
              className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-info"
              title="Edit question"
            >
              <PencilIcon className="w-4 h-4" />
            </button>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-error"
              title="Delete question"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question content */}
        <div className="mb-4">
          <p className="text-base-content leading-relaxed whitespace-pre-wrap line-clamp-4">
            {question.question}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-error alert-sm mt-2">
            <span className="text-xs">{error}</span>
          </div>
        )}

        {/* Difficulty buttons for due questions */}
        {shouldShowDifficultyButtons() && (
          <div className="mt-4">
            <div className="divider text-xs">How difficult was this?</div>
            <div className="grid grid-cols-2 gap-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleDifficultySelect(option)}
                  disabled={isProcessing}
                  className={`btn btn-outline btn-${
                    option.color
                  } btn-sm flex-col h-auto py-2 ${
                    isProcessing ? "loading" : ""
                  }`}
                >
                  {isProcessing ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 mb-1">
                        {option.icon}
                        <span className="font-medium text-xs">
                          {option.label}
                        </span>
                      </div>
                      <span className="text-xs opacity-70">
                        {option.description}
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-xs text-base-content/60 mt-2">
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          <div className="flex gap-2">
            {question.reviewCount > 0 && (
              <span className="badge badge-ghost badge-xs">
                Review #{question.reviewCount}
              </span>
            )}
            {question.lastDifficulty && (
              <span className="badge badge-ghost badge-xs">
                Last: {question.lastDifficulty}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
