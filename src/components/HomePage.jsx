import Auth from "../Auth"

function HomePage({
  user,
  loadUser,
  migrateLocalReviewsToCloud,
  migrateEmbeddedReadingLogsToCloud,
  embeddedReadingLogCount,
  openAddBookMenu,
  setStep,
  savedReviews,
  readingStreakStats,
  currentlyReadingReviews,
}) {
  return (
    <section>
      <Auth user={user} onAuthChange={loadUser} />

      {user && localStorage.getItem("brainChemistryBooksReviews") && (
        <div className="score-card">
          <p>Found reviews saved on this browser.</p>
          <button onClick={migrateLocalReviewsToCloud}>
            Move Local Reviews to My Account
          </button>
        </div>
      )}

      {user && embeddedReadingLogCount > 0 && (
        <div className="score-card">
          <p>
            Found {embeddedReadingLogCount} reading log
            {embeddedReadingLogCount === 1 ? "" : "s"} saved inside book records.
          </p>
          <button onClick={migrateEmbeddedReadingLogsToCloud}>
            Move Reading Logs to Supabase Table
          </button>
        </div>
      )}

      <p>Read • Rate • Romanticize</p>
      <h1>Pressed Pages</h1>

      <p>
        A cozy reading scrapbook for tracking your reviews, ratings, spice,
        tropes, reading goals, and the books worth pressing between the pages.
      </p>

      <button onClick={openAddBookMenu}>Add Book</button>
      <button onClick={() => setStep("currentlyReading")}>Currently Reading</button>
      <button onClick={() => setStep("library")}>View Library</button>
      <button onClick={() => setStep("analytics")}>Reading Analytics</button>
      <button onClick={() => setStep("activityFeed")}>Activity Feed</button>
      <button onClick={() => setStep("communityChallenges")}>
        Community Challenges
      </button>
      <button onClick={() => setStep("profile")}>Reader Profile</button>
      <button onClick={() => setStep("findReaders")}>Find Readers</button>

      {savedReviews.length > 0 && (
        <div className="score-card">
          <p>Quick Stats</p>
          <p>🔥 Current Reading Streak: {readingStreakStats.currentStreak} days</p>
          <p>📖 Currently Reading: {currentlyReadingReviews.length}</p>
          <p>🏆 Longest Reading Streak: {readingStreakStats.longestStreak} days</p>
        </div>
      )}

      {savedReviews.length > 0 && (
        <div className="score-card">
          <p>Recently Saved</p>

          {savedReviews.slice(0, 3).map((item) => (
            <p key={item.id}>
              <strong>{item.bookInfo.title || "Untitled Book"}</strong>
              <br />
              {item.bookInfo.status === "DNF"
                ? `🚫 DNF at ${item.dnfInfo?.percent || "?"}%`
                : `${item.isFavorite ? "🧠 " : ""}${
                    item.bookInfo.author || "Unknown Author"
                  } • ⭐ ${item.bookScore}/5 • ❤️ ${item.obsessionScore}/5`}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}

export default HomePage