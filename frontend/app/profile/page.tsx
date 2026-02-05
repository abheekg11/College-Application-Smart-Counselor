"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { StudentProfile } from "@/types/profile";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, setProfile } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [showError, setShowError] = useState(false);

  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    firstName: "",
    lastName: "",
    gpa: 0,
    weightedGpa: 0,
    satScore: 0,
    intendedMajor: "",
    academicInterests: [],
    extracurriculars: [],
    locationPreference: "",
    maxCost: 50000,
    essays: [],
    careerGoals: "",
    ...profile,
  });

  const [currentExtracurricular, setCurrentExtracurricular] = useState({
    activity: "",
    role: "",
    years: 1,
    hoursPerWeek: 1,
    description: "",
  });

  const [gpaInput, setGpaInput] = useState<string>(
    formData.gpa !== undefined && formData.gpa !== null ? String(formData.gpa) : ""
  );
  const [satInput, setSatInput] = useState<string>(
    formData.satScore !== undefined && formData.satScore !== null ? String(formData.satScore) : ""
  );
  const [weightedInput, setWeightedInput] = useState<string>(
    (formData as any).weightedGpa !== undefined && (formData as any).weightedGpa !== null ? String((formData as any).weightedGpa) : ""
  );
  const [academicInterestsInput, setAcademicInterestsInput] = useState<string>(
    formData.academicInterests?.join(", ") || ""
  );

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({ ...prev, ...profile }));
      setGpaInput(profile.gpa !== undefined && profile.gpa !== null ? String(profile.gpa) : "");
      setSatInput(profile.satScore !== undefined && profile.satScore !== null ? String(profile.satScore) : "");
      setWeightedInput((profile as any).weightedGpa !== undefined && (profile as any).weightedGpa !== null ? String((profile as any).weightedGpa) : "");
      setAcademicInterestsInput(profile.academicInterests?.join(", ") || "");
    }
  }, [profile]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addExtracurricular = () => {
    if (!currentExtracurricular.activity || !currentExtracurricular.role) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    updateField("extracurriculars", [
      ...(formData.extracurriculars || []),
      currentExtracurricular,
    ]);
    setCurrentExtracurricular({
      activity: "",
      role: "",
      years: 1,
      hoursPerWeek: 1,
      description: "",
    });
  };

  const removeExtracurricular = (index: number) => {
    const updated = formData.extracurriculars?.filter((_, i) => i !== index) || [];
    updateField("extracurriculars", updated);
  };

  const saveProfile = () => {
    const finalProfile: StudentProfile = {
      ...(formData as StudentProfile),
      gpa: parseFloat(gpaInput) || 0,
      satScore: parseInt(satInput) || 0,
      weightedGpa: parseFloat(weightedInput) || 0,
      academicInterests: academicInterestsInput.split(",").map((s) => s.trim()).filter(Boolean),
    };

    setProfile(finalProfile);
    router.push("/dashboard");
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Build Your Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Help us understand you better to find your perfect college matches
        </p>

        <div style={{ maxWidth: '500px', margin: '1.5rem auto 0' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem',
            padding: '0 0.5rem'
          }}>
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {step === 1 && (
          <div className="space-y-6">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Personal Information
            </h2>

            <div className="grid-2">
              <div>
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="John"
                />
              </div>

              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label>Career Goals</label>
              <textarea
                value={formData.careerGoals}
                onChange={(e) => updateField("careerGoals", e.target.value)}
                placeholder="Describe your career aspirations..."
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Academic Profile
            </h2>

            <div className="grid-2">
              <div>
                <label>Unweighted GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={gpaInput}
                  onChange={(e) => setGpaInput(e.target.value)}
                  onBlur={() => updateField("gpa", parseFloat(gpaInput) || 0)}
                  placeholder="3.8"
                />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  Out of 4.0 scale
                </p>
              </div>

              <div>
                <label>Weighted GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5.0"
                  value={weightedInput}
                  onChange={(e) => setWeightedInput(e.target.value)}
                  onBlur={() => updateField("weightedGpa", parseFloat(weightedInput) || 0)}
                  placeholder="4.2"
                />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  Out of 5.0 scale (weighted)
                </p>
              </div>
            </div>

            <div>
              <label>SAT Score</label>
              <input
                type="number"
                min="400"
                max="1600"
                value={satInput}
                onChange={(e) => setSatInput(e.target.value)}
                onBlur={() => updateField("satScore", parseInt(satInput) || 0)}
                placeholder="1400"
              />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                Out of 1600
              </p>
            </div>

            <div>
              <label>Intended Major</label>
              <select
                value={formData.intendedMajor}
                onChange={(e) => updateField("intendedMajor", e.target.value)}
              >
                <option value="">Select a major</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Biology">Biology</option>
                <option value="Psychology">Psychology</option>
                <option value="Economics">Economics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Political Science">Political Science</option>
                <option value="Communications">Communications</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label>Academic Interests (separate with commas)</label>
              <input
                type="text"
                value={academicInterestsInput}
                onChange={(e) => setAcademicInterestsInput(e.target.value)}
                placeholder="Artificial Intelligence, Robotics, Data Science"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Extracurricular Activities
            </h2>

            {showError && (
              <div style={{
                padding: '1rem',
                background: 'var(--warning-light)',
                color: 'var(--warning)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Please fill in both Activity Name and Your Role before adding.
              </div>
            )}

            {formData.extracurriculars && formData.extracurriculars.length > 0 && (
              <div className="space-y-4">
                {formData.extracurriculars.map((ec, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{ec.activity}</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ec.role}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                        {ec.years} year{ec.years > 1 ? "s" : ""} • {ec.hoursPerWeek} hrs/week
                      </p>
                      {ec.description && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          {ec.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeExtracurricular(index)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--warning)' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              padding: '1.5rem',
              background: 'var(--bg-secondary)',
              borderRadius: '0.5rem',
              border: '2px dashed var(--border-medium)'
            }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Add Activity</h3>

              <div className="grid-2 space-y-4" style={{ marginBottom: '1rem' }}>
                <div>
                  <label>Activity Name *</label>
                  <input
                    type="text"
                    value={currentExtracurricular.activity}
                    onChange={(e) =>
                      setCurrentExtracurricular({
                        ...currentExtracurricular,
                        activity: e.target.value,
                      })
                    }
                    placeholder="Debate Club"
                  />
                </div>

                <div>
                  <label>Your Role *</label>
                  <input
                    type="text"
                    value={currentExtracurricular.role}
                    onChange={(e) =>
                      setCurrentExtracurricular({
                        ...currentExtracurricular,
                        role: e.target.value,
                      })
                    }
                    placeholder="President"
                  />
                </div>

                <div>
                  <label>Years Involved</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={currentExtracurricular.years}
                    onChange={(e) =>
                      setCurrentExtracurricular({
                        ...currentExtracurricular,
                        years: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                <div>
                  <label>Hours per Week</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={currentExtracurricular.hoursPerWeek}
                    onChange={(e) =>
                      setCurrentExtracurricular({
                        ...currentExtracurricular,
                        hoursPerWeek: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Description (Optional)</label>
                <textarea
                  value={currentExtracurricular.description}
                  onChange={(e) =>
                    setCurrentExtracurricular({
                      ...currentExtracurricular,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your involvement and achievements..."
                  rows={3}
                />
              </div>

              <button
                onClick={addExtracurricular}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Add Activity
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              College Preferences
            </h2>

            <div>
              <label>Location Preference</label>
              <select
                value={formData.locationPreference}
                onChange={(e) => updateField("locationPreference", e.target.value)}
              >
                <option value="">Any location</option>
                <option value="Northeast">Northeast</option>
                <option value="Southeast">Southeast</option>
                <option value="Midwest">Midwest</option>
                <option value="Southwest">Southwest</option>
                <option value="West">West</option>
                <option value="California">California</option>
                <option value="New York">New York</option>
                <option value="Texas">Texas</option>
                <option value="Florida">Florida</option>
                <option value="Massachusetts">Massachusetts</option>
              </select>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                Select your preferred region or state
              </p>
            </div>

            <div>
              <label>Maximum Annual Cost</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.maxCost}
                onChange={(e) => updateField("maxCost", parseInt(e.target.value) || 0)}
              />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                Including tuition, fees, and living expenses
              </p>
            </div>

            <div>
              <label>School Size Preference</label>
              <select
                value={formData.schoolSize || ""}
                onChange={(e) => updateField("schoolSize", e.target.value || undefined)}
              >
                <option value="">No preference</option>
                <option value="small">Small (&lt;5,000 students)</option>
                <option value="medium">Medium (5,000-15,000 students)</option>
                <option value="large">Large (&gt;15,000 students)</option>
              </select>
            </div>

            <div>
              <label>Campus Setting</label>
              <select
                value={formData.settingPreference || ""}
                onChange={(e) => updateField("settingPreference", e.target.value || undefined)}
              >
                <option value="">No preference</option>
                <option value="urban">Urban</option>
                <option value="suburban">Suburban</option>
                <option value="rural">Rural</option>
              </select>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-light)'
        }}>
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="btn btn-secondary"
            style={{ opacity: step === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>
          {step < totalSteps ? (
            <button onClick={nextStep} className="btn btn-primary">
              Next Step
            </button>
          ) : (
            <button onClick={saveProfile} className="btn btn-primary">
              Save & View Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
