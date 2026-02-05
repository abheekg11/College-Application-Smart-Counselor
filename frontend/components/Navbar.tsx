"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { profile, savedColleges } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/colleges", label: "Colleges" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tracker", label: "Tracker" },
    { href: "/project", label: "Essays" },
    { href: "/saved-colleges", label: `My List${savedColleges.length > 0 ? ` (${savedColleges.length})` : ''}` },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-light)',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}>
          {/* Logo */}
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            CollegePath
          </Link>

          {/* Desktop Nav */}
          <div style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.25rem',
          }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: isActive(link.href) ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive(link.href) ? 'var(--bg-secondary)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {profile ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }} className="desktop-nav">
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {profile.firstName} {profile.lastName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    GPA {profile.gpa.toFixed(2)}
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="btn btn-secondary btn-sm"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to logout? Your data will be cleared.')) {
                      localStorage.removeItem("studentProfile");
                      localStorage.removeItem("savedColleges");
                      window.location.href = "/";
                    }
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--warning)' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/profile" className="btn btn-primary desktop-nav">
                Get Started
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none',
                padding: '0.5rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid var(--border-light)',
            padding: '1rem 0',
          }} className="mobile-menu">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: isActive(link.href) ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive(link.href) ? 'var(--bg-secondary)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {profile ? (
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-light)',
                }}>
                  <div style={{
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {profile.firstName} {profile.lastName}
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                      GPA {profile.gpa.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to logout?')) {
                          localStorage.removeItem("studentProfile");
                          localStorage.removeItem("savedColleges");
                          window.location.href = "/";
                        }
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--warning)' }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn,
          .mobile-menu {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
