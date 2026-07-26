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

const starterItems: GalleryItem[] = [
  {
    id: "gallery-construction-1",
    title: "Ridge Residence Concept",
    division: "Construction",
    category: "Concept Render",
    location: "Nairobi",
    clientSector: "Private Client",
    description:
      "Proposed residential development showing the intended architectural direction, exterior treatment and site arrangement.",
    coverImage: "",
    additionalImages: [],
    status: "Published",
    featured: true,
    progress: 0,
    workersDeployed: 0,
    applicationsReceived: 0,
    candidatesScreened: 0,
    candidatesInterviewed: 0,
    vacanciesFilled: 0,
    positionsRecruited: "",
    startDate: "",
    completionDate: "",
    testimonial: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "gallery-construction-2",
    title: "Northline External Works",
    division: "Construction",
    category: "Ongoing Construction",
    location: "Murang'a",
    clientSector: "Commercial",
    description:
      "Ongoing drainage, paving and external civil works with documented progress and site coordination.",
    coverImage: "",
    additionalImages: [],
    status: "Published",
    featured: true,
    progress: 62,
    workersDeployed: 18,
    applicationsReceived: 0,
    candidatesScreened: 0,
    candidatesInterviewed: 0,
    vacanciesFilled: 0,
    positionsRecruited: "",
    startDate: "2026-06-10",
    completionDate: "",
    testimonial: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "gallery-construction-3",
    title: "Central Commercial Fit-out",
    division: "Construction",
    category: "Completed Construction",
    location: "Kiambu",
    clientSector: "Commercial",
    description:
      "Completed commercial interior fit-out including finishes, electrical coordination and final handover.",
    coverImage: "",
    additionalImages: [],
    status: "Published",
    featured: false,
    progress: 100,
    workersDeployed: 24,
    applicationsReceived: 0,
    candidatesScreened: 0,
    candidatesInterviewed: 0,
    vacanciesFilled: 0,
    positionsRecruited: "",
    startDate: "2026-02-15",
    completionDate: "2026-05-30",
    testimonial:
      "The assignment was completed with clear communication and reliable site coordination.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "gallery-recruitment-1",
    title: "Multi-county Field Team Recruitment",
    division: "Recruitment",
    category: "Recruitment Assignment",
    location: "Multiple Counties",
    clientSector: "NGO",
    description:
      "A structured recruitment exercise covering advertising, sourcing, screening, interviews, verification and final recommendations.",
    coverImage: "",
    additionalImages: [],
    status: "Published",
    featured: true,
    progress: 100,
    workersDeployed: 0,
    applicationsReceived: 680,
    candidatesScreened: 180,
    candidatesInterviewed: 62,
    vacanciesFilled: 38,
    positionsRecruited: "Field Officers and Coordinators",
    startDate: "2026-04-03",
    completionDate: "2026-04-21",
    testimonial:
      "The recruitment process was well organized, transparent and completed within the agreed period.",
    createdAt: new Date().toISOString(),
  },
];

export function getGalleryItems(): GalleryItem[] {
  if (typeof window === "undefined") {
    return starterItems;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(starterItems)
      );

      return starterItems;
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : starterItems;
  } catch {
    return starterItems;
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
