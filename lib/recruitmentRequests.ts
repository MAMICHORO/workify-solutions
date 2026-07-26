export type RecruitmentRequestStatus =
  | "New"
  | "Reviewing"
  | "Proposal sent"
  | "Active"
  | "Completed"
  | "Closed";

export type RecruitmentRequest = {
  id: string;
  organizationName: string;
  contactPerson: string;
  phone: string;
  email: string;
  sector: string;
  positions: string;
  vacancies: number;
  employmentType: string;
  location: string;
  deadline: string;
  services: string[];
  qualifications: string;
  instructions: string;
  status: RecruitmentRequestStatus;
  createdAt: string;
};

const STORAGE_KEY = "workify-recruitment-requests";

export function getRecruitmentRequests(): RecruitmentRequest[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecruitmentRequests(
  requests: RecruitmentRequest[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));

  window.dispatchEvent(
    new CustomEvent("workify-recruitment-requests-updated")
  );
}

export function addRecruitmentRequest(
  request: Omit<
    RecruitmentRequest,
    "id" | "createdAt" | "status"
  >
): RecruitmentRequest {
  const requests = getRecruitmentRequests();

  const newRequest: RecruitmentRequest = {
    ...request,
    id:
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    status: "New",
    createdAt: new Date().toISOString(),
  };

  saveRecruitmentRequests([newRequest, ...requests]);

  return newRequest;
}

export function updateRecruitmentRequestStatus(
  requestId: string,
  status: RecruitmentRequestStatus
): void {
  const requests = getRecruitmentRequests().map((request) =>
    request.id === requestId
      ? { ...request, status }
      : request
  );

  saveRecruitmentRequests(requests);
}

export function deleteRecruitmentRequest(
  requestId: string
): void {
  const requests = getRecruitmentRequests().filter(
    (request) => request.id !== requestId
  );

  saveRecruitmentRequests(requests);
}
