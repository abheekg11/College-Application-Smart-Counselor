"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { useSearchParams } from "next/navigation";
import { colleges as allColleges } from "@/lib/collegeData";
import { recommendColleges } from "@/lib/scoring";
import { fetchRecommendedColleges } from "@/lib/recommendationApi";
import { College } from "@/types/college";
import CollegeCard from "@/components/CollegeCard";
import Link from "next/link";

export default function CollegesPage() {
  const { profile } = useApp();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "Safety" | "Target" | "Reach">("all");
  const [sortBy, setSortBy] = useState<"alignment" | "probability" | "cost">("alignment");

  useEffect(() => {
    let cancelled = false;

    const loadRecommendations = async () => {
      if (!profile) {
        setColleges([]);
        return;
      }

      try {
        const mapped = await fetchRecommendedColleges(profile, { page: 0, perPage: 50 });

        // Backfill missing values if backend doesn't return recommendation fields for any reason
        const locallyScored = recommendColleges(mapped, profile);
        const localById = new Map(locallyScored.map((c) => [c.id, c]));
        const normalized = mapped.map((c) => {
          const local = localById.get(c.id);
          return {
            ...c,
            alignmentScore: c.alignmentScore ?? local?.alignmentScore,
            admissionProbability: c.admissionProbability ?? local?.admissionProbability,
            category: c.category ?? local?.category,
          };
        });

        const filtered = searchQuery.trim()
          ? normalized.filter((c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.majors.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()))
            )
          : normalized;

        if (!cancelled) {
          setColleges(filtered);
        }
      } catch (error) {
        console.error("Failed to load backend recommendations, falling back to local data:", error);
        let fallback = allColleges;
        if (searchQuery.trim()) {
          fallback = allColleges.filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.majors && c.majors.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())))
          );
        }
        const fallbackRecommended = recommendColleges(fallback, profile);
        if (!cancelled) {
          setColleges(fallbackRecommended);
        }
      }
    };

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [profile, searchQuery]);

  const filteredColleges = colleges.filter((college) =>
    selectedCategory === "all" ? true : college.category === selectedCategory
  );

  const sortedColleges = [...filteredColleges].sort((a, b) => {
    if (sortBy === "alignment") {
      return (b.alignmentScore || 0) - (a.alignmentScore || 0);
    } else if (sortBy === "probability") {
      return (b.admissionProbability || 0) - (a.admissionProbability || 0);
    } else {
      return a.avgCost - b.avgCost;
    }
  });

  const stats = {
    safety: colleges.filter((c) => c.category === "Safety").length,
    target: colleges.filter((c) => c.category === "Target").length,
    reach: colleges.filter((c) => c.category === "Reach").length,
  };

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
          Create Your Profile First
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
          To get personalized college recommendations, please complete your profile.
        </p>
        <Link href="/profile" className="btn btn-primary">
          Build Your Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Your College Matches
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Based on your profile, we've found {colleges.length} colleges for you
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number" style={{ color: 'var(--success)' }}>{stats.safety}</div>
          <div className="stat-label">Safety Schools</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            50%+ acceptance
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number" style={{ color: 'var(--blue)' }}>{stats.target}</div>
          <div className="stat-label">Target Schools</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            20-50% acceptance
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-number" style={{ color: 'var(--accent-orange)' }}>{stats.reach}</div>
          <div className="stat-label">Reach Schools</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            &lt;20% acceptance
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            >
              All ({colleges.length})
            </button>
            <button
              onClick={() => setSelectedCategory("Safety")}
              className={selectedCategory === "Safety" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            >
              Safety ({stats.safety})
            </button>
            <button
              onClick={() => setSelectedCategory("Target")}
              className={selectedCategory === "Target" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            >
              Target ({stats.target})
            </button>
            <button
              onClick={() => setSelectedCategory("Reach")}
              className={selectedCategory === "Reach" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            >
              Reach ({stats.reach})
            </button>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 0 }}>
              Sort:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ padding: '0.375rem 0.75rem' }}
            >
              <option value="alignment">Best Match</option>
              <option value="probability">Admission Chance</option>
              <option value="cost">Lowest Cost</option>
            </select>
          </div>
        </div>
      </div>

      {/* College Grid */}
      {sortedColleges.length > 0 ? (
        <div className="grid-3">
          {sortedColleges.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
            No colleges found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
