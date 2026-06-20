import ProgressBar from "./ProgressBar"

function ReadingGoalsPanel({
  analyticsTab,
  readingGoals,
  readingGoalStats,
  updateReadingGoal,
}) {
  return (
    <div className={`score-card ${analyticsTab === "goals" ? "" : "analytics-panel-hidden"}`}>
      <p>🎯 Reading Goals for {readingGoalStats.currentYearKey}</p>

      <div className="review-field">
        <label>Books Goal</label>
        <input
          type="number"
          min="0"
          value={readingGoals.books}
          onChange={(e) => updateReadingGoal("books", e.target.value)}
          placeholder="Example: 75"
        />
      </div>

      <p>{readingGoalStats.booksFinishedThisYear} / {readingGoals.books || 0} books finished</p>
      <ProgressBar percent={readingGoalStats.booksPercent} />

      <div className="review-field">
        <label>Pages Goal</label>
        <input
          type="number"
          min="0"
          value={readingGoals.pages}
          onChange={(e) => updateReadingGoal("pages", e.target.value)}
          placeholder="Example: 20000"
        />
      </div>

      <p>{readingGoalStats.pagesThisYear} / {readingGoals.pages || 0} pages read</p>
      <ProgressBar percent={readingGoalStats.pagesPercent} />

      <div className="review-field">
        <label>Reading Days Goal</label>
        <input
          type="number"
          min="0"
          value={readingGoals.readingDays}
          onChange={(e) => updateReadingGoal("readingDays", e.target.value)}
          placeholder="Example: 200"
        />
      </div>

      <p>{readingGoalStats.readingDaysThisYear} / {readingGoals.readingDays || 0} reading days</p>
      <ProgressBar percent={readingGoalStats.readingDaysPercent} />

      <div className="review-field">
        <label>Minutes Goal</label>
        <input
          type="number"
          min="0"
          value={readingGoals.minutes}
          onChange={(e) => updateReadingGoal("minutes", e.target.value)}
          placeholder="Example: 6000"
        />
      </div>

      <p>
        {readingGoalStats.minutesThisYear} / {readingGoals.minutes || 0} minutes read
        ({readingGoalStats.hoursThisYear} hours)
      </p>

      <ProgressBar percent={readingGoalStats.minutesPercent} />
    </div>
  )
}

export default ReadingGoalsPanel