"use client";

import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { useEffect, useState } from "react";
import { colleges as allColleges } from "@/lib/collegeData";
import { recommendColleges } from "@/lib/scoring";
import CollegeCard from "@/components/CollegeCard";
import { College } from "@/types/college";

export default function HomePage() {
  const { profile } = useApp();
  const [topMatches, setTopMatches] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (profile) {
      const rec = recommendColleges(allColleges, profile).slice(0, 6);
      setTopMatches(rec);
    } else {
      setTopMatches(allColleges.slice(0, 6));
    }
  }, [profile]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = allColleges.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.majors && c.majors.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())))
      );
      if (filtered.length > 0) {
        window.location.href = `/colleges?search=${encodeURIComponent(searchQuery)}`;
      } else {
        alert("No colleges found matching your search.");
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      {/* HERO */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
              Your College Application Journey, Simplified
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Find your perfect college match, organize applications, and manage deadlines—all in one place.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
              <Link href="/profile" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                Get Started
              </Link>
              <Link href="/colleges" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                Browse Colleges
              </Link>
            </div>

            {/* Search */}
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search colleges, majors, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    paddingRight: '6rem',
                    fontSize: '1rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.5rem',
                  }}
                />
                <button
                  onClick={handleSearch}
                  className="btn btn-primary btn-sm"
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '3rem', textAlign: 'center' }}>
            Everything You Need
          </h2>

          <div className="grid-3">
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Smart Matching
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Get personalized college recommendations based on your profile, categorized into safety, target, and reach schools.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Deadline Tracker
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Never miss an application deadline with our comprehensive tracking system and timeline generator.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Essay Manager
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Organize all your essay prompts and track your progress across multiple applications.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Profile Builder
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Build a comprehensive profile with your academic records, activities, and preferences.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                College Database
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Access detailed information on hundreds of colleges including admission statistics and requirements.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Application Dashboard
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Monitor your entire application process from one central dashboard with progress tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TOP MATCHES */}
      {topMatches.length > 0 && (
        <section style={{ padding: '4rem 0', background: 'var(--bg-primary)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>
                {profile ? "Your Top Matches" : "Featured Colleges"}
              </h2>
              <Link href="/colleges" className="btn btn-ghost">
                View All →
              </Link>
            </div>

            <div className="grid-3">
              {topMatches.slice(0, 3).map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {!profile && (
        <section style={{ padding: '4rem 0', background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="card" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
                Ready to Get Started?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
                Create your profile in minutes and get personalized college recommendations.
              </p>
              <Link href="/profile" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                Create Your Profile
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
