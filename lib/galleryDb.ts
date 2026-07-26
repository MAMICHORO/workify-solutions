export type GalleryDivision =
  | "Construction"
  | "Recruitment";

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
  status: "Draft" | "Published";
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

const DATABASE_NAME = "workify-gallery-database";
const STORE_NAME = "gallery-items";
const DATABASE_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open gallery database."));
  });
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (typeof window === "undefined") {
    return [];
  }

  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = (request.result as GalleryItem[]).sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );

      resolve(records);
    };

    request.onerror = () =>
      reject(request.error ?? new Error("Unable to read gallery records."));
  });
}

export async function saveGalleryItem(
  item: GalleryItem
): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction.objectStore(STORE_NAME).put(item);

    transaction.oncomplete = () => {
      window.dispatchEvent(
        new CustomEvent("workify-gallery-updated")
      );

      resolve();
    };

    transaction.onerror = () =>
      reject(
        transaction.error ??
          new Error("Unable to save gallery record.")
      );
  });
}

export async function deleteGalleryItem(
  id: string
): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = () => {
      window.dispatchEvent(
        new CustomEvent("workify-gallery-updated")
      );

      resolve();
    };

    transaction.onerror = () =>
      reject(
        transaction.error ??
          new Error("Unable to delete gallery record.")
      );
  });
}

export function createId(prefix = "gallery"): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function fileToGalleryImage(
  file: File
): Promise<GalleryImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error(`${file.name} is not an image.`));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        id: createId("image"),
        name: file.name,
        dataUrl: String(reader.result),
      });
    };

    reader.onerror = () =>
      reject(new Error(`Unable to read ${file.name}.`));

    reader.readAsDataURL(file);
  });
}
