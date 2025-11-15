import AnimalClassifier from "../components/AnimalClassifier";
import PageHeader from "../components/PageHeader";
import { useTranslation } from "../i18n";

export default function ImageAnalyzerPage() {
  const { t } = useTranslation();
  return (
    <div className="container py-4">
      <PageHeader title={t("image_analyzer_title")} />
      <p className="small text-muted">{t("image_analyzer_desc")}</p>
      <AnimalClassifier />
    </div>
  );
}
