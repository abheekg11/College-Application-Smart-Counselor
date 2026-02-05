"use client";

import { useApp } from "@/lib/AppContext";
import Link from "next/link";
import { useState } from "react";

export default function SavedCollegesPage() {
  const { savedColleges, removeSavedCollege } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (savedColleges.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
          No Colleges Saved Yet
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
          Start saving colleges from the Colleges page to organize your application list.
        </p>
        <Link href="/colleges" className="btn btn-primary">
          Browse Colleges
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          My Saved Colleges
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          You have saved {savedColleges.length} college{savedColleges.length !== 1 ? "s" : ""} to your list
        </p>
      </div>

      {/* Colleges Grid */}
      <div className="space-y-6">
        {savedColleges.map((college) => (
          <div key={college.id} className="card" style={{ padding: '1.5rem' }}>
            {/* College Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {college.name}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {college.location}
                </p>
              </div>
              <button
                onClick={() => removeSavedCollege(college.id)}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--warning)' }}
              >
                Remove
              </button>
            </div>

            {/* College Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              padding: '1rem 0',
              borderTop: '1px solid var(--border-light)',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '1rem'
            }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                  Avg GPA
                </p>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  {college.avgGPA.toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                  Avg SAT
                </p>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  {college.avgSAT}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                  Acceptance Rate
                </p>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  {Math.round(college.acceptanceRate)}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                  Annual Cost
                </p>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  ${(college.avgCost / 1000).toFixed(0)}k
                </p>
              </div>
            </div>

            {/* Majors */}
            {college.majors && college.majors.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Popular Majors
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {college.majors.slice(0, 5).map((major, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.8125rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '0.375rem'
                      }}
                    >
                      {major}
                    </span>
                  ))}
                  {college.majors.length > 5 && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', padding: '0.25rem 0.5rem' }}>
                      +{college.majors.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Essays - Expandable */}
            {college.essays && college.essays.length > 0 && (
              <div>
                <button
                  onClick={() => setExpandedId(expandedId === college.id ? null : college.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span>Essay Prompts ({college.essays.length})</span>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    style={{
                      transition: 'transform 0.2s',
                      transform: expandedId === college.id ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedId === college.id && (
                  <div style={{ marginTop: '1rem' }} className="space-y-4">
                    {college.essays.map((essay, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.875rem',
                          background: 'var(--bg-secondary)',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          {essay.question}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {essay.wordLimit} words maximum
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Deadline */}
            {college.deadline && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-light)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}>
                <strong>Application Deadline:</strong> {college.deadline}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
