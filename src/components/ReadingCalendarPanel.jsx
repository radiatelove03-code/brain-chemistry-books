function ReadingCalendarPanel({
  analyticsTab,
  readingCalendarStats,
  selectedCalendarDate,
  setSelectedCalendarDate,
  shiftCalendarMonth,
  formatDateKey,
}) {
  return (
    <div className={`score-card ${analyticsTab === "calendar" ? "" : "analytics-panel-hidden"}`}>
      <p>📅 Reading Calendar</p>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => shiftCalendarMonth(-1)}>← Previous Month</button>
        <h2 style={{ margin: 0 }}>{readingCalendarStats.monthLabel}</h2>
        <button onClick={() => shiftCalendarMonth(1)}>Next Month →</button>
      </div>

      <p>
        {readingCalendarStats.totalDaysRead} reading day
        {readingCalendarStats.totalDaysRead === 1 ? "" : "s"} •{" "}
        {readingCalendarStats.totalPages} pages
        {readingCalendarStats.totalMinutes
          ? ` • ${readingCalendarStats.totalHours} hours`
          : ""}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: "0.35rem",
          marginTop: "1rem",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
          <strong key={dayName} style={{ textAlign: "center", fontSize: "0.8rem" }}>
            {dayName}
          </strong>
        ))}

        {readingCalendarStats.calendarDays.map((day, index) =>
          day ? (
            <button
              key={day.date}
              onClick={() => setSelectedCalendarDate(day.date)}
              style={{
                minHeight: "4.5rem",
                padding: "0.4rem",
                border:
                  selectedCalendarDate === day.date
                    ? "2px solid #2f2420"
                    : "1px solid rgba(47, 36, 32, 0.2)",
                borderRadius: "0.75rem",
                background: day.sessions
                  ? "rgba(166, 84, 52, 0.16)"
                  : "rgba(255, 255, 255, 0.45)",
                color: "#2f2420",
                textAlign: "left",
              }}
            >
              <strong>{day.day}</strong>

              {day.sessions > 0 && (
                <>
                  <br />
                  <span>{day.pages} pg</span>
                  <br />
                  <span>
                    {day.sessions} log{day.sessions === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </button>
          ) : (
            <div key={`blank-${index}`} />
          )
        )}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <p>
          <strong>
            {selectedCalendarDate
              ? formatDateKey(selectedCalendarDate)
              : "Select a day"}
          </strong>
        </p>

        {readingCalendarStats.selectedDay?.logs?.length ? (
          readingCalendarStats.selectedDay.logs.map((log) => (
            <div key={log.id} style={{ marginBottom: "0.75rem" }}>
              <p>
                <strong>{log.title}</strong>
                <br />
                {log.pagesRead || 0} pages
                {log.endPage ? ` • ended on page ${log.endPage}` : ""}
                {log.minutesRead ? ` • ${log.minutesRead} minutes` : ""}
              </p>

              {log.notes && <p>📝 {log.notes}</p>}
            </div>
          ))
        ) : (
          <p>No reading logged for this day.</p>
        )}
      </div>
    </div>
  )
}

export default ReadingCalendarPanel