function ReviewAveragesPanel({
  analyticsTab,
  finishedReviews,
  averageRating,
  averageSpice,
  averageObsession,
  mostReadTrope,
  mostReadAuthor,
}) {
  if (finishedReviews.length === 0) return null

  return (
    <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
      <p>⭐ Review Averages</p>
      <p>Average Rating: {averageRating}/5</p>
      <p>Average Spice: {averageSpice}/5</p>
      <p>Average Obsession: {averageObsession}/5</p>

      {mostReadTrope && (
        <p>Most Read Trope: {mostReadTrope[0]} ({mostReadTrope[1]})</p>
      )}

      {mostReadAuthor && (
        <p>Most Read Author: {mostReadAuthor[0]} ({mostReadAuthor[1]})</p>
      )}
    </div>
  )
}

export default ReviewAveragesPanel