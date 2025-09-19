// components/Content/CreateTopicModal.js
"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

const CreateTopicModal = ({ isOpen, onClose, subjectId, onTopicCreated }) => {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    if (!session) {
      setError("You must be logged in to create a topic");
      return;
    }

    if (!subjectId) {
      setError("No subject selected for this topic");
      return;
    }

    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/content/${session.user.id}/${subjectId}/createTopic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create topic");
      }

      const newTopic = await res.json();
      // Add the subject ID to the topic data for proper state management
      onTopicCreated({ ...newTopic, subjectId });
      onClose();
      // Reset form
      setTitle("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      id="create_topic_modal"
      className={`modal ${isOpen ? "modal-open" : ""}`}
    >
      <div className="modal-box w-11/12 max-w-md p-6 md:p-8 rounded-lg shadow-xl bg-base-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10"
        >
          ✕
        </button>

        <h3 className="font-bold text-2xl text-center mb-6 text-base-content">
          Create New Topic
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-base-content mb-1"
            >
              Topic Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Algebra, Calculus, etc."
              className="input input-bordered w-full rounded-md"
            />
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-full mt-6 rounded-md"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Create Topic"
            )}
          </button>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
};

export default CreateTopicModal;
