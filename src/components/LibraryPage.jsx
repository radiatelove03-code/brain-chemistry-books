import ProgressBar from "./ProgressBar"

function LibraryPage({
  setLibraryFilter,
  librarySearch,
  setLibrarySearch,
  libraryRatingFilter,
  setLibraryRatingFilter,
  librarySpiceFilter,
  setLibrarySpiceFilter,
  libraryFinishedYearFilter,
  setLibraryFinishedYearFilter,
  libraryFinishedYears,
  libraryFinishedMonthFilter,
  setLibraryFinishedMonthFilter,
  libraryTropeFilter,
  setLibraryTropeFilter,
  libraryTropeOptions,
  filteredReviews,
  savedReviews,
  resetLibraryFilters,
  isLibraryLoading,
  openSavedReview,
  formatDate,
  getProgressPercent,
  finishBook,
  getDaysToRead,
  editReview,
  deleteReview,
  setStep,
}) {
  return (
    <section>
      <p>Your Library</p>
      <h1>Saved Reviews</h1>

      <button onClick={() => setLibraryFilter("all")}>📚 All Books</button>
      <button onClick={() => setLibraryFilter("reading")}>📖 Currently Reading</button>
      <button onClick={() => setLibraryFilter("finished")}>✅ Finished</button>
      <button onClick={() => setLibraryFilter("dnf")}>🚫 DNF</button>
      <button onClick={() => setLibraryFilter("favorites")}>🧠 Brain Chemistry</button>

      <div className="score-card library-filter-card">
        <p>Smart Library Filters</p>

        <label>
          Search Title or Author
          <input
            type="text"
            value={librarySearch}
            onChange={(event) => setLibrarySearch(event.target.value)}
            placeholder="Search your shelves..."
          />
        </label>

        <label>
          Rating
          <select
            value={libraryRatingFilter}
            onChange={(event) => setLibraryRatingFilter(event.target.value)}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>
        </label>

        <label>
          Spice
          <select
            value={librarySpiceFilter}
            onChange={(event) => setLibrarySpiceFilter(event.target.value)}
          >
            <option value="all">All Spice Levels</option>
            <option value="5">🌶️ 5</option>
            <option value="4">🌶️ 4+</option>
            <option value="3">🌶️ 3+</option>
            <option value="2">🌶️ 2+</option>
            <option value="1">🌶️ 1+</option>
          </select>
        </label>

        <label>
          Finished Year
          <select
            value={libraryFinishedYearFilter}
            onChange={(event) => setLibraryFinishedYearFilter(event.target.value)}
          >
            <option value="all">All Years</option>
            {libraryFinishedYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label>
          Finished Month
          <select
            value={libraryFinishedMonthFilter}
            onChange={(event) => setLibraryFinishedMonthFilter(event.target.value)}
          >
            <option value="all">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </label>

        <label>
          Trope
          <select
            value={libraryTropeFilter}
            onChange={(event) => setLibraryTropeFilter(event.target.value)}
          >
            <option value="all">All Tropes</option>
            {libraryTropeOptions.map((trope) => (
              <option key={trope} value={trope}>
                {trope}
              </option>
            ))}
          </select>
        </label>

        <p>
          Showing {filteredReviews.length} of {savedReviews.length} books
        </p>

        <button onClick={resetLibraryFilters}>Reset Filters</button>
      </div>

      {isLibraryLoading && savedReviews.length === 0 && <p>Loading your library...</p>}

      {!isLibraryLoading && filteredReviews.length === 0 && (
        <p>No reviews found for these filters. Try Reset Filters if your shelves look empty.</p>
      )}

      <div className="library-results-grid">
        {filteredReviews.map((item) => (
          <div className="score-card library-book-card" key={item.id}>
            {item.bookInfo.coverUrl ? (
              <button
                className="library-cover-button"
                onClick={() => openSavedReview(item)}
                aria-label={`Open review for ${item.bookInfo.title || "Untitled Book"}`}
              >
                <img
                  src={item.bookInfo.coverUrl}
                  alt={`${item.bookInfo.title || "Book"} cover`}
                  className="book-cover library-book-cover"
                />
              </button>
            ) : (
              <button
                className="library-cover-button library-cover-placeholder"
                onClick={() => openSavedReview(item)}
                aria-label={`Open review for ${item.bookInfo.title || "Untitled Book"}`}
              >
                📖
              </button>
            )}

            {item.bookInfo.status === "DNF" ? (
              <>
                <p>🚫 DNF</p>
                <button
                  className="library-title-button"
                  onClick={() => openSavedReview(item)}
                >
                  {item.bookInfo.title || "Untitled Book"}
                </button>
                <p>{item.bookInfo.author || "Unknown Author"}</p>
                <p>{item.bookInfo.format} • {item.bookInfo.status}</p>
                <p>📍 DNF at {item.dnfInfo?.percent || "?"}%</p>
                <p>Reason: {item.dnfInfo?.reason || "No reason listed"}</p>
                <p>
                  Would read author again: {item.dnfInfo?.wouldReadAuthorAgain || "Maybe"}
                </p>
              </>
            ) : item.bookInfo.status === "Reading" || item.bookInfo.status === "TBR" ? (
              <>
                <p>📖 Currently Reading</p>
                <button
                  className="library-title-button"
                  onClick={() => openSavedReview(item)}
                >
                  {item.bookInfo.title || "Untitled Book"}
                </button>
                <p>{item.bookInfo.author || "Unknown Author"}</p>
                <p>{item.bookInfo.format} • Reading</p>
                {item.bookInfo.dateStarted && (
                  <p>📖 Started {formatDate(item.bookInfo.dateStarted)}</p>
                )}
                <p>
                  Page {item.bookInfo.currentPage || "0"} of{" "}
                  {item.bookInfo.totalPages || "?"}
                </p>
                <ProgressBar percent={getProgressPercent(item.bookInfo)} />

                <button className="library-action-button" onClick={() => finishBook(item)}>
                  ✅ Finish Book
                </button>
              </>
            ) : (
              <>
                {item.isFavorite && <p>🧠 Brain Chemistry Book</p>}

                <button
                  className="library-title-button"
                  onClick={() => openSavedReview(item)}
                >
                  {item.bookInfo.title || "Untitled Book"}
                </button>
                <p>{item.bookInfo.author || "Unknown Author"}</p>
                <p>{item.bookInfo.format} • {item.bookInfo.status}</p>

                {item.bookInfo.dateFinished && (
                  <p>📅 Finished {formatDate(item.bookInfo.dateFinished)}</p>
                )}

                {getDaysToRead(item) && (
                  <p>
                    ⏱️ Read in {getDaysToRead(item)} day
                    {getDaysToRead(item) !== 1 ? "s" : ""}
                  </p>
                )}

                <p>
                  ⭐ {item.bookScore}/5 • ❤️ {item.obsessionScore}/5 • 🌶️{" "}
                  {item.metrics?.spice}/5
                </p>

                <p>{item.recommendationLevel}</p>
              </>
            )}

            <button className="library-action-button" onClick={() => openSavedReview(item)}>
              View Review
            </button>
            <button className="library-action-button" onClick={() => editReview(item)}>
              Edit Review / Dates
            </button>
            <button
              className="library-action-button library-delete-button"
              onClick={() => deleteReview(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <button onClick={() => setStep("home")}>Back Home</button>
    </section>
  )
}

export default LibraryPage