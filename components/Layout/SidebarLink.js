"use client";
import { useState } from "react";
import Link from "next/link";

const SidebarLink = ({ items }) => {
  const [showAll, setShowAll] = useState(false);
  const shouldCollapse = items.length > 5;
  const visibleItems = shouldCollapse && !showAll ? items.slice(0, 5) : items;

  return (
    <div className="space-y-1">
      {visibleItems.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className="block px-2 py-2 text-sm hover:bg-base-200 rounded-md transition-colors"
          title={item.label}
        >
          {item.label}
        </Link>
      ))}

      {shouldCollapse && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="block w-full px-2 py-2 text-sm text-primary hover:bg-base-200 rounded-md transition-colors text-left"
        >
          {showAll ? "Show less" : `Show more (${items.length - 5})`}
        </button>
      )}
    </div>
  );
};

export default SidebarLink;