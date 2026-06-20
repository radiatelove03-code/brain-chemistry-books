function MonthlyWrapUpPanel({
  analyticsTab,
  monthlyWrapUpStats,
  wrapUpMonthKey,
  setWrapUpMonthKey,
  wrapUpMonthOptions,
  getMonthlyWrapUpGraphicDataUrl,
  downloadMonthlyWrapUpGraphicPng,
  downloadMonthlyWrapUpGraphicSvg,
}) {
  return (
    <div className={`score-card ${analyticsTab === "wrapUps" ? "" : "analytics-panel-hidden"}`}>
      <p>🌙 Monthly Wrap-Up</p>
      <h2>{monthlyWrapUpStats.monthLabel}</h2>

      <div className="review-field">
        <label>Choose Month</label>
        <select
          value={wrapUpMonthKey}
          onChange={(e) => setWrapUpMonthKey(e.target.value)}
        >
          {wrapUpMonthOptions.map((monthKey) => {
            const [yearPart, monthPart] = monthKey.split("-")
            const monthDate = new Date(Number(yearPart), Number(monthPart) - 1, 1)
            const monthLabel = monthDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })

            return (
              <option key={monthKey} value={monthKey}>
                {monthLabel}
              </option>
            )
          })}
        </select>
      </div>

      {monthlyWrapUpStats.booksFinished > 0 ? (
        <>
          <div className="wrapup-graphic-panel">
            <img
              className="wrapup-graphic-preview"
              src={getMonthlyWrapUpGraphicDataUrl(monthlyWrapUpStats)}
              alt={`${monthlyWrapUpStats.monthLabel} Pressed Pages wrap-up graphic preview`}
            />
            <div className="wrapup-graphic-actions">
              <button onClick={() => downloadMonthlyWrapUpGraphicPng(monthlyWrapUpStats)}>
                🎨 Download Wrap-Up PNG
              </button>
              <button onClick={() => downloadMonthlyWrapUpGraphicSvg(monthlyWrapUpStats)}>
                Save SVG Backup
              </button>
            </div>
          </div>

          <p>Books Finished: {monthlyWrapUpStats.booksFinished}</p>
          <p>Average Rating: {monthlyWrapUpStats.averageRating}/5</p>
          <p>Average Spice: {monthlyWrapUpStats.averageSpice}/5</p>
          <p>Average Obsession: {monthlyWrapUpStats.averageObsession}/5</p>
          <p>Reading Days Logged: {monthlyWrapUpStats.readingDays}</p>
          <p>Pages Logged: {monthlyWrapUpStats.pagesLogged}</p>

          {monthlyWrapUpStats.minutesLogged > 0 && (
            <p>
              Time Logged: {monthlyWrapUpStats.minutesLogged} minutes ({monthlyWrapUpStats.hoursLogged} hours)
            </p>
          )}

          {monthlyWrapUpStats.topTrope && (
            <p>
              Favorite Trope: {monthlyWrapUpStats.topTrope[0]} ({monthlyWrapUpStats.topTrope[1]})
            </p>
          )}

          {monthlyWrapUpStats.topAuthor && (
            <p>
              Most Read Author: {monthlyWrapUpStats.topAuthor[0]} ({monthlyWrapUpStats.topAuthor[1]})
            </p>
          )}

          {monthlyWrapUpStats.highestRated && (
            <p>
              Highest Rated: {monthlyWrapUpStats.highestRated.bookInfo.title || "Untitled Book"} •{" "}
              {monthlyWrapUpStats.highestRated.bookScore}/5
            </p>
          )}

          {monthlyWrapUpStats.fastestRead && (
            <p>
              Fastest Read: {monthlyWrapUpStats.fastestRead.item.bookInfo.title || "Untitled Book"} •{" "}
              {monthlyWrapUpStats.fastestRead.days} day{monthlyWrapUpStats.fastestRead.days === 1 ? "" : "s"}
            </p>
          )}

          {monthlyWrapUpStats.slowestRead && (
            <p>
              Slowest Read: {monthlyWrapUpStats.slowestRead.item.bookInfo.title || "Untitled Book"} •{" "}
              {monthlyWrapUpStats.slowestRead.days} day{monthlyWrapUpStats.slowestRead.days === 1 ? "" : "s"}
            </p>
          )}

          {monthlyWrapUpStats.favoriteReads.length > 0 && (
            <p>
              Brain Chemistry Reads:{" "}
              {monthlyWrapUpStats.favoriteReads
                .map((item) => item.bookInfo.title || "Untitled Book")
                .join(", ")}
            </p>
          )}

          <div style={{ marginTop: "1rem" }}>
            <h3>Finished Shelf</h3>
            {monthlyWrapUpStats.books.map((item) => (
              <p key={item.id}>
                <strong>{item.bookInfo.title || "Untitled Book"}</strong>
                {item.bookInfo.author ? ` by ${item.bookInfo.author}` : ""} • {item.bookScore}/5
                {item.metrics?.spice ? ` • 🌶️ ${item.metrics.spice}/5` : ""}
              </p>
            ))}
          </div>
        </>
      ) : (
        <p>No books finished in this month yet.</p>
      )}
    </div>
  )
}

export default MonthlyWrapUpPanel