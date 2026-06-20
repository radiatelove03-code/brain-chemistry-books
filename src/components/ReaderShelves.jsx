function getShelfStats(books) {
  return {
    reading: books.filter((item) => item.bookInfo?.status === "Reading").length,
    read: books.filter((item) => item.bookInfo?.status === "Finished").length,
    tbr: books.filter((item) => item.bookInfo?.status === "TBR").length,
    favorites: books.filter((item) => item.isFavorite).length,
  }
}

function getShelfBooks(books, activeShelf) {
  if (activeShelf === "reading") {
    return books.filter((item) => item.bookInfo?.status === "Reading")
  }

  if (activeShelf === "read") {
    return books.filter((item) => item.bookInfo?.status === "Finished")
  }

  if (activeShelf === "tbr") {
    return books.filter((item) => item.bookInfo?.status === "TBR")
  }

  if (activeShelf === "favorites") {
    return books.filter((item) => item.isFavorite)
  }

  return books
}

function formatShelfDate(dateValue) {
  if (!dateValue) return ""

  const date = new Date(`${dateValue}T00:00:00`)

  if (Number.isNaN(date.getTime())) return dateValue

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function ReaderShelves({
  books,
  activeShelf,
  onShelfChange,
  emptyName = "this reader",
  onOpenBook,
}) {
  const shelfStats = getShelfStats(books)
  const shelfBooks = getShelfBooks(books, activeShelf)

  const shelfOptions = [
    { key: "reading", label: "Currently Reading", icon: "📖", count: shelfStats.reading },
    { key: "read", label: "Read", icon: "📚", count: shelfStats.read },
    { key: "tbr", label: "Want To Read", icon: "✨", count: shelfStats.tbr },
    { key: "favorites", label: "Favorites", icon: "❤️", count: shelfStats.favorites },
  ]

  return (
    <div className="reader-shelves-panel">
      <div className="reader-shelves-header">
        <p>Reader Shelves</p>
        <h2>Browse the library</h2>
      </div>

      <div className="reader-shelf-stats">
        {shelfOptions.map((shelf) => (
          <button
            type="button"
            key={shelf.key}
            className={activeShelf === shelf.key ? "active" : ""}
            onClick={() => onShelfChange(shelf.key)}
          >
            <span>{shelf.icon}</span>
            <strong>{shelf.count}</strong>
            {shelf.label}
          </button>
        ))}
      </div>

      {shelfBooks.length ? (
        <div className="reader-shelf-grid">
          {shelfBooks.map((item) => (
            <button
              type="button"
              key={item.id}
              className="reader-shelf-book-card reader-shelf-book-button"
              onClick={() => onOpenBook?.(item)}
              aria-label={`Open ${item.bookInfo?.title || "book"} review`}
            >
              {item.bookInfo?.coverUrl ? (
                <img
                  src={item.bookInfo.coverUrl}
                  alt={`${item.bookInfo.title || "Book"} cover`}
                />
              ) : (
                <div className="reader-shelf-cover-placeholder">📖</div>
              )}

              <div>
                <h3>{item.bookInfo?.title || "Untitled Book"}</h3>
                <p>{item.bookInfo?.author || "Unknown Author"}</p>

                {item.bookInfo?.status === "Finished" && item.bookScore && (
                  <p>⭐ {item.bookScore}/5</p>
                )}

                {item.bookInfo?.status === "Finished" && item.bookInfo?.dateFinished && (
                  <p>Finished {formatShelfDate(item.bookInfo.dateFinished)}</p>
                )}

                {item.bookInfo?.status === "Reading" && (
                  <p>
                    Reading now
                    {item.bookInfo?.currentPage && item.bookInfo?.totalPages
                      ? ` • page ${item.bookInfo.currentPage}/${item.bookInfo.totalPages}`
                      : ""}
                  </p>
                )}

                {item.bookInfo?.status === "TBR" && (
                  <p>Waiting on the TBR cart ✨</p>
                )}

                {item.isFavorite && <p>❤️ Favorite</p>}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="score-card reader-shelf-empty">
          <p>No books on this shelf yet.</p>
          <p>{emptyName} hasn’t added anything here.</p>
        </div>
      )}
    </div>
  )
}

export default ReaderShelves