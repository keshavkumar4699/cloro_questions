"use client";
import { memo, useCallback, useState, useEffect } from "react";
import Logo from "../Logo";
import {
  PlusIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import SidebarLink from "./SidebarLink";
import { navlinks } from "@/data/navlink";
import CreateSubjectModal from "../Content/CreateSubjectModal";
import CreateTopicModal from "../Content/CreateTopicModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SubjectSkeleton from "./SubjectSkeleton";
import TopicSkeleton from "./TopicSkeleton";

const LeftSidebar = memo(({ isMobileOpen, onMobileClose }) => {
  const router = useRouter();
  const [isCreateSubjectModalOpen, setCreateSubjectModalOpen] = useState(false);
  const [isCreateTopicModalOpen, setCreateTopicModalOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState({});
  const { data: session } = useSession();

  const fetchSubjects = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(
        `/api/content/${session.user.id}/fetchSubject`
      );
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);

        // Initialize expanded state for all subjects
        const initialExpanded = {};
        data.forEach((subject) => {
          initialExpanded[subject._id] = false;
        });
        setExpandedSubjects(initialExpanded);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchTopics = useCallback(
    async (subjectId) => {
      if (!session?.user?.id) return;

      try {
        setTopicsLoading((prev) => ({ ...prev, [subjectId]: true }));
        const response = await fetch(
          `/api/content/${session.user.id}/${subjectId}/fetchTopics`
        );
        if (response.ok) {
          const data = await response.json();
          setTopics((prev) => ({ ...prev, [subjectId]: data }));
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setTopicsLoading((prev) => ({ ...prev, [subjectId]: false }));
      }
    },
    [session]
  );

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubjects();
    }
  }, [session, fetchSubjects]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onMobileClose();
      }
    },
    [onMobileClose]
  );

  const handleCreateSubject = useCallback(() => {
    setCreateSubjectModalOpen(true);
    onMobileClose();
  }, []);

  const handleCloseCreateSubjectModal = useCallback(() => {
    setCreateSubjectModalOpen(false);
  }, []);

  const handleSubjectCreated = useCallback((newSubject) => {
    setSubjects((prev) => [newSubject, ...prev]);
    setExpandedSubjects((prev) => ({ ...prev, [newSubject._id]: false }));
  }, []);

  const toggleSubjectExpanded = useCallback(
    async (subjectId) => {
      const isExpanding = !expandedSubjects[subjectId];
      setExpandedSubjects((prev) => ({ ...prev, [subjectId]: isExpanding }));

      // Fetch topics if expanding and not already loaded
      if (isExpanding && !topics[subjectId]) {
        await fetchTopics(subjectId);
      }
    },
    [expandedSubjects, topics, fetchTopics]
  );

  const handleCreateTopic = useCallback((subjectId) => {
    setSelectedSubject(subjectId);
    setCreateTopicModalOpen(true);
  }, []);

  const handleCloseCreateTopicModal = useCallback(() => {
    setCreateTopicModalOpen(false);
    setSelectedSubject(null);
  }, []);

  const handleTopicCreated = useCallback((newTopic) => {
    setTopics((prev) => ({
      ...prev,
      [newTopic.subject]: [...(prev[newTopic.subject] || []), newTopic],
    }));
    // Ensure the subject is expanded to show the new topic
    setExpandedSubjects((prev) => ({ ...prev, [newTopic.subject]: true }));
  }, []);

  return (
    <>
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          aria-hidden="true"
          onClick={handleOverlayClick}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-56 bg-base-100 border-r border-base-300
          transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          flex flex-col
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          h-screen lg:h-[calc(100vh-73px)] lg:top-[73px]
        `}
      >
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-base-300">
          <Logo />
          <button
            onClick={onMobileClose}
            className="btn btn-ghost btn-sm btn-circle transition-transform hover:scale-110 active:scale-95"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-2">
              Subjects
            </h2>
            <button
              onClick={handleCreateSubject}
              className="btn btn-primary h-10 min-h-[2.5rem] px-3 rounded-full w-full flex items-center gap-1.5 whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Subject</span>
            </button>

            {loading ? (
              <SubjectSkeleton />
            ) : (
              <div className="space-y-1">
                {subjects.map((subject) => (
                  <div key={subject._id} className="rounded-md overflow-hidden">
                    <button
                      onClick={() => toggleSubjectExpanded(subject._id)}
                      className="flex items-center justify-between w-full px-2 py-2 text-sm hover:bg-base-300 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        {subject.emoji && (
                          <span className="mr-2">{subject.emoji}</span>
                        )}
                        <span className="truncate">{subject.title}</span>
                      </div>
                      {expandedSubjects[subject._id] ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>

                    {expandedSubjects[subject._id] && (
                      <div className="ml-4 mt-1 space-y-1">
                        <button
                          onClick={() => handleCreateTopic(subject._id)}
                          className="btn btn-primary btn-xs h-8 px-3 rounded-full w-full flex items-center gap-1.5 whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <PlusIcon className="h-3 w-3" />
                          <span>Create Topic</span>
                        </button>

                        {topicsLoading[subject._id] ? (
                          <TopicSkeleton />
                        ) : (
                          topics[subject._id]?.map((topic) => (
                            <button
                              key={topic._id}
                              onClick={() => {
                                router.push(
                                  `/dashboard/${session.user.id}/${subject._id}/${topic._id}/questions`
                                );
                                onMobileClose(); // Close mobile sidebar when navigating
                              }}
                              className="flex items-center px-2 py-2 text-sm hover:bg-base-300 rounded-md transition-colors w-full text-left"
                            >
                              <span className="truncate">{topic.title}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="divider my-0" />

          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-2">
              Navigation
            </h2>
            <SidebarLink items={navlinks} />
          </div>
        </div>

        <div className="p-4 border-t border-base-300">
          <p className="text-xs text-base-content/60 text-center">
            © {new Date().getFullYear()} Cloro
          </p>
        </div>
      </aside>

      <CreateSubjectModal
        isOpen={isCreateSubjectModalOpen}
        onClose={handleCloseCreateSubjectModal}
        onSubjectCreated={handleSubjectCreated}
      />

      <CreateTopicModal
        isOpen={isCreateTopicModalOpen}
        onClose={handleCloseCreateTopicModal}
        subjectId={selectedSubject}
        onTopicCreated={handleTopicCreated}
      />
    </>
  );
});

LeftSidebar.displayName = "LeftSidebar";
export default LeftSidebar;
