"use client";
import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";

const CreateQuestionModal = ({
  isOpen,
  onClose,
  onQuestionCreated,
  userId,
  subjectId,
  topicId,
}) => {
  const [formData, setFormData] = useState({
    question: "",
    important: false,
  });
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/content/${userId}/${subjectId}/${topicId}/createQuestion`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (response.ok) {
          const data = await response.json();
          onQuestionCreated(data);
          setFormData({
            question: "",
            important: false,
          });
          onClose();
        } else {
          console.error("Failed to create question");
        }
      } catch (error) {
        console.error("Error creating question:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      formData,
      onClose,
      onQuestionCreated,
      session?.user?.id,
      userId,
      subjectId,
      topicId,
    ]
  );

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Create New Question</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Question</span>
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-24"
                  placeholder="Enter your question here..."
                  required
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Mark as Important</span>
                  <input
                    type="checkbox"
                    name="important"
                    checked={formData.important}
                    onChange={handleChange}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  Create Question
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateQuestionModal;
