export const TEST_TYPES = ["usability", "ab", "survey", "other"] as const;

export type TestType = (typeof TEST_TYPES)[number];

export type VersionLabel = `v${number}`;

export interface Project {
  id: number;
  name: string;
  description: string;
  testType: TestType;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithMeta extends Project {
  versionCount: number;
  publishedLabel: string | null;
  latestLabel: string | null;
}

export interface Version {
  id: number;
  projectId: number;
  number: number;
  label: VersionLabel;
  changelog: string;
  testNotes: string;
  fileName: string;
  sizeBytes: number;
  isPublished: boolean;
  createdAt: string;
}

export interface ProjectDetail extends Project {
  versions: VersionListItem[];
  publishedVersion: Version | null;
}

export interface VersionListItem extends Version {
  feedbackCount: number;
}

export interface ProjectVersionDetail {
  project: Project;
  version: Version;
  publishedVersion: Version | null;
  feedback: Feedback[];
}

export const NPS_SCORES = [1, 2, 3, 4, 5] as const;

export type NpsScore = (typeof NPS_SCORES)[number];

export interface Feedback {
  id: number;
  versionId: number;
  testerName: string;
  division: string;
  npsScore: NpsScore;
  feedback: string;
  createdAt: string;
}

export interface NewFeedbackInput {
  testerName: string;
  division: string;
  npsScore: NpsScore;
  feedback: string;
}

export const NPS_LABELS: Record<NpsScore, string> = {
  1: "Sangat sulit",
  2: "Sulit",
  3: "Cukup mudah",
  4: "Mudah",
  5: "Sangat mudah",
};

export interface NewProjectInput {
  name: string;
  description: string;
  testType: TestType;
}

export interface UploadVersionInput {
  /** Raw file bytes for the prototype HTML. */
  file: Uint8Array;
  /** Original file name, used only for validation messaging. */
  fileName: string;
  changelog: string;
}

export const TEST_TYPE_LABELS: Record<TestType, string> = {
  usability: "Usability Test",
  ab: "A/B Test",
  survey: "Survey",
  other: "Lainnya",
};