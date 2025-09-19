// components/ReadQuestions/QuestionList.js
"use client";
import { PlusIcon } from "@heroicons/react/24/solid";
import QuestionCard from "@/components/SpacedRepetition/QuestionCard";
import { getDisplayableQuestions } from "@/libs/spacedRepetition";

export default function QuestionsList({
  questions = [],
  onCreateQuestion,
  showCreateCard = true,
  isHomePage = false,
  onToggleImportant,
  onUpdateQuestion,
  onDeleteQuestion,
  onDifficultySelect,
  showDifficultyButtons = false,
}) {
  // Filter questions to show only new and due questions (hide future questions)
  const displayableQuestions = getDisplayableQuestions(questions);

  if (questions.length === 0 && !isHomePage) {
    return (
      <div className="grid place-items-center min-h-[50vh]">
        <button
          onClick={onCreateQuestion}
          className="card w-96 bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-dashed border-base-300 hover:border-primary"
        >
          <div className="card-body items-center text-center">
            <PlusIcon className="h-12 w-12 text-primary" />
            <h2 className="card-title">Create Your First Question</h2>
            <p className="text-base-content/70">
              Start by adding questions to this topic
            </p>
          </div>
        </button>
      </div>
    );
  }

  if (questions.length === 0 && isHomePage) {
    return (
      <div className="grid place-items-center min-h-[50vh]">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="card-title">No Questions Yet</h2>
            <p className="text-base-content/70">
              Create subjects and topics, then add questions to start learning!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no displayable questions (but there might be future questions)
  if (
    displayableQuestions.length === 0 &&
    questions.length > 0 &&
    !isHomePage
  ) {
    return (
      <div className="grid place-items-center min-h-[50vh]">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="card-title">No Questions Due</h2>
            <p className="text-base-content/70">
              All questions are scheduled for future review. Great job staying
              on top of your learning!
            </p>
            <div className="text-sm text-base-content/50 mt-2">
              {questions.length} question{questions.length !== 1 ? "s" : ""}{" "}
              scheduled for later
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        {displayableQuestions.map((question) => (
          <QuestionCard
            key={question._id}
            question={question}
            onToggleImportant={onToggleImportant}
            onUpdate={onUpdateQuestion}
            onDelete={onDeleteQuestion}
            onDifficultySelect={onDifficultySelect}
            showDifficultyButtons={showDifficultyButtons}
          />
        ))}

        {showCreateCard && !isHomePage && (
          <button
            onClick={onCreateQuestion}
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-dashed border-base-300 hover:border-primary hover:bg-primary/5 min-h-[200px]"
          >
            <div className="card-body items-center justify-center text-center p-4">
              <PlusIcon className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium text-base-content">
                Add New Question
              </h3>
              <p className="text-xs text-base-content/60">Click to create</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
