function AddBookPage({
  startNewReview,
  resetForm,
  setBookInfo,
  startAlreadyReadBook,
  setSaveMessage,
  setStep,
}) {
  return (
    <section>
      <p>Library Management</p>
      <h1>Add Book</h1>

      <p>
        Choose the kind of book entry you want to add. Full reviews are still
        here, but backlog books can be added without filling out every rating.
      </p>

      <div className="add-book-choice-grid">
        <button
          type="button"
          className="add-book-choice-card"
          onClick={startNewReview}
        >
          <span>📝</span>
          <strong>Full Review</strong>
          <p>
            Rate the book, track spice, tropes, notes, graphics, and all the
            scrapbook details.
          </p>
        </button>

        <button
          type="button"
          className="add-book-choice-card"
          onClick={() => {
            resetForm()

            setBookInfo((currentInfo) => ({
              ...currentInfo,
              status: "Reading",
              dateStarted: currentInfo.dateStarted || new Date().toISOString(),
            }))

            setStep(0)
          }}
        >
          <span>📖</span>
          <strong>Currently Reading</strong>
          <p>
            Add a book to your active reading shelf and start tracking page
            progress.
          </p>
        </button>

        <button
          type="button"
          className="add-book-choice-card"
          onClick={startAlreadyReadBook}
        >
          <span>📚</span>
          <strong>Already Read</strong>
          <p>Quick-add one finished book without writing a full review.</p>
        </button>

        <button
          type="button"
          className="add-book-choice-card"
          onClick={() => {
            setSaveMessage("")
            setStep("backlogImport")
          }}
        >
          <span>📦</span>
          <strong>Import Multiple</strong>
          <p>Batch-add older reads to fill your finished shelf faster.</p>
        </button>
      </div>
    </section>
  )
}

export default AddBookPage