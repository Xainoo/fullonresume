import ChatRealtime from "../components/ChatRealtime";
import PageHeader from "../components/PageHeader";
import { useTranslation } from "../i18n";

export default function ChatPage() {
  const { t } = useTranslation();
  return (
    <div className="container py-4">
      <PageHeader title={t("chat_title")} />
      <p className="small text-muted">{t("chat_desc")}</p>
      <ChatRealtime />
    </div>
  );
}
