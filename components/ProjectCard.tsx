import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="projectCard">
      <div className={`projectVisual ${project.visual}`}>
        <div className="building buildingOne" />
        <div className="building buildingTwo" />
        <div className="projectNumber">{project.number}</div>
      </div>
      <div className="projectInfo">
        <div>
          <span>{project.category}</span>
          <h3>{project.title}</h3>
        </div>
        <p>{project.location}</p>
      </div>
    </article>
  );
}
