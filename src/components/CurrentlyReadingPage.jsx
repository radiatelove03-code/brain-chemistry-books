import ProgressBar from "./ProgressBar"

function CurrentlyReadingPage({
  saveMessage,
  currentlyReadingReviews,
  getProgressPercent,
  progressInputs,
  getBookReadingLogs,
  formatDate,
  formatDateKey,
  setSelectedReadingLogBookId,
  setStep,
  finishBook,
  openSavedReview,
  editReview,
  deleteReview,
}) {
  return (
    <section>
      <p>Currently Reading</p>
      <h1>Reading Progress</h1>
      <p>
        Keep this page simple: log pages here, then open the full log only when you need to edit history.
      </p>

      {saveMessage && <p>{saveMessage}</p>}

      {currentlyReadingReviews.length === 0 && <p>No currently reading books yet.</p>}

      {currentlyReadingReviews.map((item) => {
        const progressPercent = getProgressPercent(item.bookInfo)
        const lastLog = [...getBookReadingLogs(item.id)].sort((a, b) =>
          (b.date || "").localeCompare(a.date || "")
        )[0]

        return (
          <div className="score-card" key={item.id}>
            {item.bookInfo.coverUrl && (
              <img
                src={item.bookInfo.coverUrl}
                alt="Book cover"
                className="book-cover"
              />
            )}

            <h2>{item.bookInfo.title || "Untitled Book"}</h2>
            <p>{item.bookInfo.author || "Unknown Author"}</p>
            <p>{item.bookInfo.format} • Currently Reading</p>

            {item.bookInfo.dateStarted && (
              <p>📖 Started {formatDate(item.bookInfo.dateStarted)}</p>
            )}

            <p>
              Page {item.bookInfo.currentPage || "0"} of {item.bookInfo.totalPages || "?"}
            </p>

            <ProgressBar percent={progressPercent} />

            <button
              onClick={() => {
                setSelectedReadingLogBookId(item.id)
                setStep("readingLog")
              }}
            >
              🔥 Log Today's Reading
            </button>

            {lastLog && (
              <p>
                Last log: {formatDateKey(lastLog.date)} • {lastLog.pagesRead || 0} pages
              </p>
            )}

            <button onClick={() => finishBook(item)}>✅ Finish Book</button>
            <button onClick={() => openSavedReview(item)}>View Details</button>
            <button onClick={() => editReview(item)}>Edit</button>
            <button onClick={() => deleteReview(item.id)}>Delete</button>
          </div>
        )
      })}

      <button onClick={() => setStep("home")}>Back Home</button>
    </section>
  )
}

export default CurrentlyReadingPage