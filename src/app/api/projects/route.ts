import { createProject, listProjects } from "@/services/projects";
import { apiError, created, ok } from "@/lib/api";
import { TEST_TYPES } from "@/types";
import type { NewProjectInput } from "@/types";

export async function GET() {
  try {
    return ok({ projects: await listProjects() });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<NewProjectInput>;
    const input: NewProjectInput = {
      name: typeof body.name === "string" ? body.name : "",
      description: typeof body.description === "string" ? body.description : "",
      testType:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof body.testType === "string" && TEST_TYPES.includes(body.testType as any)
          ? (body.testType as NewProjectInput["testType"])
          : "other",
    };
    const project = await createProject(input);
    return created({ project });
  } catch (error) {
    return apiError(error);
  }
}