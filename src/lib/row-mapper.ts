import type { Feedback, Project, Version } from "@/types";

type Row = Record<string, unknown>;

export function mapProjectRow(row: Row): Project {
  return {
    id: row.id as number,
    name: row.name as string,
    description: row.description as string,
    testType: row.test_type as Project["testType"],
    slug: row.slug as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapVersionRow(row: Row): Version {
  return {
    id: row.id as number,
    projectId: row.project_id as number,
    number: row.number as number,
    label: row.label as Version["label"],
    changelog: row.changelog as string,
    testNotes: row.test_notes as string,
    fileName: row.file_name as string,
    sizeBytes: row.size_bytes as number,
    isPublished: Boolean(row.is_published),
    createdAt: row.created_at as string,
  };
}

export function mapFeedbackRow(row: Row): Feedback {
  return {
    id: row.id as number,
    versionId: row.version_id as number,
    testerName: row.tester_name as string,
    division: row.division as string,
    npsScore: row.nps_score as Feedback["npsScore"],
    feedback: row.feedback as string,
    createdAt: row.created_at as string,
  };
}