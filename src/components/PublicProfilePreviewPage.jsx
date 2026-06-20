import ReaderCard from "./ReaderCard"
import ReaderShelves from "./ReaderShelves"
import ReadingHeatMap from "./ReadingHeatMap"

function PublicProfilePreviewPage({
  cleanProfileUsername,
  profile,
  profileDisplayName,
  profileReadingAesthetic,
  profileReaderType,
  profileFavoriteSubgenre,
  yearToDateCount,
  followStats,
  readingStreakStats,
  averageRating,
  savedReviews,
  profilePreviewShelf,
  setProfilePreviewShelf,
  openSavedReview,
  getReadingHeatMapStats,
  formatDateKey,
  recentFinishedReads,
  achievementStats,
  setStep,
}) {
  return (
    <section>
      <p>Public Profile Preview</p>
      <h1>@{cleanProfileUsername}</h1>
      <p>This is the shareable version of your reader scrapbook.</p>

      {profile.isPublicProfile ? (
        <>
          <ReaderCard
            reader={{
              username: cleanProfileUsername,
              displayName: profileDisplayName,
              avatarUrl: profile.avatarUrl,
              profileData: {
                ...profile,
                readingAesthetic: profileReadingAesthetic,
                readerType: profileReaderType,
                favoriteSubgenre: profileFavoriteSubgenre,
              },
            }}
            stats={{ booksThisYear: yearToDateCount }}
            followStats={followStats}
          />

          <div className="profile-stats-grid">
            <div className="score-card">
              <p>📚 Books This Year</p>
              <h2>{yearToDateCount}</h2>
            </div>

            <div className="score-card">
              <p>🔥 Current Streak</p>
              <h2>{readingStreakStats.currentStreak}</h2>
              <p>day{readingStreakStats.currentStreak === 1 ? "" : "s"}</p>
            </div>

            <div className="score-card">
              <p>🏆 Longest Streak</p>
              <h2>{readingStreakStats.longestStreak}</h2>
              <p>day{readingStreakStats.longestStreak === 1 ? "" : "s"}</p>
            </div>

            <div className="score-card">
              <p>⭐ Average Rating</p>
              <h2>{averageRating}</h2>
              <p>out of 5</p>
            </div>
          </div>

          <ReaderShelves
            books={savedReviews}
            activeShelf={profilePreviewShelf}
            onShelfChange={setProfilePreviewShelf}
            emptyName="you"
            onOpenBook={openSavedReview}
          />

          <div className="score-card">
            <p>🌸 Pressed Petals</p>
            <p>A bloom for every day spent reading.</p>
            <ReadingHeatMap
              heatMapStats={getReadingHeatMapStats(90)}
              compact
              formatDateKey={formatDateKey}
            />
          </div>

          <div className="score-card profile-recent-card">
            <p>Recently Finished</p>

            {recentFinishedReads.length ? (
              <div className="profile-recent-grid">
                {recentFinishedReads.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="profile-recent-book"
                    onClick={() => openSavedReview(item)}
                    aria-label={`Open ${item.bookInfo.title || "book"} review`}
                    title={`${item.bookInfo.title || "Untitled Book"} by ${
                      item.bookInfo.author || "Unknown Author"
                    }`}
                  >
                    {item.bookInfo.coverUrl && (
                      <img src={item.bookInfo.coverUrl} alt={`${item.bookInfo.title} cover`} />
                    )}
                    <strong>{item.bookInfo.title || "Untitled Book"}</strong>
                    <p>{item.bookInfo.author || "Unknown Author"}</p>
                    <p>⭐ {item.bookScore}/5</p>
                  </button>
                ))}
              </div>
            ) : (
              <p>No recent finished books yet.</p>
            )}
          </div>

          <div className="score-card">
            <p>Achievement Showcase</p>
            <p>Unlocked Achievements: {achievementStats.unlocked} / {achievementStats.total}</p>
          </div>
        </>
      ) : (
        <div className="score-card">
          <p>🔒 This profile is private.</p>
          <p>Turn on public sharing in Edit Profile to preview the public version.</p>
        </div>
      )}

      <button type="button" onClick={() => setStep("profile")}>
        Back to Profile
      </button>
    </section>
  )
}

export default PublicProfilePreviewPage