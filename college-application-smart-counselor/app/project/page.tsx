"use client";

import { useApp } from "@/lib/AppContext";
import { useState } from "react";
import Link from "next/link";

type EssayStatus = "not-started" | "draft" | "completed";

interface Essay {
  collegeId: string;
  collegeName: string;
  prompt: string;
  wordLimit: number;
  status: EssayStatus;
  content?: string;
}

export default function EssayPage() {
  const { profile, savedColleges } = useApp();
  
  // Generate essays from saved colleges
  const [essays, setEssays] = useState<Essay[]>(() => {
    const allEssays: Essay[] = [];
    savedColleges.forEach(college => {
      college.essays.forEach(essayReq => {
        allEssays.push({
          collegeId: college.id,
          collegeName: college.name,
          prompt: essayReq.question,
          wordLimit: essayReq.wordLimit,
          status: "not-started",
          content: ""
        });
      });
    });
    return allEssays;
  });

  const updateEssayStatus = (index: number, status: EssayStatus) => {
    setEssays(prev => prev.map((essay, i) => 
      i === index ? { ...essay, status } : essay
    ));
  };

  const stats = {
    total: essays.length,
    notStarted: essays.filter(e => e.status === "not-started").length,
    draft: essays.filter(e => e.status === "draft").length,
    completed: essays.filter(e => e.status === "completed").length,
  };

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
          Create Your Profile First
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
          Start by creating your profile to manage your college essays.
        </p>
        <Link href="/profile" className="btn btn-primary">
          Build Your Profile
        </Link>
      </div>
    );
  }

  if (essays.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
          No Essays Yet
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
          Add colleges to your list to start tracking their essay requirements.
        </p>
        <Link href="/colleges" className="btn btn-primary">
          Browse Colleges
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Essay Manager
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Track and organize your college application essays
        </p>
      </div>

      {/* Stats */}
      <div className="grid-2" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Essays</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number">{stats.notStarted}</div>
          <div className="stat-label">Not Started</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number">{stats.draft}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Overall Progress</h3>
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <span>{stats.completed} of {stats.total} essays completed</span>
            <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Essays List */}
      <div className="space-y-6">
        {/* Group essays by college */}
        {Array.from(new Set(essays.map(e => e.collegeName))).map(collegeName => {
          const collegeEssays = essays.filter(e => e.collegeName === collegeName);
          const collegeEssaysIndexes = essays
            .map((e, i) => ({ essay: e, index: i }))
            .filter(({ essay }) => essay.collegeName === collegeName);
          
          return (
            <div key={collegeName} className="card">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                {collegeName}
              </h2>

              <div className="space-y-4">
                {collegeEssaysIndexes.map(({ essay, index }) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '0.5rem',
                    }}
                  >
                    <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
                      {essay.prompt}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                      Maximum {essay.wordLimit} words
                    </p>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => updateEssayStatus(index, "not-started")}
                        className="btn btn-sm"
                        style={{
                          background: essay.status === "not-started" ? 'var(--bg-tertiary)' : 'transparent',
                          border: '1px solid var(--border-medium)',
                        }}
                      >
                        Not Started
                      </button>
                      <button
                        onClick={() => updateEssayStatus(index, "draft")}
                        className="btn btn-sm"
                        style={{
                          background: essay.status === "draft" ? 'var(--blue-light)' : 'transparent',
                          color: essay.status === "draft" ? 'var(--blue)' : 'var(--text-primary)',
                          border: essay.status === "draft" ? '1px solid var(--blue)' : '1px solid var(--border-medium)',
                        }}
                      >
                        Draft
                      </button>
                      <button
                        onClick={() => updateEssayStatus(index, "completed")}
                        className="btn btn-sm"
                        style={{
                          background: essay.status === "completed" ? 'var(--success-light)' : 'transparent',
                          color: essay.status === "completed" ? 'var(--success)' : 'var(--text-primary)',
                          border: essay.status === "completed" ? '1px solid var(--success)' : '1px solid var(--border-medium)',
                        }}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
