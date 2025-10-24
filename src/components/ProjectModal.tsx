type Props = {
  open: boolean;
  title?: string;
  description?: string;
  image?: string;
  onClose: () => void;
};

export default function ProjectModal({
  open,
  title,
  description,
  image,
  onClose,
}: Props) {
  if (!open) return null;
  return (
    <div
      className="project-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-start">
          <h5 className="mb-2">{title}</h5>
          <button
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
        {image && (
          <div style={{ marginBottom: 12 }}>
            <img
              src={image}
              alt=""
              style={{ width: "100%", borderRadius: 6 }}
            />
          </div>
        )}
        <div className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
          {description}
        </div>
      </div>
    </div>
  );
}
