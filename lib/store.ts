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

export const seedProjects: ProjectRecord[] = [
  {id:"p1",title:"Ridge Residence",category:"Residential",location:"Nairobi",status:"Active",progress:68,description:"Full residential construction and finishing.",createdAt:"2026-07-10"},
  {id:"p2",title:"Central Commercial Fit-out",category:"Commercial",location:"Kiambu",status:"Completed",progress:100,description:"Commercial interior fit-out and services coordination.",createdAt:"2026-06-18"},
  {id:"p3",title:"Northline External Works",category:"Civil works",location:"Murang'a",status:"Planned",progress:15,description:"Drainage, paving and external civil works.",createdAt:"2026-07-20"}
];

export const seedJobs: JobRecord[] = [
  {id:"j1",role:"Site Supervisor",location:"Nairobi",type:"Contract",vacancies:2,deadline:"2026-08-30",status:"Published",summary:"Coordinate daily site activities, quality and reporting.",requirements:["Construction qualification","3+ years site experience","Strong reporting skills"]},
  {id:"j2",role:"Mason",location:"Kiambu",type:"Project-based",vacancies:12,deadline:"Open until filled",status:"Published",summary:"Masonry, blockwork and plastering under site supervision.",requirements:["Demonstrable masonry experience","Ability to follow drawings","Ready for deployment"]},
  {id:"j3",role:"Finance Officer",location:"Nairobi",type:"Full-time",vacancies:1,deadline:"2026-09-15",status:"Published",summary:"Budgeting, reconciliations and project financial control.",requirements:["Relevant qualification","2+ years experience","Strong spreadsheet skills"]}
];

export const seedWorkers: WorkerRecord[] = [
  {id:"w1",name:"Peter Mwangi",trade:"Mason",county:"Kiambu",experience:7,availability:"Available"},
  {id:"w2",name:"Jane Wanjiru",trade:"Electrician",county:"Nairobi",experience:5,availability:"Deployed"},
  {id:"w3",name:"Samuel Otieno",trade:"Site Supervisor",county:"Nakuru",experience:9,availability:"Available"}
];

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
  projects:()=>read<ProjectRecord[]>(KEYS.projects,seedProjects),
  saveProjects:(v:ProjectRecord[])=>write(KEYS.projects,v),
  jobs:()=>read<JobRecord[]>(KEYS.jobs,seedJobs),
  saveJobs:(v:JobRecord[])=>write(KEYS.jobs,v),
  enquiries:()=>read<EnquiryRecord[]>(KEYS.enquiries,[]),
  saveEnquiries:(v:EnquiryRecord[])=>write(KEYS.enquiries,v),
  applications:()=>read<ApplicationRecord[]>(KEYS.applications,[]),
  saveApplications:(v:ApplicationRecord[])=>write(KEYS.applications,v),
  workers:()=>read<WorkerRecord[]>(KEYS.workers,seedWorkers),
  saveWorkers:(v:WorkerRecord[])=>write(KEYS.workers,v),
  reset:()=>Object.values(KEYS).forEach(k=>localStorage.removeItem(k))
};
export function uid(prefix:string){return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`}
