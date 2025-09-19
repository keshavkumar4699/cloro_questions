// components/Subject/CreateSubjectModal.js
"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

const CreateSubjectModal = ({ isOpen, onClose, onSubjectCreated }) => {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#000000");
  const [emoji, setEmoji] = useState("📚");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    if (!session) {
      setError("You must be logged in to create a subject");
      return;
    }

    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/content/${session.user.id}/createSubject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          color,
          emoji,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create subject");
      }

      const newSubject = await res.json();
      onSubjectCreated(newSubject);
      onClose();
      // Reset form
      setTitle("");
      setColor("#000000");
      setEmoji("📚");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      id="create_subject_modal"
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
          Create New Subject
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-base-content mb-1"
            >
              Subject Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Mathematics"
              className="input input-bordered w-full rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="color"
              className="block text-sm font-medium text-base-content mb-1"
            >
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-full border-0 p-0"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
                className="input input-bordered w-full rounded-md"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="emoji"
              className="block text-sm font-medium text-base-content mb-1"
            >
              Emoji
            </label>
            <input
              type="text"
              id="emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="Press ⊞ + . for emoji"
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
              "Create Subject"
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

export default CreateSubjectModal;
