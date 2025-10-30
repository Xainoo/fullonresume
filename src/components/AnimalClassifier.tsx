import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "../i18n";

export default function AnimalClassifier() {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modelRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<
    Array<{ className: string; probability: number }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [isLiveClassifying, setIsLiveClassifying] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.2);
  const classifyingRef = useRef(false);
  const classifyIntervalRef = useRef<number | null>(null);

  async function loadModelIfNeeded() {
    if (modelRef.current) return modelRef.current;
    setLoading(true);
    try {
      // dynamic import so bundle size is deferred until needed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mobilenet = await import("@tensorflow-models/mobilenet");
      await import("@tensorflow/tfjs");
      modelRef.current = await mobilenet.load();
      return modelRef.current;
    } catch (e) {
      setError(String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function classifyImage() {
    setError(null);
    const img = imgRef.current;
    if (!img) return;
    setLoading(true);
    try {
      const model = await loadModelIfNeeded();
      const preds = await model.classify(img);
      setPredictions(
        preds.map((p: any) => ({
          className: p.className,
          probability: p.probability,
        }))
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function classifyVideoFrame() {
    const video = videoRef.current;
    if (!video) return;
    if (classifyingRef.current) return; // avoid overlap
    classifyingRef.current = true;
    setIsLiveClassifying(true);
    try {
      const model = await loadModelIfNeeded();
      const preds = await model.classify(video as any);
      setPredictions(
        preds.map((p: any) => ({
          className: p.className,
          probability: p.probability,
        }))
      );
    } catch (e) {
      setError(String(e));
    } finally {
      classifyingRef.current = false;
      setIsLiveClassifying(false);
    }
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera not supported in this browser");
      return;
    }
    try {
      setError(null);
      // ensure model is loaded before starting live classification to avoid delays
      await loadModelIfNeeded();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      // start periodic classification at a reduced rate to save CPU
      const intervalMs = 1500; // 1.5s
      classifyIntervalRef.current = window.setInterval(() => {
        void classifyVideoFrame();
      }, intervalMs);
    } catch (e) {
      setError(String(e));
    }
  }

  function stopCamera() {
    try {
      const stream = videoRef.current?.srcObject as MediaStream | undefined;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    } finally {
      // give a small delay so UI updates after stopping
      setTimeout(() => setCameraOn(false), 50);
      if (classifyIntervalRef.current) {
        clearInterval(classifyIntervalRef.current);
        classifyIntervalRef.current = null;
      }
    }
  }

  useEffect(() => {
    return () => {
      // cleanup on unmount
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // no top-result highlighting: keep predictions as-is and only dim low-confidence items

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (imgRef.current) imgRef.current.src = url;
    // small delay to ensure image is loaded before classify
    imgRef.current?.addEventListener(
      "load",
      () => {
        void classifyImage();
      },
      { once: true }
    );
  }

  return (
    <div className="card p-3 mb-3">
      <h6 className="mb-2">{t("classifier_title")}</h6>
      <p className="small text-muted">{t("classifier_desc")}</p>

      <input
        type="file"
        accept="image/*"
        className="form-control mb-2"
        onChange={onFile}
      />
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 160,
            height: 160,
            overflow: "hidden",
            borderRadius: 8,
            border: "1px solid var(--card-border)",
            position: "relative",
            background: "var(--page-bg)",
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: cameraOn ? "block" : "none",
            }}
            muted
            playsInline
          />
          <img
            ref={imgRef}
            alt="upload preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: cameraOn ? "none" : "block",
            }}
          />
          {/* no overlay badge for top prediction */}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => void classifyImage()}
                disabled={loading || cameraOn}
              >
                {loading ? "Loading…" : "Classify image"}
              </button>
              {cameraOn ? (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => stopCamera()}
                >
                  Stop camera
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => void startCamera()}
                >
                  Use camera
                </button>
              )}

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                {isLiveClassifying && (
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                    aria-hidden="true"
                  />
                )}
                <div className="small text-muted">{t("classifier_live")}</div>
              </div>
            </div>

            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <label className="small text-muted" style={{ margin: 0 }}>
                {t("classifier_confidence")}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <div
                className="small text-muted"
                style={{ width: 50, textAlign: "right" }}
              >
                {(confidenceThreshold * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {error && <div className="text-danger small">{error}</div>}

          <div style={{ marginTop: 6 }}>
            <div className="small text-muted">
              Results below threshold are dimmed.
            </div>
          </div>

          <ul className="list-group list-group-flush">
            {predictions.length === 0 && (
              <li className="list-group-item small text-muted">
                {t("classifier_no_predictions")}
              </li>
            )}

            {predictions
              .slice()
              .sort((a, b) => b.probability - a.probability)
              .map((p, i) => {
                const below = p.probability < confidenceThreshold;
                return (
                  <li
                    key={i}
                    className="list-group-item d-flex justify-content-between align-items-center"
                    style={{ opacity: below ? 0.5 : 1 }}
                  >
                    <span
                      style={{
                        maxWidth: "75%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.className}
                    </span>
                    <span className="badge bg-secondary">
                      {(p.probability * 100).toFixed(1)}%
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
}
