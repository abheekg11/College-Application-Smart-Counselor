"use client";

import { createContext, useContext, useState } from "react";
import { StudentProfile } from "@/types/profile";

const defaultProfile: StudentProfile = {
  gpa: 3.8,
  intendedMajor: "CS",
  maxCost: 40000,
  locationPreference: "Any",
};

const ProfileContext = createContext<any>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
