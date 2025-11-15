import PageHeader from "../components/PageHeader";
import AnimalClassifier from "../components/AnimalClassifier";
import ChatRealtime from "../components/ChatRealtime";

export default function AIPage() {
  return (
    <div className="container py-4">
      <PageHeader title={""} />

      <div className="row">
        <div className="col-md-7">
          <AnimalClassifier />
        </div>
        <div className="col-md-5">
          <ChatRealtime />
        </div>
      </div>
    </div>
  );
}
