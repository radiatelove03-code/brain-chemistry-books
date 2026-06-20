import ProgressBar from "./ProgressBar"

function ReadingLogPage({
  savedReviews,
  selectedReadingLogBookId,
  saveMessage,
  getProgressPercent,
  progressInputs,
  setProgressInputs,
  readingLogMinutesInputs,
  setReadingLogMinutesInputs,
  readingLogNoteInputs,
  setReadingLogNoteInputs,
  getBookReadingLogs,
  logReadingProgress,
  readingLogDrafts,
  readingLogDirty,
  stageReadingLogEdit,
  saveReadingLogEdits,
  deleteReadingLog,
  formatDateKey,
  setStep,
}) {
  const item = savedReviews.find(
    (reviewItem) => reviewItem.id === selectedReadingLogBookId
  )

  if (!item) {
    return (
      <section>
        <p>Reading Log</p>
        <h1>No book selected</h1>
        <p>Go back to Currently Reading and choose a book log to manage.</p>
        <button onClick={() => setStep("currentlyReading")}>
          Back to Currently Reading
        </button>
      </section>
    )
  }

  const progressPercent = getProgressPercent(item.bookInfo)
  const pageInputValue = progressInputs[item.id] ?? item.bookInfo.currentPage ?? ""
  const readingLogs = [...getBookReadingLogs(item.id)].sort((a, b) =>
    (b.date || "").localeCompare(a.date || "")
  )

  return (
    <section>
      <p>Reading Log</p>
      <h1>{item.bookInfo.title || "Untitled Book"}</h1>
      <p>{item.bookInfo.author || "Unknown Author"}</p>

      {saveMessage && <p>{saveMessage}</p>}

      {item.bookInfo.coverUrl && (
        <img src={item.bookInfo.coverUrl} alt="Book cover" className="book-cover" />
      )}

      <div className="score-card">
        <p>Current Progress</p>
        <p>
          Page {item.bookInfo.currentPage || "0"} of {item.bookInfo.totalPages || "?"}
        </p>
        <ProgressBar percent={progressPercent} />

        <div className="review-field">
          <label>Page I reached today</label>
          <input
            type="number"
            min="0"
            max={item.bookInfo.totalPages || undefined}
            value={pageInputValue}
            onChange={(event) =>
              setProgressInputs({
                ...progressInputs,
                [item.id]: event.target.value,
              })
            }
          />
        </div>

        <div className="review-field">
          <label>Minutes Read (optional)</label>
          <input
            type="number"
            min="0"
            value={readingLogMinutesInputs[item.id] || ""}
            onChange={(event) =>
              setReadingLogMinutesInputs({
                ...readingLogMinutesInputs,
                [item.id]: event.target.value,
              })
            }
          />
        </div>

        <div className="review-field">
          <label>Reading Notes (optional)</label>
          <textarea
            value={readingLogNoteInputs[item.id] || ""}
            onChange={(event) =>
              setReadingLogNoteInputs({
                ...readingLogNoteInputs,
                [item.id]: event.target.value,
              })
            }
            placeholder="Optional: where you read, thoughts, chaos, etc."
          />
        </div>

        <button onClick={() => logReadingProgress(item.id)}>🔥 Log Reading</button>
      </div>

      <div className="score-card">
        <p>Reading Log History</p>
        <p>Editing a log updates your streak stats. Delete accidental logs here.</p>

        {readingLogs.length === 0 && (
          <p>No page logs yet. Your streak starts once you log 2 days in a row.</p>
        )}

        {readingLogs.map((log) => {
          const draftKey = `${item.id}-${log.id}`
          const draft = readingLogDrafts[draftKey] || {}
          const hasUnsavedEdits = Boolean(readingLogDirty[draftKey])

          return (
            <div className="review-field" key={log.id}>
              <label>Log Date</label>
              <input
                type="date"
                value={draft.date ?? log.date ?? ""}
                onChange={(event) =>
                  stageReadingLogEdit(item.id, log.id, "date", event.target.value)
                }
              />

              <label>Pages Read</label>
              <input
                type="number"
                min="0"
                value={draft.pagesRead ?? log.pagesRead ?? 0}
                onChange={(event) =>
                  stageReadingLogEdit(item.id, log.id, "pagesRead", event.target.value)
                }
              />

              <label>Ended On Page</label>
              <input
                type="number"
                min="0"
                max={item.bookInfo.totalPages || undefined}
                value={draft.endPage ?? log.endPage ?? 0}
                onChange={(event) =>
                  stageReadingLogEdit(item.id, log.id, "endPage", event.target.value)
                }
              />

              <label>Minutes Read</label>
              <input
                type="number"
                min="0"
                value={draft.minutesRead ?? log.minutesRead ?? ""}
                onChange={(event) =>
                  stageReadingLogEdit(item.id, log.id, "minutesRead", event.target.value)
                }
              />

              <label>Notes</label>
              <textarea
                value={draft.notes ?? log.notes ?? ""}
                onChange={(event) =>
                  stageReadingLogEdit(item.id, log.id, "notes", event.target.value)
                }
              />

              <p>
                {formatDateKey(draft.date ?? log.date)} •{" "}
                {draft.pagesRead ?? log.pagesRead ?? 0} pages
                {(draft.minutesRead ?? log.minutesRead)
                  ? ` • ${draft.minutesRead ?? log.minutesRead} minutes`
                  : ""}
              </p>

              {hasUnsavedEdits && (
                <button onClick={() => saveReadingLogEdits(item.id, log.id)}>
                  Save Edits
                </button>
              )}

              <button onClick={() => deleteReadingLog(item.id, log.id)}>
                Delete Log
              </button>
            </div>
          )
        })}
      </div>

      <button onClick={() => setStep("currentlyReading")}>
        Back to Currently Reading
      </button>
      <button onClick={() => setStep("home")}>Back Home</button>
    </section>
  )
}

export default ReadingLogPage