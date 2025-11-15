export default function CVPage() {
  return (
    <div className="container py-4">
      <h2 className="mb-3">Curriculum Vitae</h2>
      <p className="text-muted">Download a plain-text copy or view below.</p>
      <a
        href="/cv.txt"
        className="btn btn-sm btn-outline-primary mb-3"
        download
      >
        Download CV (text)
      </a>

      <div className="card p-3">
        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
          {`Krzysztof Przystaś
Frontend Developer

Email: krzysztof.przystas@gmail.com
Phone: +48 695 795 268

Summary:
Experienced in building responsive, accessible, and performant web applications with React and TypeScript. Passionate about frontend engineering, UX, and clean code.

Tech: React, TypeScript, Vite, Node.js, TensorFlow.js, Netlify

Selected Projects:
- Portfolio site (this site) — personal website with demos and serverless functions
- Finance dashboard — interactive charts and simulated analytics
- Weather app — theme-aware UI with serverless proxy

Education & Other: Open to share on request.`}
        </pre>
      </div>
    </div>
  );
}
