export default function Loading() {
  return (
    <main className="page page--loading" aria-label="Loading dashboard">
      <div className="loading-shell">
        <div className="loading-bar loading-bar--short" />
        <div className="loading-bar loading-bar--title" />
        <div className="loading-grid">
          <div className="loading-card" />
          <div className="loading-card" />
          <div className="loading-card" />
        </div>
        <div className="loading-panel" />
      </div>
    </main>
  );
}
