"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type ProjectStatus =
  | "Planned"
  | "Active"
  | "Completed";

type Project = {
  id: string;
  number: string;
  title: string;
  category: string;
  location: string;
  status: ProjectStatus;
  description: string;
  scope: string[];
  progress: number;
};

const defaultProjects: Project[] = [
  {
    id: "ridge-residence",
    number: "01",
    title: "Ridge Residence",
    category: "Residential construction",
    location: "Nairobi",
    status: "Active",
    description:
      "Complete residential construction, site coordination and finishing.",
    scope: [
      "Site preparation",
      "Structural construction",
      "Electrical and plumbing coordination",
      "Interior and exterior finishing",
    ],
    progress: 68,
  },
  {
    id: "central-commercial-fitout",
    number: "02",
    title: "Central Commercial Fit-out",
    category: "Commercial",
    location: "Kiambu",
    status: "Completed",
    description:
      "Commercial interior fit-out and building-services coordination.",
    scope: [
      "Interior partitioning",
      "Ceiling and floor finishing",
      "Electrical installation",
      "Final inspection and handover",
    ],
    progress: 100,
  },
  {
    id: "northline-external-works",
    number: "03",
    title: "Northline External Works",
    category: "Civil works",
    location: "Murang'a",
    status: "Planned",
    description:
      "Drainage, paving and external civil works for a developing site.",
    scope: [
      "Drainage layout",
      "Paving and walkways",
      "Concrete works",
      "Site finishing",
    ],
    progress: 15,
  },
];

function readStoredProjects(): Project[] {
  if (typeof window === "undefined") {
    return defaultProjects;
  }

  const possibleKeys = [
    "workify-projects",
    "workify_projects",
    "projects",
  ];

  for (const key of possibleKeys) {
    try {
      const stored = window.localStorage.getItem(key);

      if (!stored) {
        continue;
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        continue;
      }

      return parsed.map((project, index) => ({
        id:
          String(
            project.id ??
              project.slug ??
              `project-${index + 1}`
          ),

        number:
          String(
            project.number ??
              String(index + 1).padStart(2, "0")
          ),

        title:
          String(
            project.title ??
              project.name ??
              "Untitled project"
          ),

        category:
          String(
            project.category ??
              project.type ??
              "Construction"
          ),

        location:
          String(
            project.location ??
              "Kenya"
          ),

        status:
          (
            ["Planned", "Active", "Completed"].includes(
              project.status
            )
              ? project.status
              : "Planned"
          ) as ProjectStatus,

        description:
          String(
            project.description ??
              project.summary ??
              "Project details will be added by the administrator."
          ),

        scope:
          Array.isArray(project.scope)
            ? project.scope
            : [
                "Project planning",
                "Site coordination",
                "Progress reporting",
              ],

        progress:
          Number.isFinite(Number(project.progress))
            ? Math.min(
                100,
                Math.max(
                  0,
                  Number(project.progress)
                )
              )
            : project.status === "Completed"
              ? 100
              : project.status === "Active"
                ? 50
                : 10,
      }));
    } catch {
      // Try the next possible storage key.
    }
  }

  return defaultProjects;
}

export default function ProjectsPage() {
  const [projects, setProjects] =
    useState<Project[]>(defaultProjects);

  const [selectedId, setSelectedId] =
    useState(defaultProjects[0].id);

  const [filter, setFilter] =
    useState("All");

  useEffect(() => {
    const storedProjects = readStoredProjects();

    setProjects(storedProjects);

    if (storedProjects.length > 0) {
  setSelectedId((currentId) =>
    currentId || storedProjects[0].id
  );
}

    function refreshProjects() {
      const refreshedProjects =
        readStoredProjects();

      setProjects(refreshedProjects);

      if (
        refreshedProjects.length > 0 &&
        !refreshedProjects.some(
          (project) =>
            project.id === selectedId
        )
      ) {
        setSelectedId(
          refreshedProjects[0].id
        );
      }
    }

    window.addEventListener(
      "storage",
      refreshProjects
    );

    window.addEventListener(
      "workify-projects-updated",
      refreshProjects
    );

    return () => {
      window.removeEventListener(
        "storage",
        refreshProjects
      );

      window.removeEventListener(
        "workify-projects-updated",
        refreshProjects
      );
    };
  }, [selectedId]);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          projects.map(
            (project) =>
              project.category
          )
        )
      ),
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (filter === "All") {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.category === filter
    );
  }, [filter, projects]);

  const selectedProject =
    projects.find(
      (project) =>
        project.id === selectedId
    ) ??
    filteredProjects[0] ??
    projects[0];

  function selectFilter(
    category: string
  ) {
    setFilter(category);

    const firstMatchingProject =
      category === "All"
        ? projects[0]
        : projects.find(
            (project) =>
              project.category === category
          );

    if (firstMatchingProject) {
      setSelectedId(
        firstMatchingProject.id
      );
    }
  }

  return (
    <section className="projectsGalleryPage">
      <div className="projectsGalleryContainer">
        <header className="projectsGalleryHeader">
          <div>
            <span className="projectsEyebrow">
              PORTFOLIO
            </span>

            <h1>
              Projects and assignments.
            </h1>
          </div>

          <p>
            Explore current and completed
            construction work. Select a project
            to view its scope and progress without
            leaving the page.
          </p>
        </header>

        <div className="projectFilters">
          {categories.map(
            (category) => (
              <button
                key={category}
                type="button"
                className={
                  filter === category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  selectFilter(category)
                }
              >
                {category}
              </button>
            )
          )}
        </div>

        <div className="projectsGalleryWorkspace">
          <div className="projectsGalleryList">
            {filteredProjects.map(
              (project) => {
                const active =
                  selectedProject?.id ===
                  project.id;

                return (
                  <button
                    type="button"
                    key={project.id}
                    className={
                      active
                        ? "projectGalleryCard active"
                        : "projectGalleryCard"
                    }
                    onClick={() =>
                      setSelectedId(
                        project.id
                      )
                    }
                  >
                    <div className="projectCardVisual">
                      <span>
                        {project.number}
                      </span>

                      <div className="projectArchitecturalShape shapeOne" />
                      <div className="projectArchitecturalShape shapeTwo" />
                    </div>

                    <div className="projectCardContent">
                      <div>
                        <small>
                          {project.category}
                        </small>

                        <h2>
                          {project.title}
                        </h2>
                      </div>

                      <div className="projectCardMeta">
                        <span>
                          {project.location}
                        </span>

                        <b
                          className={`status-${project.status.toLowerCase()}`}
                        >
                          {project.status}
                        </b>
                      </div>
                    </div>
                  </button>
                );
              }
            )}

            {filteredProjects.length ===
              0 && (
              <div className="emptyProjectGallery">
                No projects are available in
                this category.
              </div>
            )}
          </div>

          {selectedProject && (
            <aside className="projectDetailsPanel">
              <div className="projectDetailsVisual">
                <div className="projectDetailNumber">
                  {
                    selectedProject.number
                  }
                </div>

                <div className="projectDetailBuilding buildingLeft" />
                <div className="projectDetailBuilding buildingRight" />
              </div>

              <div className="projectDetailsBody">
                <div className="projectDetailsHeading">
                  <div>
                    <span>
                      SELECTED PROJECT
                    </span>

                    <h2>
                      {
                        selectedProject.title
                      }
                    </h2>
                  </div>

                  <b
                    className={`status-${selectedProject.status.toLowerCase()}`}
                  >
                    {
                      selectedProject.status
                    }
                  </b>
                </div>

                <div className="projectDetailFacts">
                  <div>
                    <span>CATEGORY</span>
                    <strong>
                      {
                        selectedProject.category
                      }
                    </strong>
                  </div>

                  <div>
                    <span>LOCATION</span>
                    <strong>
                      {
                        selectedProject.location
                      }
                    </strong>
                  </div>

                  <div>
                    <span>PROGRESS</span>
                    <strong>
                      {
                        selectedProject.progress
                      }
                      %
                    </strong>
                  </div>
                </div>

                <div className="projectProgressBar">
                  <div
                    style={{
                      width: `${selectedProject.progress}%`,
                    }}
                  />
                </div>

                <div className="projectDescription">
                  <span>PROJECT OVERVIEW</span>

                  <p>
                    {
                      selectedProject.description
                    }
                  </p>
                </div>

                <div className="projectScope">
                  <span>SCOPE OF WORK</span>

                  <div>
                    {selectedProject.scope.map(
                      (item, index) => (
                        <p key={item}>
                          <b>
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </b>

                          {item}
                        </p>
                      )
                    )}
                  </div>
                </div>

                <a
                  className="projectRequestButton"
                  href={`/contact?type=construction&project=${encodeURIComponent(
                    selectedProject.title
                  )}`}
                >
                  Discuss a similar project
                </a>
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
