"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StudentProfile } from "@/types/profile";
import { College } from "@/types/college";

interface AppContextType {
  profile: StudentProfile | null;
  setProfile: (profile: StudentProfile) => void;
  savedColleges: College[];
  addSavedCollege: (college: College) => void;
  removeSavedCollege: (collegeId: string) => void;
  isSaved: (collegeId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile | null>(null);
  const [savedColleges, setSavedColleges] = useState<College[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("studentProfile");
    const savedCollegesList = localStorage.getItem("savedColleges");

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileState(parsed);
        console.log("[AppContext] loaded studentProfile from localStorage", parsed);
      } catch (err) {
        console.warn("[AppContext] failed to parse saved studentProfile", err);
      }
    }
    if (savedCollegesList) {
      try {
        const parsed = JSON.parse(savedCollegesList);
        setSavedColleges(parsed);
        console.log("[AppContext] loaded savedColleges from localStorage", parsed.length);
      } catch (err) {
        console.warn("[AppContext] failed to parse savedColleges", err);
      }
    }
  }, []);

  const setProfile = (newProfile: StudentProfile) => {
    setProfileState(newProfile);
    localStorage.setItem("studentProfile", JSON.stringify(newProfile));
  };

  const addSavedCollege = (college: College) => {
    // Prevent duplicates by id
    if (savedColleges.some((c) => c.id === college.id)) {
      console.log("[AppContext] college already saved:", college.id);
      return;
    }

    const updated = [...savedColleges, college];
    setSavedColleges(updated);
    localStorage.setItem("savedColleges", JSON.stringify(updated));
    console.log("[AppContext] addSavedCollege", college.id, "total:", updated.length);
  };

  const removeSavedCollege = (collegeId: string) => {
    const updated = savedColleges.filter((c) => c.id !== collegeId);
    setSavedColleges(updated);
    localStorage.setItem("savedColleges", JSON.stringify(updated));
    console.log("[AppContext] removeSavedCollege", collegeId, "total:", updated.length);
  };

  const isSaved = (collegeId: string) => {
    return savedColleges.some((c) => c.id === collegeId);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        savedColleges,
        addSavedCollege,
        removeSavedCollege,
        isSaved,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}