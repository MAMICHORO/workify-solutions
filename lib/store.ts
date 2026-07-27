export type ProjectStatus = "Planned" | "Active" | "Completed";
export type EnquiryStatus = "New" | "Reviewing" | "Quoted" | "Closed";
export type JobStatus = "Draft" | "Published" | "Closed";

export type ProjectRecord = {
  id: string;
  title: string;
  category: string;
  location: string;
  status: ProjectStatus;
  progress: number;
  description: string;
  createdAt: string;
};

export type JobRecord = {
  id: string;
  role: string;
  location: string;
  type: string;
  vacancies: number;
  deadline: string;
  status: JobStatus;
  summary: string;
  requirements: string[];
};

export type EnquiryRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  organization: string;
  service: string;
  location: string;
  details: string;
  status: EnquiryStatus;
  createdAt: string;
};

export type ApplicationRecord = {
  id: string;
  jobId: string;
  jobRole: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  experience: number;
  availability: string;
  note: string;
  status: "Received" | "Shortlisted" | "Interview" | "Selected" | "Rejected";
  createdAt: string;
};

export type WorkerRecord = {
  id: string;
  name: string;
  trade: string;
  county: string;
  experience: number;
  availability: "Available" | "Deployed" | "Unavailable";
};

const KEYS = {
  projects: "workify_projects_v1",
  jobs: "workify_jobs_v1",
  enquiries: "workify_enquiries_v1",
  applications: "workify_applications_v1",
  workers: "workify_workers_v1"
};

function read<T>(key:string, fallback:T):T {
  if (typeof window === "undefined") return fallback;
  const raw=localStorage.getItem(key);
  if (!raw) { localStorage.setItem(key,JSON.stringify(fallback)); return fallback; }
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
function write<T>(key:string,value:T){
  localStorage.setItem(key,JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("workify-store-change",{detail:key}));
}
export const store={
  projects:()=>read<ProjectRecord[]>(KEYS.projects,[]).filter(
    project => !["p1","p2","p3"].includes(project.id)
  ),
  saveProjects:(v:ProjectRecord[])=>write(KEYS.projects,v),
  jobs:()=>read<JobRecord[]>(KEYS.jobs,[]).filter(
    job => !["j1","j2","j3"].includes(job.id)
  ),
  saveJobs:(v:JobRecord[])=>write(KEYS.jobs,v),
  enquiries:()=>read<EnquiryRecord[]>(KEYS.enquiries,[]),
  saveEnquiries:(v:EnquiryRecord[])=>write(KEYS.enquiries,v),
  applications:()=>read<ApplicationRecord[]>(KEYS.applications,[]),
  saveApplications:(v:ApplicationRecord[])=>write(KEYS.applications,v),
  workers:()=>read<WorkerRecord[]>(KEYS.workers,[]).filter(
    worker => !["w1","w2","w3"].includes(worker.id)
  ),
  saveWorkers:(v:WorkerRecord[])=>write(KEYS.workers,v),
  reset:()=>Object.values(KEYS).forEach(k=>localStorage.removeItem(k))
};
export function uid(prefix:string){return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`}
