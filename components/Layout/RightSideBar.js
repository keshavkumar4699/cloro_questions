"use client";
import { memo } from "react";
import { FireIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';

const RightSideBar = memo(() => {
  const trendingItems = [
    { id: 1, title: "The Future of AI", views: "10.2k", category: "Technology", icon: <FireIcon className="w-4 h-4 mr-1.5 text-error" /> },
    { id: 2, title: "New Space Discoveries", views: "8.7k", category: "Science", icon: <ChartBarIcon className="w-4 h-4 mr-1.5 text-info" /> },
    { id: 3, title: "Indie Game Spotlight", views: "6.5k", category: "Gaming", icon: <CogIcon className="w-4 h-4 mr-1.5 text-success" /> },
    { id: 4, title: "Sustainable Living Tips", views: "5.1k", category: "Lifestyle" },
  ];

  return (
    <div className="h-full flex flex-col">
      <aside className="flex-1 overflow-y-auto p-4 md:p-5">
        <h2 className="text-xs font-semibold mb-4 text-base-content/80 tracking-wider uppercase">
          Trending Now
        </h2>
        <div className="space-y-3">
          {trendingItems.map((item) => (
            <div
              key={item.id}
              className="bg-base-200/70 hover:bg-base-300/80 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] p-3 rounded-lg hover:shadow-sm cursor-pointer border border-base-300"
            >
              <div className="flex items-center text-xs text-primary mb-0.5">
                {item.icon}
                <span>{item.category}</span>
              </div>
              <h3 className="font-medium text-sm text-base-content leading-tight mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-base-content/60">
                {item.views} views
              </p>
            </div>
          ))}
        </div>

        <div className="divider my-6"></div>

        <div>
          <h2 className="text-xs font-semibold mb-3 text-base-content/80 tracking-wider uppercase">
            Filters
          </h2>
          <div className="form-control space-y-2">
            <label className="cursor-pointer label justify-start gap-2 hover:bg-base-200/50 rounded-lg px-2 transition-colors duration-150">
              <input type="checkbox" className="checkbox checkbox-sm checkbox-primary transition-colors duration-150" />
              <span className="label-text text-xs">Show All</span>
            </label>
            <label className="cursor-pointer label justify-start gap-2 hover:bg-base-200/50 rounded-lg px-2 transition-colors duration-150">
              <input type="checkbox" className="checkbox checkbox-sm transition-colors duration-150" />
              <span className="label-text text-xs">Only Following</span>
            </label>
          </div>
        </div>
      </aside>
    </div>
  );
});

RightSideBar.displayName = "RightSideBar";
export default RightSideBar;