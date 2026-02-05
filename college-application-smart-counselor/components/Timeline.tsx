"use client";

import { useApp } from "@/lib/AppContext";

interface TimelineEvent {
  date: string;
  title: string;
  college?: string;
  status: "upcoming" | "in-progress" | "completed";
}

export default function Timeline() {
  const { savedColleges } = useApp();

  // Generate timeline events from saved colleges
  const events: TimelineEvent[] = savedColleges.flatMap((college) => [
    {
      date: college.deadline,
      title: "Application Deadline",
      college: college.name,
      status: "upcoming" as const,
    },
  ]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Add colleges to your list to see deadlines</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex gap-4">
          {/* Timeline Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-4 h-4 rounded-full ${
                event.status === "completed"
                  ? "bg-sage"
                  : event.status === "in-progress"
                  ? "bg-terracotta"
                  : "bg-gray-300"
              }`}
            />
            {index < events.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2" />
            )}
          </div>

          {/* Event Content */}
          <div className="flex-1 pb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-charcoal">{event.title}</h4>
                  {event.college && (
                    <p className="text-sm text-slate-600">{event.college}</p>
                  )}
                </div>
                <span className="text-sm text-slate-500">{event.date}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}