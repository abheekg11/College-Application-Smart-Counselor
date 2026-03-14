"use client";

import { College } from "@/types/college";
import { useApp } from "@/lib/AppContext";

interface CollegeCardProps {
  college: College;
}

export default function CollegeCard({ college }: CollegeCardProps) {
  const { isSaved, addSavedCollege, removeSavedCollege } = useApp();
  const saved = isSaved(college.id);

  const toggleSave = () => {
    if (saved) {
      removeSavedCollege(college.id);
    } else {
      addSavedCollege(college);
    }
  };

  const getCategoryBadge = () => {
    const category = college.category || "target";
    const config = {
      safety: { label: "Safety", class: "badge-safety" },
      Safety: { label: "Safety", class: "badge-safety" },
      target: { label: "Target", class: "badge-target" },
      Target: { label: "Target", class: "badge-target" },
      reach: { label: "Reach", class: "badge-reach" },
      Reach: { label: "Reach", class: "badge-reach" },
    };
    return config[category as keyof typeof config] || config.target;
  };

  const badge = getCategoryBadge();

  return (
    <div className="card card-hover">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {college.name}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {college.location}
          </p>
          <span className={`badge ${badge.class}`}>{badge.label}</span>
        </div>
        
        <button
          onClick={toggleSave}
          style={{
            padding: '0.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '0.375rem',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          aria-label={saved ? "Remove from saved" : "Save college"}
        >
          <svg
            width="20"
            height="20"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{ color: saved ? 'var(--accent-orange)' : 'var(--text-tertiary)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          padding: '0.75rem',
          background: 'var(--bg-secondary)',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', minHeight: '2.5rem', lineHeight: 1.35 }}>
            Acceptance Rate
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {college.acceptanceRate ? `${Math.round(college.acceptanceRate)}%` : "N/A"}
          </div>
        </div>
        <div style={{
          padding: '0.75rem',
          background: 'var(--bg-secondary)',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', minHeight: '2.5rem', lineHeight: 1.35 }}>
            Match Score
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
            {college.alignmentScore !== undefined && college.alignmentScore !== null
              ? `${Math.round(college.alignmentScore)}%`
              : "N/A"}
          </div>
        </div>
        <div style={{
          padding: '0.75rem',
          background: 'var(--bg-secondary)',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', minHeight: '2.5rem', lineHeight: 1.35 }}>
            Admission Probability
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
            {college.admissionProbability !== undefined && college.admissionProbability !== null
              ? `${Math.round(college.admissionProbability)}%`
              : "N/A"}
          </div>
        </div>
      </div>

      {college.deadline && (
        <div style={{
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-light)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Deadline: {college.deadline}</span>
        </div>
      )}
    </div>
  );
}
