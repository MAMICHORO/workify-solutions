"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  mapProject,
  type ProjectRecord,
} from "@/lib/projects";
import { createClient } from "@/lib/supabase/client";

export default function AdminProjectsPage() {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("projects")
      .select("*");

    if (queryError) {
      console.error(
        "Unable to load admin projects:",
        queryError.code,
        queryError.message
      );
      setError("Projects could not be loaded.");
      setProjects([]);
    } else {
      setProjects(
        (data ?? [])
          .map(mapProject)
          .filter(
            (project): project is ProjectRecord =>
              project !== null
          )
      );
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();

    if (!normalized) return projects;

    return projects.filter((project) =>
      [
        project.title,
        project.category,
        project.location,
        project.status,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalized)
    );
  }, [projects, query]);

  async function addProject(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const values = new FormData(form);

    const { error: insertError } = await supabase
      .from("projects")
      .insert({
        title: String(values.get("title") ?? "").trim(),
        category: String(values.get("category") ?? "").trim(),
        location: String(values.get("location") ?? "").trim(),
        description: String(
          values.get("description") ?? ""
        ).trim(),
        status: "Active",
        progress: 0,
      });

    if (insertError) {
      console.error("Unable to create project:", insertError);
      setError(
        `Project could not be created: ${insertError.message}`
      );
      return;
    }

    form.reset();
    setShowForm(false);
    await loadProjects();
    router.refresh();
  }

  async function updateProject(
    id: string,
    changes: Record<string, unknown>
  ) {
    setError("");

    const { error: updateError } = await supabase
      .from("projects")
      .update(changes)
      .eq("id", id);

    if (updateError) {
      console.error("Unable to update project:", updateError);
      setError(
        `Project could not be updated: ${updateError.message}`
      );
      return;
    }

    await loadProjects();
    router.refresh();
  }

  async function deleteProject(project: ProjectRecord) {
    if (
      !window.confirm(
        `Delete "${project.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setError("");

    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (deleteError) {
      console.error("Unable to delete project:", deleteError);
      setError(
        `Project could not be deleted: ${deleteError.message}`
      );
      return;
    }

    await loadProjects();
    router.refresh();
  }

  return (
    <section className="adminLight">
      <aside className="adminNav">
        <div className="adminBrand">
          WORKIFY<span>SOLUTIONS</span>
        </div>
        <a className="adminGallerySidebarLink" href="/admin">
          Overview
        </a>
        <a className="adminGallerySidebarLink" href="/admin/projects">
          Projects
        </a>
        <a className="adminGallerySidebarLink" href="/admin/gallery">
          Gallery
        </a>
        <a href="/" className="backSite">
          ← Public website
        </a>
      </aside>

      <main className="adminContent">
      <header className="adminHeader">
        <div>
          <span className="eyebrow">LIVE DATA</span>
          <h1>Projects</h1>
        </div>

        <div className="adminHeaderActions">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects"
          />
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
          >
            + Add project
          </button>
        </div>
      </header>

      {error && <div className="workifyRequestError">{error}</div>}

      {showForm && (
        <section className="panel">
          <form onSubmit={addProject} className="adminModal">
            <h2>Add project</h2>
            <label>
              Title
              <input name="title" required />
            </label>
            <div className="twoCol">
              <label>
                Category
                <input name="category" />
              </label>
              <label>
                Location
                <input name="location" />
              </label>
            </div>
            <label>
              Description
              <textarea name="description" rows={4} />
            </label>
            <button type="submit">Save project</button>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="panelTitle">
          <h2>Project register</h2>
          <span>LIVE DATA</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Category</th>
              <th>Location</th>
              <th>Progress</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!loading && filteredProjects.length === 0 && (
              <tr>
                <td colSpan={6} className="emptyCell">
                  No projects have been created.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={6} className="emptyCell">
                  Loading projects...
                </td>
              </tr>
            )}

            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td>
                  <strong>{project.title}</strong>
                  {project.description && (
                    <small>{project.description}</small>
                  )}
                </td>
                <td>{project.category || "—"}</td>
                <td>{project.location || "—"}</td>
                <td>
                  <input
                    className="progressInput"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={project.progress ?? ""}
                    onBlur={(event) =>
                      updateProject(project.id, {
                        progress: Number(event.target.value),
                      })
                    }
                  />
                  %
                </td>
                <td>
                  <select
                    value={project.status}
                    onChange={(event) =>
                      updateProject(project.id, {
                        status: event.target.value,
                      })
                    }
                  >
                    {!["Planned", "Active", "Completed"].includes(
                      project.status
                    ) &&
                      project.status && (
                        <option>{project.status}</option>
                      )}
                    <option>Planned</option>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Draft</option>
                    <option>Archived</option>
                  </select>
                </td>
                <td>
                  <button
                    className="dangerText"
                    type="button"
                    onClick={() => deleteProject(project)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      </main>
    </section>
  );
}
