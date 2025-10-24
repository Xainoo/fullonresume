import { useState } from "react";
import { motion } from "framer-motion";
import SkillPill from "../components/SkillPill";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import { useTranslation } from "../i18n";

// motion variants
// - container: used for staggered entrance animations of groups
// - item: used for the individual elements that will fade/slide in
const container = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

/**
 * Home page
 * - Organized into clear sections: Hero, Skills, Featured project, About.
 * - Uses framer-motion for lightweight entrance animations. Motion is
 *   intentionally subtle so it doesn't distract from the content.
 * - Semantic structure: headings follow a logical hierarchy for screen readers.
 */
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
      title: "Portfolio site",
      description:
        "A responsive portfolio showcasing selected projects, written with React & TypeScript. Includes accessibility and performance optimizations.",
      longDescription:
        "This portfolio demonstrates component-driven design, accessible markup, responsive layouts, and careful performance tradeoffs. Built with React, TypeScript, and Vite. Includes light/dark themes and i18n.",
    },
    {
      title: "Weather app",
      description:
        "A small weather dashboard with serverless proxy for API keys and graceful fallbacks. Theme-aware and localized.",
      longDescription:
        "Uses a Netlify Function to proxy OpenWeather API calls so API keys remain server-side. The UI gracefully falls back to a client key in local dev and shows warnings. Supports language localization and theme-aware styles.",
    },
    {
      title: "Finance analyzer",
      description:
        "Savings & investment tools with projection charts and country tax estimates. Built with small serverless functions.",
      longDescription:
        "Includes an expense tracker, savings simulator, and an investment analyzer that fetches historical data and estimates growth and taxes. Designed for clarity and quick what-if analysis.",
    },
    {
      title: "Interactive UI components",
      description:
        "Reusable components (InfoIcon, SkillPill, ProjectCard) designed for accessibility and small bundle size.",
      longDescription:
        "A small library of focused UI components: accessible info tooltips, keyboard-friendly skill pills, and composable cards. Each component prioritizes semantics and minimal styling.",
    },
  ];

  // split featured and other projects
  const featuredProjects = [projects[1], projects[2]]; // Weather, Finance
  const otherProjects = [projects[0], projects[3]]; // Portfolio, Interactive UI components

  function openProject(p: any) {
    setSelected(p);
  }

  function closeModal() {
    setSelected(null);
  }

  return (
    // top-level motion section to coordinate staggered entrance animations
    <motion.section
      className="container py-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* HERO: intro, CTA buttons, and a compact profile card */}
      <div className="row align-items-center mb-5">
        <div className="col-md-7">
          <motion.h1 className="display-5 fw-bold mb-3" variants={item}>
            {t("home_title")}
          </motion.h1>
          <motion.p className="lead text-muted mb-4" variants={item}>
            {t("home_lead")}
          </motion.p>

          {/* Primary CTAs: use descriptive link text and aria where needed */}
          <motion.div className="d-flex gap-2" variants={item}>
            <a href="#featured-projects" className="btn btn-primary btn-lg">
              {t("cta_work")}
            </a>
          </motion.div>
        </div>

        {/* Compact profile card: visual anchor in the hero */}
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

      {/* SKILLS: list of skill pills that provide interactivity via framer-motion */}
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

      {/* FEATURED PROJECT and ABOUT sections */}
      <div className="row g-3">
        <div id="featured-projects" className="col-md-6">
          <motion.h2 className="h5 fw-bold mb-3" variants={item}>
            {t("featured_project")}
          </motion.h2>
          <div className="row row-cols-1 row-cols-md-2 g-3">
            {featuredProjects.map((p) => (
              <div className="col" key={p.title}>
                <ProjectCard
                  title={p.title}
                  description={p.description}
                  onOpen={() => openProject(p)}
                  actionLabel={t("view_project")}
                  actionHref={
                    p.title.toLowerCase().includes("weather")
                      ? "/weather"
                      : p.title.toLowerCase().includes("finance")
                      ? "/finance"
                      : "#"
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <motion.h2 className="h5 fw-bold mb-3" variants={item}>
            {t("about")}
          </motion.h2>
          <div className="card h-100 hover-card">
            <div className="card-body">
              <p className="card-text text-muted">
                I'm passionate about building interfaces that are both beautiful
                and usable. I enjoy turning complex problems into simple,
                accessible experiences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTHER PROJECTS: less prominent, grouped separately */}
      <div className="row mt-5">
        <div className="col-12">
          <motion.h2 className="h5 fw-bold mb-3" variants={item}>
            {t("other_projects")}
          </motion.h2>
          <div className="row row-cols-1 row-cols-md-3 g-3">
            {otherProjects.map((p) => (
              <div className="col" key={p.title}>
                <ProjectCard
                  title={p.title}
                  description={p.description}
                  onOpen={() => openProject(p)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA: lightweight call-to-action */}
      <div className="text-center mt-5">
        <p className="text-muted small">
          {t("footer_cta")} <a href="#featured-projects">{t("cta_work")}</a>.
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
