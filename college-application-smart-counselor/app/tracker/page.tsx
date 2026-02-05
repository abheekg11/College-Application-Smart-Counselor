"use client";

import { useApp } from "@/lib/AppContext";
import { useState } from "react";
import Link from "next/link";

type ApplicationStatus = "not-started" | "in-progress" | "submitted";

interface Application {
  collegeId: string;
  collegeName: string;
  deadline: string;
  status: ApplicationStatus;
  essays: {
    prompt: string;
    status: "not-started" | "draft" | "completed";
    wordCount?: number;
  }[];
}

export default function TrackerPage() {
  const { profile, savedColleges } = useApp();
  const [applications, setApplications] = useState<Application[]>(
    savedColleges.map(college => ({
      collegeId: college.id,
      collegeName: college.name,
      deadline: college.deadline,
      status: "not-started" as ApplicationStatus,
      essays: college.essays.map(essay => ({
        prompt: essay.question,
        status: "not-started" as const,
      })),
    }))
  );

  const updateApplicationStatus = (collegeId: string, status: ApplicationStatus) => {
    setApplications(prev =>
      prev.map(app =>
        app.collegeId === collegeId ? { ...app, status } : app
      )
    );
  };

  const updateEssayStatus = (
    collegeId: string,
    essayIndex: number,
    status: "not-started" | "draft" | "completed"
  ) => {
    setApplications(prev =>
      prev.map(app =>
        app.collegeId === collegeId
          ? {
              ...app,
              essays: app.essays.map((essay, idx) =>
                idx === essayIndex ? { ...essay, status } : essay
              ),
            }
          : app
      )
    );
  };

  const stats = {
    total: applications.length,
    notStarted: applications.filter(a => a.status === "not-started").length,
    inProgress: applications.filter(a => a.status === "in-progress").length,
    submitted: applications.filter(a => a.status === "submitted").length,
  };

  const totalEssays = applications.reduce((acc, app) => acc + app.essays.length, 0);
  const completedEssays = applications.reduce(
    (acc, app) => acc + app.essays.filter(e => e.status === "completed").length,
    0
  );

  if (!profile) {
    return (
      <div className="text-center space-y-6 py-20">
        <div className="w-20 h-20 mx-auto rounded-full bg-sage/10 flex items-center justify-center text-4xl">📋</div>
        <h2 className="font-display text-3xl font-bold text-charcoal">Create Your Profile First</h2>
        <p className="text-lg text-muted max-w-md mx-auto">Start by creating your profile to track your college applications.</p>
        <Link href="/profile" className="btn-primary inline-block">Build Your Profile</Link>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center space-y-6 py-20">
        <div className="w-20 h-20 mx-auto rounded-full bg-sage/10 flex items-center justify-center text-4xl">🎓</div>
        <h2 className="font-display text-3xl font-bold text-charcoal">No Colleges Added Yet</h2>
        <p className="text-lg text-muted max-w-md mx-auto">Add colleges to your list to start tracking your applications.</p>
        <Link href="/colleges" className="btn-primary inline-block">Browse Colleges</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="font-display text-3xl font-bold text-charcoal">Application Tracker</h1>
        <p className="text-lg text-muted">Keep track of your college applications and essay progress</p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-charcoal mb-1">{stats.total}</div>
          <div className="text-sm text-muted">Total Applications</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-charcoal mb-1">{stats.notStarted}</div>
          <div className="text-sm text-muted">Not Started</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-charcoal mb-1">{stats.inProgress}</div>
          <div className="text-sm text-muted">In Progress</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-charcoal mb-1">{stats.submitted}</div>
          <div className="text-sm text-muted">Submitted</div>
        </div>
      </div>

      {/* Essay Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-charcoal mb-4">Overall Essay Progress</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">
              {completedEssays} of {totalEssays} essays completed
            </span>
            <span className="font-medium text-charcoal">
              {totalEssays > 0 ? Math.round((completedEssays / totalEssays) * 100) : 0}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${totalEssays > 0 ? (completedEssays / totalEssays) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {applications
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          .map((app) => (
            <div key={app.collegeId} className="bg-white rounded-2xl border border-gray-100 p-6">
              {/* College Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-charcoal mb-1">
                    {app.collegeName}
                  </h3>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Deadline: {app.deadline}
                  </p>
                </div>

                {/* Status Selector */}
                <select
                  value={app.status}
                  onChange={(e) =>
                    updateApplicationStatus(app.collegeId, e.target.value as ApplicationStatus)
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${
                    app.status === "submitted"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : app.status === "in-progress"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                </select>
              </div>

              {/* Essays */}
              <div className="space-y-3">
                <h4 className="font-semibold text-charcoal text-sm">Essay Requirements:</h4>
                {app.essays.map((essay, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal mb-1">{essay.prompt}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => updateEssayStatus(app.collegeId, idx, "not-started")}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            essay.status === "not-started"
                              ? "bg-gray-200 text-gray-800"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Not Started
                        </button>
                        <button
                          onClick={() => updateEssayStatus(app.collegeId, idx, "draft")}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            essay.status === "draft"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Draft
                        </button>
                        <button
                          onClick={() => updateEssayStatus(app.collegeId, idx, "completed")}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            essay.status === "completed"
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Completed
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-slate-600 mb-2">
                  <span>Essay Progress</span>
                  <span>
                    {app.essays.filter(e => e.status === "completed").length} / {app.essays.length}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        (app.essays.filter(e => e.status === "completed").length /
                          app.essays.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}