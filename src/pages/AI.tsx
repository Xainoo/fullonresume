import React from "react";
import PageHeader from "../components/PageHeader";
import AnimalClassifier from "../components/AnimalClassifier";
import ChatRealtime from "../components/ChatRealtime";
import ClassifierSmokeTest from "../components/ClassifierSmokeTest";

export default function AIPage() {
  return (
    <div className="container py-4">
      <PageHeader title={""} />

      <div className="row">
        <div className="col-md-7">
          <AnimalClassifier />
          <ClassifierSmokeTest />
        </div>
        <div className="col-md-5">
          <ChatRealtime />
        </div>
      </div>
    </div>
  );
}
