import "../styles/components/loading.css";

export const Loading = () => {
  return (
    <div className="loading-page">
      <section className="loading-shell">
        <header className="loading-topbar skeleton-card">
          <div className="loading-brand">
            <div className="skeleton skeleton-logo" />
            <div className="loading-brand-copy">
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line tiny" />
            </div>
          </div>

          <div className="loading-nav">
            <div className="skeleton skeleton-pill" />
            <div className="skeleton skeleton-pill" />
            <div className="skeleton skeleton-pill" />
          </div>

          <div className="loading-actions">
            <div className="skeleton skeleton-btn" />
            <div className="skeleton skeleton-btn dark" />
          </div>
        </header>

        <div className="loading-hero">
          <div className="skeleton-card hero-card">
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-title large" />
            <div className="skeleton skeleton-title medium" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line wide" />
            <div className="hero-search">
              <div className="skeleton skeleton-input" />
              <div className="skeleton skeleton-submit" />
            </div>
          </div>

          <div className="hero-side">
            <div className="skeleton-card stat-card">
              <div className="skeleton skeleton-number" />
              <div className="skeleton skeleton-line tiny" />
            </div>
            <div className="skeleton-card stat-card">
              <div className="skeleton skeleton-number" />
              <div className="skeleton skeleton-line tiny" />
            </div>
            <div className="skeleton-card stat-card">
              <div className="skeleton skeleton-number" />
              <div className="skeleton skeleton-line tiny" />
            </div>
          </div>
        </div>

        <div className="loading-content">
          <main className="loading-main">
            <section className="skeleton-card section-card">
              <div className="section-head">
                <div className="skeleton skeleton-title small" />
                <div className="skeleton skeleton-line tiny short-link" />
              </div>

              <div className="category-grid">
                <div className="skeleton category-box" />
                <div className="skeleton category-box" />
                <div className="skeleton category-box" />
              </div>
            </section>

            <section className="skeleton-card section-card">
              <div className="section-head">
                <div className="skeleton skeleton-title small" />
                <div className="skeleton skeleton-line tiny short-link" />
              </div>

              <div className="post-list">
                {Array.from({ length: 4 }).map((_, index) => (
                  <article className="skeleton-post" key={index}>
                    <div className="post-row">
                      <div className="skeleton skeleton-badge small" />
                      <div className="skeleton skeleton-line tiny time" />
                    </div>
                    <div className="skeleton skeleton-title medium" />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line wide" />
                    <div className="post-footer">
                      <div className="post-author">
                        <div className="skeleton skeleton-avatar" />
                        <div className="author-copy">
                          <div className="skeleton skeleton-line tiny" />
                          <div className="skeleton skeleton-line tiny short" />
                        </div>
                      </div>
                      <div className="post-meta">
                        <div className="skeleton skeleton-line tiny short" />
                        <div className="skeleton skeleton-line tiny short" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <aside className="loading-side">
            <section className="skeleton-card side-card">
              <div className="section-head">
                <div className="skeleton skeleton-title small" />
              </div>
              <div className="rank-list">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="rank-item" key={index}>
                    <div className="skeleton rank-box" />
                    <div className="rank-copy">
                      <div className="skeleton skeleton-line tiny" />
                      <div className="skeleton skeleton-line tiny short" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="skeleton-card side-card">
              <div className="section-head">
                <div className="skeleton skeleton-title small" />
              </div>
              <div className="mini-stat-grid">
                <div className="skeleton mini-box" />
                <div className="skeleton mini-box" />
                <div className="skeleton mini-box" />
              </div>
            </section>

            <section className="skeleton-card side-card highlight-card">
              <div className="skeleton skeleton-badge" />
              <div className="skeleton skeleton-title medium" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line wide" />
              <div className="skeleton skeleton-submit full" />
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
};
