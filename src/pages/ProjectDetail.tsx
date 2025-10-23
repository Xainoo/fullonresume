import { useParams } from "react-router-dom";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h1>Project {id}</h1>
      <p>Details for project {id} go here.</p>
    </div>
  );
}
