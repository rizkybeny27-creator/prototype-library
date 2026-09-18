"use client";

import { useState } from "react";
import type { ReactNode } from "react";

const TABS = [
  { id: "preview", label: "Project Preview" },
  { id: "feedback", label: "Feedback List" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function VersionTabs({
  previewPanel,
  feedbackPanel,
}: {
  previewPanel: ReactNode;
  feedbackPanel: ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("preview");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Version detail"
        className="flex w-fit gap-1 rounded-lg bg-zinc-100 p-1"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={active}
              aria-controls={`tabpanel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "preview" ? (
        <div
          role="tabpanel"
          id="tabpanel-preview"
          aria-labelledby="tab-preview"
          className="mt-4"
        >
          {previewPanel}
        </div>
      ) : (
        <div
          role="tabpanel"
          id="tabpanel-feedback"
          aria-labelledby="tab-feedback"
          className="mt-4"
        >
          {feedbackPanel}
        </div>
      )}
    </div>
  );
}