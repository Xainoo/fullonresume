import { useState } from "react";
import { motion } from "framer-motion";
import SkillPill from "../components/SkillPill";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import { useTranslation } from "../i18n";

// motion variants
const container = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<null | {
    title: string;
    description: string;
    longDescription: string;
    image?: string;
  }>(null);

  const projects = [
    {
      id: "image_analyzer",
      title: t("image_analyzer_title"),
      description: t("image_analyzer_desc"),
      longDescription: t("image_analyzer_long"),
    },
    {
      id: "chat",
      title: t("nav_chat"),
      description: t("chat_desc"),
      longDescription: t("chat_desc"),
    },
    {
      id: "weather",
      title: t("project_weather_title"),
      description: t("project_weather_description"),
      longDescription: t("project_weather_long"),
    },
    {
      id: "finance",
      title: t("project_finance_title"),
      description: t("project_finance_description"),
      longDescription: t("project_finance_long"),
    },
  ];

  function openProject(p: {
    title: string;
    description: string;
    longDescription: string;
    image?: string;
  }) {
    setSelected(p);
  }

  function closeModal() {
    setSelected(null);
  }

  return (
    <motion.section
      className="container py-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="row align-items-center mb-5">
        <div className="col-md-7">
          <motion.h1 className="display-5 fw-bold mb-3" variants={item}>
            {t("home_title")}
          </motion.h1>
          <motion.p className="lead text-muted mb-4" variants={item}>
            {t("home_lead")}
          </motion.p>

          <motion.div className="d-flex gap-2" variants={item}>
            <a href="#projects" className="btn btn-primary btn-lg">
              {t("cta_work")}
            </a>
          </motion.div>
        </div>

        <div className="col-md-5 text-center mt-4 mt-md-0">
          <motion.div
            className="hero-card p-4 rounded shadow-sm d-inline-block"
            variants={item}
            whileHover={{ scale: 1.02 }}
          >
            <div className="avatar mb-3">KP</div>
            <h3 className="h6 mb-1">Krzysztof Przystaś</h3>
            <p className="small text-muted mb-0">
              Frontend Engineer — React & TypeScript
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div className="row mb-5" variants={container}>
        <div className="col-12">
          <motion.h2 className="h4 fw-bold mb-3" variants={item}>
            {t("skills")}
          </motion.h2>
          <motion.div className="d-flex flex-wrap gap-2" variants={container}>
            {[
              "React",
              "JavaScript",
              "Node.js",
              "Python",
              "TypeScript",
              "HTML & CSS",
              "Bootstrap",
              "Performance",
              "Accessibility",
            ].map((s) => (
              <motion.div key={s} variants={item}>
                <SkillPill>{s}</SkillPill>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <div id="projects" className="row g-3">
        <div className="col-12">
          <motion.h2 className="h5 fw-bold mb-3" variants={item}>
            {t("projects")}
          </motion.h2>
          <p className="small text-muted mb-3">
            This site is built using free and open technologies (Vite, React,
            TypeScript, Netlify Functions, TensorFlow.js). Optional realtime
            features may use services that offer free tiers.
          </p>
          <div className="row row-cols-1 row-cols-md-3 g-3">
            {projects.map((p) => (
              <div className="col" key={p.id}>
                <ProjectCard
                  title={p.title}
                  description={p.description}
                  onOpen={() => openProject(p)}
                  actionLabel={t("view_project")}
                  actionHref={
                    p.id === "weather"
                      ? "/weather"
                      : p.id === "finance"
                      ? "/finance"
                      : p.id === "image_analyzer"
                      ? "/image-analyzer"
                      : p.id === "chat"
                      ? "/chat"
                      : "#"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <p className="text-muted small">
          {t("footer_cta")} <a href="#projects">{t("cta_work")}</a>.
        </p>
      </div>

      {selected && (
        <ProjectModal
          open={!!selected}
          title={selected.title}
          description={selected.longDescription}
          image={selected.image}
          onClose={closeModal}
        />
      )}
    </motion.section>
  );
}
