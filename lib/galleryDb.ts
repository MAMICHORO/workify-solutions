import { createClient } from "@/lib/supabase/client";

export type GalleryDivision = "Construction" | "Recruitment";
type GalleryDivisionValue = "construction" | "recruitment";

export type GalleryPresentationType =
  | "Concept Render"
  | "Ongoing Construction"
  | "Completed Project"
  | "Interview Setup"
  | "Recruitment Event"
  | "Training and Orientation"
  | "Recruitment Assignment";

export type GalleryImage = {
  id: string;
  name: string;
  dataUrl: string;
  storagePath?: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  division: GalleryDivision;
  presentationType: GalleryPresentationType;
  location: string;
  clientSector: string;
  description: string;
  date: string;
  status: "Draft" | "Published" | "Archived";
  featured: boolean;
  progress: number;
  workersDeployed: number;
  applicationsReceived: number;
  candidatesScreened: number;
  candidatesInterviewed: number;
  vacanciesFilled: number;
  positionsRecruited: string;
  images: GalleryImage[];
  coverImageId: string;
  createdAt: string;
  updatedAt: string;
};

type GalleryImageRow = {
  id: string;
  storage_path: string;
  public_url: string | null;
  caption: string | null;
  is_cover: boolean;
  display_order: number;
};

type GalleryRow = {
  id: string;
  title: string;
  division: string;
  presentation_type: string;
  location: string | null;
  client_sector: string | null;
  description: string;
  presentation_date: string | null;
  progress: number;
  workers_deployed: number;
  positions_recruited: string | null;
  applications_received: number;
  candidates_screened: number;
  candidates_interviewed: number;
  vacancies_filled: number;
  publication_status: "draft" | "published" | "archived";
  featured: boolean;
  created_at: string;
  updated_at: string;
  gallery_images: GalleryImageRow[] | null;
};

const BUCKET = "gallery-images";
const DATABASE_NAME = "workify-gallery-database";
const STORE_NAME = "gallery-items";
const DATABASE_VERSION = 1;

export function normalizeGalleryDivision(
  division: GalleryDivision | string
): GalleryDivisionValue {
  const normalized = division.trim().toLocaleLowerCase();

  if (normalized === "construction" || normalized === "recruitment") {
    return normalized;
  }

  throw new Error(`Unsupported gallery division: ${division}`);
}

function mapGalleryDivision(
  division: GalleryDivisionValue | string
): GalleryDivision {
  return normalizeGalleryDivision(division) === "construction"
    ? "Construction"
    : "Recruitment";
}

function toStatus(
  status: GalleryRow["publication_status"]
): GalleryItem["status"] {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft";
}

function toPublicationStatus(
  status: GalleryItem["status"]
): GalleryRow["publication_status"] {
  return status.toLowerCase() as GalleryRow["publication_status"];
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function openLegacyDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open legacy gallery."));
  });
}

async function getLegacyGalleryItems(): Promise<GalleryItem[]> {
  if (typeof window === "undefined") return [];

  const database = await openLegacyDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onsuccess = () =>
      resolve((request.result as GalleryItem[]) ?? []);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to read legacy gallery."));
  });
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gallery_presentations")
    .select(
      "id,title,division,presentation_type,location,client_sector,description,presentation_date,progress,workers_deployed,positions_recruited,applications_received,candidates_screened,candidates_interviewed,vacancies_filled,publication_status,featured,created_at,updated_at,gallery_images(id,storage_path,public_url,caption,is_cover,display_order)"
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load gallery: ${error.message}`);
  }

  const rows = (data ?? []) as GalleryRow[];
  const paths = rows.flatMap((row) =>
    (row.gallery_images ?? []).map((image) => image.storage_path)
  );
  const signedUrls = new Map<string, string>();

  if (paths.length > 0) {
    const { data: signed, error: signedError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, 60 * 60);

    if (!signedError) {
      signed?.forEach((entry, index) => {
        if (entry.signedUrl) {
          signedUrls.set(paths[index], entry.signedUrl);
        }
      });
    }
  }

  return rows.map((row) => {
    const images = [...(row.gallery_images ?? [])]
      .sort((a, b) => a.display_order - b.display_order)
      .map((image) => ({
        id: image.id,
        name: image.caption || image.storage_path.split("/").pop() || "Image",
        dataUrl:
          signedUrls.get(image.storage_path) ?? image.public_url ?? "",
        storagePath: image.storage_path,
      }));

    return {
      id: row.id,
      title: row.title,
      division: mapGalleryDivision(row.division),
      presentationType:
        row.presentation_type as GalleryPresentationType,
      location: row.location ?? "",
      clientSector: row.client_sector ?? "",
      description: row.description,
      date: row.presentation_date ?? "",
      status: toStatus(row.publication_status),
      featured: row.featured,
      progress: row.progress,
      workersDeployed: row.workers_deployed,
      applicationsReceived: row.applications_received,
      candidatesScreened: row.candidates_screened,
      candidatesInterviewed: row.candidates_interviewed,
      vacanciesFilled: row.vacancies_filled,
      positionsRecruited: row.positions_recruited ?? "",
      images,
      coverImageId:
        (row.gallery_images ?? []).find((image) => image.is_cover)?.id ??
        images[0]?.id ??
        "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function saveGalleryItem(item: GalleryItem): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication is required.");

  const values = {
    title: item.title,
    division: normalizeGalleryDivision(item.division),
    presentation_type: item.presentationType,
    location: item.location || null,
    client_sector: item.clientSector || null,
    description: item.description,
    presentation_date: item.date || null,
    progress: item.progress,
    workers_deployed: item.workersDeployed,
    positions_recruited: item.positionsRecruited || null,
    applications_received: item.applicationsReceived,
    candidates_screened: item.candidatesScreened,
    candidates_interviewed: item.candidatesInterviewed,
    vacancies_filled: item.vacanciesFilled,
    publication_status: toPublicationStatus(item.status),
    featured: item.featured,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  let presentationId = isUuid(item.id) ? item.id : "";

  if (presentationId) {
    const { error } = await supabase
      .from("gallery_presentations")
      .update(values)
      .eq("id", presentationId);

    if (error) throw new Error(`Unable to update presentation: ${error.message}`);
  } else {
    const { data, error } = await supabase
      .from("gallery_presentations")
      .insert({
        ...values,
        slug: `${slugify(item.title) || "presentation"}-${Date.now()}`,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(
        `Unable to create presentation: ${error?.message ?? "Unknown error"}`
      );
    }

    presentationId = data.id;
  }

  const { data: existingImages, error: existingImagesError } = await supabase
    .from("gallery_images")
    .select("id")
    .eq("gallery_id", presentationId);

  if (existingImagesError) {
    throw new Error(
      `Unable to inspect gallery images: ${existingImagesError.message}`
    );
  }

  const imageRows: Array<Record<string, unknown>> = [];

  for (const [index, image] of item.images.entries()) {
    let storagePath = image.storagePath;

    if (!storagePath) {
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
      storagePath = `${presentationId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, blob, {
          contentType: blob.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Unable to upload ${image.name}: ${uploadError.message}`);
      }
    }

    imageRows.push({
      ...(isUuid(image.id) ? { id: image.id } : {}),
      gallery_id: presentationId,
      storage_path: storagePath,
      public_url: null,
      caption: image.name,
      is_cover: image.id === item.coverImageId,
      display_order: index,
      created_by: user.id,
    });
  }

  if (imageRows.length > 0) {
    const { data: savedImages, error: imageError } = await supabase
      .from("gallery_images")
      .upsert(imageRows)
      .select("id");

    if (imageError) {
      throw new Error(`Unable to save gallery images: ${imageError.message}`);
    }

    const savedIds = new Set((savedImages ?? []).map((image) => image.id));
    const removedIds = (existingImages ?? [])
      .map((image) => image.id)
      .filter((id) => !savedIds.has(id));

    if (removedIds.length > 0) {
      const { error: removeError } = await supabase
        .from("gallery_images")
        .delete()
        .in("id", removedIds);

      if (removeError) {
        throw new Error(
          `Unable to remove gallery image references: ${removeError.message}`
        );
      }
    }
  }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("gallery_presentations")
    .update({
      deleted_at: new Date().toISOString(),
      publication_status: "archived",
    })
    .eq("id", id);

  if (error) throw new Error(`Unable to archive presentation: ${error.message}`);
}

export async function migrateLegacyGalleryItems(): Promise<number> {
  const legacyItems = await getLegacyGalleryItems();
  if (legacyItems.length === 0) return 0;

  const currentItems = await getGalleryItems();
  let migrated = 0;

  for (const item of legacyItems) {
    const alreadyExists = currentItems.some(
      (current) =>
        current.title.trim().toLocaleLowerCase() ===
          item.title.trim().toLocaleLowerCase() &&
        current.division.toLocaleLowerCase() ===
          item.division.toLocaleLowerCase()
    );

    if (!alreadyExists) {
      await saveGalleryItem({ ...item, id: "" });
      migrated += 1;
    }
  }

  return migrated;
}

export function createId(prefix = "gallery"): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function fileToGalleryImage(file: File): Promise<GalleryImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error(`${file.name} is not an image.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        id: createId("image"),
        name: file.name,
        dataUrl: String(reader.result),
      });
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}
