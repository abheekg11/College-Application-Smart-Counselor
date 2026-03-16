"use client";

import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CollegeCard from "@/components/CollegeCard";
import { colleges as allColleges } from "@/lib/collegeData";
import { recommendColleges } from "@/lib/scoring";
import { fetchRecommendedColleges } from "@/lib/recommendationApi";
import { useEffect, useState } from "react";
import { College } from "@/types/college";

export default function DashboardPage() {
  const { profile, savedColleges } = useApp();
  const router = useRouter();
  const [topColleges, setTopColleges] = useState<College[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadTopMatches = async () => {
      if (!profile) {
        setTopColleges([]);
        return;
      }

      try {
        const backendResults = await fetchRecommendedColleges(profile, { page: 0, perPage: 50 });

        // Backfill any missing score fields to avoid empty metrics
        const locallyScored = recommendColleges(backendResults, profile);
        const localById = new Map(locallyScored.map((c) => [c.id, c]));
        const normalized = backendResults.map((c) => {
          const local = localById.get(c.id);
          return {
            ...c,
            alignmentScore: c.alignmentScore ?? local?.alignmentScore,
            admissionProbability: c.admissionProbability ?? local?.admissionProbability,
            category: c.category ?? local?.category,
          };
        });

        const sorted = [...normalized].sort((a, b) => (b.alignmentScore || 0) - (a.alignmentScore || 0));
        if (!cancelled) {
          setTopColleges(sorted.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to load dashboard backend recommendations, using local fallback:", error);
        const fallbackRecommended = recommendColleges(allColleges, profile);
        const fallbackSorted = [...fallbackRecommended].sort((a, b) => (b.alignmentScore || 0) - (a.alignmentScore || 0));
        if (!cancelled) {
          setTopColleges(fallbackSorted.slice(0, 6));
        }
      }
    };

    void loadTopMatches();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
          Welcome to CollegePath
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
          Let's get started by creating your profile.
        </p>
        <Link href="/profile" className="btn btn-primary">
          Create Your Profile
        </Link>
      </div>
    );
  }

  const upcomingDeadlines = savedColleges
    .map(college => ({
      college: college.name,
      deadline: college.deadline,
      date: new Date(college.deadline)
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Welcome Header */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Welcome back, {profile.firstName}!
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Here's your college application overview
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid-2" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number">{savedColleges.length}</div>
          <div className="stat-label">Colleges Saved</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number">{profile.gpa.toFixed(2)}</div>
          <div className="stat-label">Unweighted GPA</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number">{((profile as any).weightedGpa || profile.gpa).toFixed(2)}</div>
          <div className="stat-label">Weighted GPA</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number">{savedColleges.reduce((acc, c) => acc + c.essays.length, 0)}</div>
          <div className="stat-label">Essays to Write</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number">{profile.extracurriculars?.length || 0}</div>
          <div className="stat-label">Extracurriculars</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Top Matches for You</h2>
            <Link href="/colleges" className="btn btn-ghost">
              View All →
            </Link>
          </div>

          {topColleges.length > 0 ? (
            <div className="grid-2">
              {topColleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                Complete your profile to see personalized recommendations
              </p>
              <Link href="/profile" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Complete Profile
              </Link>
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Upcoming Deadlines</h3>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.875rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <p style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                      {item.college}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                      {item.deadline}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  No deadlines yet
                </p>
                <Link href="/colleges" className="btn btn-ghost btn-sm">
                  Add colleges to track deadlines
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
