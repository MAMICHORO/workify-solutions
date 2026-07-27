export type ProjectRecord = {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  publicationStatus: string;
  progress: number | null;
  description: string;
  scope: string[];
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

type RawProject = Record<string, unknown>;

function text(
  row: RawProject,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string =>
        typeof item === "string" && Boolean(item.trim())
      )
      .map((item) => item.trim());
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function isPublicProject(
  row: RawProject
): boolean {
  if (row.deleted_at != null) {
    return false;
  }

  const publicationStatus = text(
    row,
    "publication_status"
  ).toLowerCase();

  if (publicationStatus) {
    return publicationStatus === "published";
  }

  for (const key of [
    "published",
    "is_public",
    "visible",
    "active",
  ]) {
    if (typeof row[key] === "boolean") {
      return row[key] === true;
    }
  }

  const status = text(row, "status").toLowerCase();

  return ![
    "draft",
    "archived",
    "deleted",
    "private",
    "inactive",
  ].includes(status);
}

export function mapProject(
  row: RawProject
): ProjectRecord | null {
  const id = String(row.id ?? "").trim();
  const title = text(row, "title", "name", "project_name");

  if (!id || !title) {
    return null;
  }

  const numericProgress = Number(row.progress);

  return {
    id,
    title,
    category: text(row, "category", "project_type", "type"),
    location: text(row, "location"),
    status: text(row, "status"),
    publicationStatus: text(
      row,
      "publication_status"
    ),
    progress: Number.isFinite(numericProgress)
      ? Math.min(100, Math.max(0, numericProgress))
      : null,
    description: text(row, "description", "summary"),
    scope: list(
      row.scope ??
        row.scope_of_work ??
        row.project_scope
    ),
    imageUrl: text(
      row,
      "cover_image_url",
      "cover_image",
      "image_url",
      "image"
    ),
    createdAt: text(row, "created_at", "createdAt"),
    updatedAt: text(row, "updated_at", "updatedAt"),
  };
}
