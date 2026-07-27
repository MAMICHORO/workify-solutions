export type GalleryDivision =
  | "Construction"
  | "Recruitment";

export type GalleryCategory =
  | "Concept Render"
  | "Ongoing Construction"
  | "Completed Construction"
  | "Recruitment Assignment"
  | "Interview Event"
  | "Training and Orientation";

export type GalleryStatus =
  | "Draft"
  | "Published"
  | "Archived";

export type GalleryItem = {
  id: string;
  title: string;
  division: GalleryDivision;
  category: GalleryCategory;
  location: string;
  clientSector: string;
  description: string;
  coverImage: string;
  additionalImages: string[];
  status: GalleryStatus;
  featured: boolean;
  progress: number;
  workersDeployed: number;
  applicationsReceived: number;
  candidatesScreened: number;
  candidatesInterviewed: number;
  vacanciesFilled: number;
  positionsRecruited: string;
  startDate: string;
  completionDate: string;
  testimonial: string;
  createdAt: string;
};

const STORAGE_KEY = "workify-gallery-items";

const emptyItems: GalleryItem[] = [];

export function getGalleryItems(): GalleryItem[] {
  if (typeof window === "undefined") {
    return emptyItems;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(emptyItems)
      );

      return emptyItems;
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : emptyItems;
  } catch {
    return emptyItems;
  }
}

export function saveGalleryItems(
  items: GalleryItem[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items)
  );

  window.dispatchEvent(
    new CustomEvent("workify-gallery-updated")
  );
}

export function addGalleryItem(
  item: Omit<GalleryItem, "id" | "createdAt">
): GalleryItem {
  const items = getGalleryItems();

  const newItem: GalleryItem = {
    ...item,
    id:
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    createdAt: new Date().toISOString(),
  };

  saveGalleryItems([newItem, ...items]);

  return newItem;
}

export function updateGalleryItem(
  item: GalleryItem
): void {
  const items = getGalleryItems().map(
    (existingItem) =>
      existingItem.id === item.id
        ? item
        : existingItem
  );

  saveGalleryItems(items);
}

export function deleteGalleryItem(
  itemId: string
): void {
  const items = getGalleryItems().filter(
    (item) => item.id !== itemId
  );

  saveGalleryItems(items);
}
