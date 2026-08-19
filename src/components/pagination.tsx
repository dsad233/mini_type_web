type TPaginationProps = {
  page: number;
  totalPages: number;
  visiblePages: number[];
  onMovePage: (nextPage: number) => void;
  ariaLabel?: string;
};

export default function Pagination({
  page,
  totalPages,
  visiblePages,
  onMovePage,
  ariaLabel = "페이지 이동",
}: TPaginationProps) {
  return (
    <nav className="posts-pagination" aria-label={ariaLabel}>
      <button
        type="button"
        className="posts-page-btn"
        onClick={() => onMovePage(page - 1)}
        disabled={page === 1}
      >
        이전
      </button>

      {visiblePages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          className={`posts-page-btn ${page === pageNumber ? "is-current" : ""}`}
          onClick={() => onMovePage(pageNumber)}
          aria-current={page === pageNumber ? "page" : undefined}
          aria-label={`페이지 ${pageNumber}`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        className="posts-page-btn"
        onClick={() => onMovePage(page + 1)}
        disabled={page === totalPages}
      >
        다음
      </button>
    </nav>
  );
}
