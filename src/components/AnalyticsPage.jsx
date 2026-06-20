import ReadingHeatMap from "./ReadingHeatMap"
import ReadingGoalsPanel from "./ReadingGoalsPanel"
import AchievementsPanel from "./AchievementsPanel"
import ReadingCalendarPanel from "./ReadingCalendarPanel"
import MonthlyWrapUpPanel from "./MonthlyWrapUpPanel"
import YearInBooksPanel from "./YearInBooksPanel"
import LibraryOverviewPanel from "./LibraryOverviewPanel"
import ReviewAveragesPanel from "./ReviewAveragesPanel"

function AnalyticsPage({
  saveMessage,
  analyticsTab,
  setAnalyticsTab,
  readingGoals,
  readingGoalStats,
  updateReadingGoal,
  achievementStats,
  downloadAchievementGraphicPng,
  readingCalendarStats,
  selectedCalendarDate,
  setSelectedCalendarDate,
  shiftCalendarMonth,
  formatDateKey,
  monthlyWrapUpStats,
  wrapUpMonthKey,
  setWrapUpMonthKey,
  wrapUpMonthOptions,
  getMonthlyWrapUpGraphicDataUrl,
  downloadMonthlyWrapUpGraphicPng,
  downloadMonthlyWrapUpGraphicSvg,
  yearInBooksStats,
  yearInBooksKey,
  setYearInBooksKey,
  yearInBooksOptions,
  getYearInBooksGraphicDataUrl,
  downloadYearInBooksGraphicPng,
  downloadYearInBooksGraphicSvg,
  savedReviews,
  totalBooks,
  finishedReviews,
  yearToDateCount,
  currentlyReadingReviews,
  dnfReviews,
  brainChemistryCount,
  averageRating,
  averageSpice,
  averageObsession,
  mostReadTrope,
  mostReadAuthor,
  readingStreakStats,
  readingAnalyticsStats,
  getReadingHeatMapStats,
  setStep,
}) {
  return (
    <section>
      <p>Reading Analytics</p>
      <h1>Your reading data dashboard.</h1>
      <p>Built from your reading log entries, finished dates, pages, minutes, and notes.</p>

      {saveMessage && <p>{saveMessage}</p>}

      <div className="analytics-tabs" aria-label="Reading analytics sections">
        <button type="button" className={analyticsTab === "overview" ? "active" : ""} onClick={() => setAnalyticsTab("overview")}>Overview</button>
        <button type="button" className={analyticsTab === "goals" ? "active" : ""} onClick={() => setAnalyticsTab("goals")}>Reading Goals</button>
        <button type="button" className={analyticsTab === "achievements" ? "active" : ""} onClick={() => setAnalyticsTab("achievements")}>Achievements</button>
        <button type="button" className={analyticsTab === "calendar" ? "active" : ""} onClick={() => setAnalyticsTab("calendar")}>Reading Calendar</button>
        <button type="button" className={analyticsTab === "wrapUps" ? "active" : ""} onClick={() => setAnalyticsTab("wrapUps")}>Wrap-Ups</button>
        <button type="button" className={analyticsTab === "yearInBooks" ? "active" : ""} onClick={() => setAnalyticsTab("yearInBooks")}>Year In Books</button>
      </div>

      <ReadingGoalsPanel
        analyticsTab={analyticsTab}
        readingGoals={readingGoals}
        readingGoalStats={readingGoalStats}
        updateReadingGoal={updateReadingGoal}
      />

      <AchievementsPanel
        analyticsTab={analyticsTab}
        achievementStats={achievementStats}
        downloadAchievementGraphicPng={downloadAchievementGraphicPng}
      />

      <ReadingCalendarPanel
        analyticsTab={analyticsTab}
        readingCalendarStats={readingCalendarStats}
        selectedCalendarDate={selectedCalendarDate}
        setSelectedCalendarDate={setSelectedCalendarDate}
        shiftCalendarMonth={shiftCalendarMonth}
        formatDateKey={formatDateKey}
      />

      <MonthlyWrapUpPanel
        analyticsTab={analyticsTab}
        monthlyWrapUpStats={monthlyWrapUpStats}
        wrapUpMonthKey={wrapUpMonthKey}
        setWrapUpMonthKey={setWrapUpMonthKey}
        wrapUpMonthOptions={wrapUpMonthOptions}
        getMonthlyWrapUpGraphicDataUrl={getMonthlyWrapUpGraphicDataUrl}
        downloadMonthlyWrapUpGraphicPng={downloadMonthlyWrapUpGraphicPng}
        downloadMonthlyWrapUpGraphicSvg={downloadMonthlyWrapUpGraphicSvg}
      />

      <YearInBooksPanel
        analyticsTab={analyticsTab}
        yearInBooksStats={yearInBooksStats}
        yearInBooksKey={yearInBooksKey}
        setYearInBooksKey={setYearInBooksKey}
        yearInBooksOptions={yearInBooksOptions}
        getYearInBooksGraphicDataUrl={getYearInBooksGraphicDataUrl}
        downloadYearInBooksGraphicPng={downloadYearInBooksGraphicPng}
        downloadYearInBooksGraphicSvg={downloadYearInBooksGraphicSvg}
      />

      <LibraryOverviewPanel
        analyticsTab={analyticsTab}
        savedReviews={savedReviews}
        totalBooks={totalBooks}
        finishedReviews={finishedReviews}
        yearToDateCount={yearToDateCount}
        currentlyReadingReviews={currentlyReadingReviews}
        dnfReviews={dnfReviews}
        brainChemistryCount={brainChemistryCount}
      />

      <ReviewAveragesPanel
        analyticsTab={analyticsTab}
        finishedReviews={finishedReviews}
        averageRating={averageRating}
        averageSpice={averageSpice}
        averageObsession={averageObsession}
        mostReadTrope={mostReadTrope}
        mostReadAuthor={mostReadAuthor}
      />

      <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
        <p>🔥 Reading Activity</p>
        <p>Current Streak: {readingStreakStats.currentStreak} days</p>
        <p>Longest Streak: {readingStreakStats.longestStreak} days</p>
        <p>Reading Days This Month: {readingAnalyticsStats.readingDaysThisMonth}</p>
        <p>Reading Days This Year: {readingAnalyticsStats.readingDaysThisYear}</p>
        <p>Total Reading Sessions: {readingAnalyticsStats.totalSessions}</p>
        {readingStreakStats.lastLoggedDate && (
          <p>Last Reading Day: {formatDateKey(readingStreakStats.lastLoggedDate)}</p>
        )}
      </div>

      <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
        <p>🌸 Pressed Petals</p>
        <p>A bloom for every day you spent reading.</p>
        <ReadingHeatMap
          heatMapStats={getReadingHeatMapStats(180)}
          formatDateKey={formatDateKey}
        />
      </div>

      <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
        <p>📄 Pages</p>
        <p>Pages Read This Month: {readingAnalyticsStats.pagesThisMonth}</p>
        <p>Pages Read This Year: {readingAnalyticsStats.pagesThisYear}</p>
        <p>Total Pages Logged: {readingAnalyticsStats.totalPages}</p>
        <p>Average Pages Per Reading Day: {readingAnalyticsStats.averagePagesPerReadingDay}</p>
        {readingAnalyticsStats.biggestReadingDay && (
          <p>
            Biggest Reading Day: {readingAnalyticsStats.biggestReadingDay.pages} pages on{" "}
            {formatDateKey(readingAnalyticsStats.biggestReadingDay.date)}
          </p>
        )}
      </div>

      <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
        <p>⏱️ Time</p>
        <p>Minutes Read This Month: {readingAnalyticsStats.minutesThisMonth}</p>
        <p>Minutes Read This Year: {readingAnalyticsStats.minutesThisYear}</p>
        <p>Total Hours Read: {readingAnalyticsStats.totalHours}</p>
        <p>Average Session Length: {readingAnalyticsStats.averageSessionLength} minutes</p>
        <p>Estimated Pace: {readingAnalyticsStats.pagesPerHour} pages/hour</p>
      </div>

      <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
        <p>✅ Finished Book Stats</p>
        <p>Books Finished This Month: {readingAnalyticsStats.finishedThisMonth}</p>
        <p>Books Finished This Year: {readingAnalyticsStats.finishedThisYear}</p>
        <p>Average Days to Finish: {readingAnalyticsStats.averageDaysToFinish}</p>

        {readingAnalyticsStats.fastestRead && (
          <p>
            Fastest Read: {readingAnalyticsStats.fastestRead.item.bookInfo.title || "Untitled Book"} •{" "}
            {readingAnalyticsStats.fastestRead.days} day
            {readingAnalyticsStats.fastestRead.days === 1 ? "" : "s"}
          </p>
        )}

        {readingAnalyticsStats.slowestRead && (
          <p>
            Slowest Read: {readingAnalyticsStats.slowestRead.item.bookInfo.title || "Untitled Book"} •{" "}
            {readingAnalyticsStats.slowestRead.days} day
            {readingAnalyticsStats.slowestRead.days === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <button onClick={() => setStep("home")}>Back Home</button>
      <button onClick={() => setStep("currentlyReading")}>Currently Reading</button>
    </section>
  )
}

export default AnalyticsPage