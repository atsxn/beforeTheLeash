// app/context/AssessmentContext.tsx

import type { ScoringResult } from "@/app/utils/scoringAlgorithm";
import { createContext, ReactNode, useContext, useState } from "react";

interface AssessmentContextType {
  assessmentResult: ScoringResult | null;
  setAssessmentResult: (result: ScoringResult) => void;
}

const AssessmentContext = createContext<AssessmentContextType>({
  assessmentResult: null,
  setAssessmentResult: () => {},
});

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [assessmentResult, setAssessmentResult] =
    useState<ScoringResult | null>(null);

  return (
    <AssessmentContext.Provider
      value={{ assessmentResult, setAssessmentResult }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  return useContext(AssessmentContext);
}
