export type Project = {
  slug: string;
  number: string;
  title: string;
  category: string;
  location: string;
  visual: string;
};

export const projects: Project[] = [
  { slug: "ridge-residence", number: "01", title: "Ridge Residence", category: "Residential construction", location: "Nairobi, Kenya", visual: "visualRed" },
  { slug: "central-fitout", number: "02", title: "Central Commercial Fit-out", category: "Commercial", location: "Kiambu, Kenya", visual: "visualGold" },
  { slug: "northline-civil", number: "03", title: "Northline External Works", category: "Civil works", location: "Murang'a, Kenya", visual: "visualBlue" },
  { slug: "stonehouse-renovation", number: "04", title: "Stonehouse Renovation", category: "Renovation", location: "Nakuru, Kenya", visual: "visualGray" },
  { slug: "workforce-deployment", number: "05", title: "Multi-trade Site Deployment", category: "Workforce deployment", location: "Machakos, Kenya", visual: "visualOrange" },
  { slug: "warehouse-upgrade", number: "06", title: "Warehouse Upgrade", category: "Commercial", location: "Athi River, Kenya", visual: "visualGreen" }
];
