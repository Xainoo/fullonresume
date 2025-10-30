import { useEffect, useState } from "react";
import { useTranslation } from "../i18n";

export default function ClassifierSmokeTest() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Array<{
    className: string;
    probability: number;
  }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();
  // prefer local sample to avoid cross-origin issues; fallback to remote if needed
  const SAMPLE = "/sample-cat.svg";

  async function runTest() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      // dynamic import to match app behavior
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mobilenet = await import("@tensorflow-models/mobilenet");
      await import("@tensorflow/tfjs");
      const model = await mobilenet.load();

      // create image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = SAMPLE;

      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("Image load failed"));
      });

      const preds = await model.classify(img as any);
      setResult(
        preds.map((p: any) => ({
          className: p.className,
          probability: p.probability,
        }))
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    // don't auto-run; let user trigger
  }, []);

  return (
    <div className="card p-3 mb-3">
      <h6 className="mb-2">{t("smoke_test_title")}</h6>
      <p className="small text-muted">{t("smoke_test_desc")}</p>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => void runTest()}
          disabled={running}
        >
          {running ? "Running…" : t("run_smoke_test")}
        </button>
        <a
          href={SAMPLE}
          target="_blank"
          rel="noreferrer"
          className="small text-muted"
        >
          {t("open_sample_image")}
        </a>
      </div>

      <div style={{ marginTop: 8 }}>
        {error && <div className="text-danger small">{error}</div>}
        {result && (
          <ul className="list-group list-group-flush mt-2">
            {result.map((r, i) => (
              <li
                key={i}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span
                  style={{
                    maxWidth: "75%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.className}
                </span>
                <span className="badge bg-secondary">
                  {(r.probability * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
