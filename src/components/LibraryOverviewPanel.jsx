function LibraryOverviewPanel({
  analyticsTab,
  savedReviews,
  totalBooks,
  finishedReviews,
  yearToDateCount,
  currentlyReadingReviews,
  dnfReviews,
  brainChemistryCount,
}) {
  if (savedReviews.length === 0) return null

  return (
    <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
      <p>📚 Library Snapshot</p>
      <p>Books Saved: {totalBooks}</p>
      <p>Finished Reviews: {finishedReviews.length}</p>
      <p>Finished This Year: {yearToDateCount}</p>
      <p>Currently Reading: {currentlyReadingReviews.length}</p>
      <p>DNFs: {dnfReviews.length}</p>
      <p>Brain Chemistry Reads: {brainChemistryCount}</p>
    </div>
  )
}

export default LibraryOverviewPanel