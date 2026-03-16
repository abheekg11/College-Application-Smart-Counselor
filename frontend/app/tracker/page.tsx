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

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; color: string; dot: string }
> = {
  "not-started": {
    label: "Not Started",
    bg: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    dot: "var(--border-medium)",
  },
  "in-progress": {
    label: "In Progress",
    bg: "var(--blue-light)",
    color: "var(--blue)",
    dot: "var(--blue)",
  },
  submitted: {
    label: "Submitted",
    bg: "var(--success-light)",
    color: "var(--success)",
    dot: "var(--success)",
  },
};

const ESSAY_STATUS_CONFIG = {
  "not-started": { label: "Not Started", bg: "var(--bg-tertiary)", color: "var(--text-tertiary)" },
  draft: { label: "Draft", bg: "var(--blue-light)", color: "var(--blue)" },
  completed: { label: "Done", bg: "var(--success-light)", color: "var(--success)" },
};

export default function TrackerPage() {
  const { profile, savedColleges } = useApp();
  const [applications, setApplications] = useState<Application[]>(
    savedColleges.map((college) => ({
      collegeId: college.id,
      collegeName: college.name,
      deadline: college.deadline,
      status: "not-started" as ApplicationStatus,
      essays: college.essays.map((essay) => ({
        prompt: essay.question,
        status: "not-started" as const,
      })),
    }))
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateApplicationStatus = (collegeId: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.collegeId === collegeId ? { ...app, status } : app))
    );
  };

  const updateEssayStatus = (
    collegeId: string,
    essayIndex: number,
    status: "not-started" | "draft" | "completed"
  ) => {
    setApplications((prev) =>
      prev.map((app) =>
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
    notStarted: applications.filter((a) => a.status === "not-started").length,
    inProgress: applications.filter((a) => a.status === "in-progress").length,
    submitted: applications.filter((a) => a.status === "submitted").length,
  };

  const totalEssays = applications.reduce((acc, app) => acc + app.essays.length, 0);
  const completedEssays = applications.reduce(
    (acc, app) => acc + app.essays.filter((e) => e.status === "completed").length,
    0
  );
  const draftEssays = applications.reduce(
    (acc, app) => acc + app.essays.filter((e) => e.status === "draft").length,
    0
  );
  const essayPct = totalEssays > 0 ? Math.round((completedEssays / totalEssays) * 100) : 0;

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1rem" }}>
          Create Your Profile First
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "1.125rem" }}>
          Start by creating your profile to track your college applications.
        </p>
        <Link href="/profile" className="btn btn-primary">
          Build Your Profile
        </Link>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1rem" }}>
          No Colleges Added Yet
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "1.125rem" }}>
          Add colleges to your list to start tracking your applications.
        </p>
        <Link href="/colleges" className="btn btn-primary">
          Browse Colleges
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Application Tracker
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Monitor the status of your applications and essay progress
        </p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { value: stats.total, label: "Total" },
          { value: stats.notStarted, label: "Not Started" },
          { value: stats.inProgress, label: "In Progress" },
          { value: stats.submitted, label: "Submitted" },
        ].map(({ value, label }) => (
          <div className="card" key={label} style={{ textAlign: "center", padding: "1.25rem" }}>
            <div className="stat-number">{value}</div>
            <div className="stat-label" style={{ marginTop: "0.25rem" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Essay Progress Banner */}
      <div className="card" style={{ marginBottom: "2rem", padding: "1.25rem 1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <div>
            <p style={{ fontWeight: 600, marginBottom: "0.125rem" }}>Overall Essay Progress</p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              {completedEssays} completed &bull; {draftEssays} in draft &bull;{" "}
              {totalEssays - completedEssays - draftEssays} not started
            </p>
          </div>
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: essayPct === 100 ? "var(--success)" : "var(--accent-orange)",
            }}
          >
            {essayPct}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${essayPct}%` }} />
        </div>
      </div>

      {/* Applications */}
      <div className="space-y-6">
        {applications
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          .map((app) => {
            const appEssayDone = app.essays.filter((e) => e.status === "completed").length;
            const appEssayPct =
              app.essays.length > 0 ? (appEssayDone / app.essays.length) * 100 : 0;
            const statusCfg = STATUS_CONFIG[app.status];
            const isExpanded = expandedIds.has(app.collegeId);

            return (
              <div key={app.collegeId} className="card" style={{ padding: "1.5rem" }}>
                {/* College Header Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      {app.collegeName}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--text-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                  {/* Status selector styled as a pill badge */}
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.375rem 0.875rem",
                        borderRadius: "999px",
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        border: "1px solid transparent",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: statusCfg.dot,
                          flexShrink: 0,
                        }}
                      />
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateApplicationStatus(app.collegeId, e.target.value as ApplicationStatus)
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "inherit",
                          fontWeight: "inherit",
                          fontSize: "inherit",
                          cursor: "pointer",
                          padding: 0,
                          appearance: "auto",
                        }}
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="submitted">Submitted</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Per-college essay progress bar */}
                <div
                  style={{
                    padding: "0.875rem 1rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8125rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                      Essay Progress
                    </span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {appEssayDone} / {app.essays.length}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${appEssayPct}%` }} />
                  </div>
                </div>

                {/* Expand / collapse essays */}
                {app.essays.length > 0 && (
                  <>
                    <button
                      onClick={() => toggleExpanded(app.collegeId)}
                      className="btn btn-ghost btn-sm"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <span>
                        Essay Requirements{" "}
                        <span style={{ color: "var(--text-tertiary)" }}>
                          ({app.essays.length})
                        </span>
                      </span>
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        style={{
                          transition: "transform 0.2s",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: "0.75rem" }} className="space-y-4">
                        {app.essays.map((essay, idx) => {
                          const essayCfg = ESSAY_STATUS_CONFIG[essay.status];
                          return (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "1rem",
                                padding: "0.875rem 1rem",
                                background: "var(--bg-secondary)",
                                borderRadius: "0.5rem",
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "0.875rem",
                                  color: "var(--text-primary)",
                                  flex: 1,
                                  lineHeight: 1.5,
                                }}
                              >
                                {essay.prompt}
                              </p>

                              {/* Essay status pill buttons */}
                              <div
                                style={{
                                  display: "flex",
                                  gap: "0.375rem",
                                  flexShrink: 0,
                                  flexWrap: "wrap",
                                  justifyContent: "flex-end",
                                }}
                              >
                                {(
                                  ["not-started", "draft", "completed"] as const
                                ).map((s) => {
                                  const cfg = ESSAY_STATUS_CONFIG[s];
                                  const active = essay.status === s;
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => updateEssayStatus(app.collegeId, idx, s)}
                                      style={{
                                        padding: "0.25rem 0.75rem",
                                        borderRadius: "999px",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        border: "1px solid transparent",
                                        cursor: "pointer",
                                        background: active ? cfg.bg : "transparent",
                                        color: active ? cfg.color : "var(--text-tertiary)",
                                        borderColor: active ? "transparent" : "var(--border-light)",
                                        transition: "all 0.15s ease",
                                      }}
                                    >
                                      {cfg.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
