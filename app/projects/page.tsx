"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  isPublicProject,
  mapProject,
  type ProjectRecord,
} from "@/lib/projects";
import { createClient } from "@/lib/supabase/client";

export default function ProjectsPage() {
  const [supabase] = useState(createClient);
  const [projects, setProjects] =
    useState<ProjectRecord[]>([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [filter, setFilter] =
    useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      setLoading(true);
      setError("");

      const { data, error: queryError } =
        await supabase
          .from("projects")
          .select("*");

      if (!mounted) return;

      if (queryError) {
        console.error(
          "Unable to load public projects:",
          queryError
        );
        setError(
          "Projects are temporarily unavailable. Please try again later."
        );
        setProjects([]);
      } else {
        const records = (data ?? [])
          .filter(isPublicProject)
          .map(mapProject)
          .filter(
            (project): project is ProjectRecord =>
              project !== null
          );

        setProjects(records);
        setSelectedId((current) =>
          records.some((record) => record.id === current)
            ? current
            : records[0]?.id ?? ""
        );
      }

      setLoading(false);
    }

    void loadProjects();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const categories = useMemo(() => {
    const labels = new Map<string, string>();

    projects.forEach((project) => {
      const category = project.category.trim();

      if (category) {
        const key = category.toLocaleLowerCase();
        if (!labels.has(key)) labels.set(key, category);
      }
    });

    return ["All", ...labels.values()];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (filter === "All") {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.category.toLocaleLowerCase() ===
        filter.toLocaleLowerCase()
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
              project.category.toLocaleLowerCase() ===
              category.toLocaleLowerCase()
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
            {loading && (
              <div className="emptyProjectGallery">
                Loading projects...
              </div>
            )}

            {error && (
              <div className="emptyProjectGallery">
                {error}
              </div>
            )}

            {filteredProjects.map(
              (project, index) => {
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
                      {project.imageUrl && (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                        />
                      )}
                      <span>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="projectArchitecturalShape shapeOne" />
                      <div className="projectArchitecturalShape shapeTwo" />
                    </div>

                    <div className="projectCardContent">
                      <div>
                        {project.category && (
                          <small>{project.category}</small>
                        )}

                        <h2>
                          {project.title}
                        </h2>
                      </div>

                      <div className="projectCardMeta">
                        {project.location && (
                          <span>{project.location}</span>
                        )}

                        {project.status && (
                          <b
                            className={`status-${project.status.toLowerCase()}`}
                          >
                            {project.status}
                          </b>
                        )}
                      </div>
                    </div>
                  </button>
                );
              }
            )}

            {!loading &&
              !error &&
              filteredProjects.length === 0 && (
              <div className="emptyProjectGallery">
                {projects.length === 0
                  ? "No projects have been published yet."
                  : "No projects are available in this category."}
              </div>
            )}
          </div>

          {selectedProject && (
            <aside className="projectDetailsPanel">
              <div className="projectDetailsVisual">
                <div className="projectDetailNumber">
                  {String(
                    projects.findIndex(
                      (project) =>
                        project.id === selectedProject.id
                    ) + 1
                  ).padStart(2, "0")}
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

                  {selectedProject.status && (
                    <b
                      className={`status-${selectedProject.status.toLowerCase()}`}
                    >
                      {selectedProject.status}
                    </b>
                  )}
                </div>

                <div className="projectDetailFacts">
                  {selectedProject.category && (
                    <div>
                      <span>CATEGORY</span>
                      <strong>{selectedProject.category}</strong>
                    </div>
                  )}

                  {selectedProject.location && (
                    <div>
                      <span>LOCATION</span>
                      <strong>{selectedProject.location}</strong>
                    </div>
                  )}

                  {selectedProject.progress !== null && (
                    <div>
                      <span>PROGRESS</span>
                      <strong>
                        {selectedProject.progress}%
                      </strong>
                    </div>
                  )}
                </div>

                {selectedProject.progress !== null && (
                  <div className="projectProgressBar">
                    <div
                      style={{
                        width: `${selectedProject.progress}%`,
                      }}
                    />
                  </div>
                )}

                {selectedProject.description && (
                  <div className="projectDescription">
                    <span>PROJECT OVERVIEW</span>
                    <p>{selectedProject.description}</p>
                  </div>
                )}

                {selectedProject.scope.length > 0 && (
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
                )}

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
