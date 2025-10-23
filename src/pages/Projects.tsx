import { Link } from "react-router-dom";

export default function Projects() {
  const projects = [
    {
      id: "project-1",
      title: "Project One",
      desc: "Short desc for project one",
    },
    {
      id: "project-2",
      title: "Project Two",
      desc: "Short desc for project two",
    },
  ];
  return (
    <div className="container py-4">
      <h1>Projects</h1>
      <div className="list-group">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="list-group-item list-group-item-action"
          >
            <h5 className="mb-1">{p.title}</h5>
            <p className="mb-1">{p.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
