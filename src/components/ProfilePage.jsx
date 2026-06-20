import ReaderCard from "./ReaderCard"
import ReadingHeatMap from "./ReadingHeatMap"

function ProfilePage({
  profile,
  profileSavedMessage,
  cleanProfileUsername,
  profileDisplayName,
  profileReadingAesthetic,
  profileReaderType,
  profileFavoriteSubgenre,
  profileFavoriteGenre,
  profileFavoriteTrope,
  profileFavoriteVibe,
  followStats,
  yearToDateCount,
  publicProfileUrl,
  copyPublicProfileLink,
  readingStreakStats,
  averageRating,
  averageSpice,
  readingAnalyticsStats,
  getReadingHeatMapStats,
  formatDateKey,
  recentFinishedReads,
  openSavedReview,
  formatDate,
  achievementStats,
  setStep,
}) {
  return (
    <section>
      <p>Pressed Pages Profile</p>
      <h1>Your reader scrapbook.</h1>
      <p>
        {profile.isPublicProfile
          ? "Public profile is enabled — your reader scrapbook is ready to share."
          : "Private by default — turn on public sharing when you want a profile link."}
      </p>

      {profileSavedMessage && <p>{profileSavedMessage}</p>}

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
        isOwnReader
        actionLabel="Edit Profile"
        onAction={() => setStep("editProfile")}
      />

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={`${profileDisplayName} avatar`} />
            ) : (
              <span>📚</span>
            )}
          </div>

          <div>
            <p>Read • Rate • Romanticize</p>
            <h2>{profileDisplayName}</h2>
            <p>@{cleanProfileUsername}</p>

            <div className="follow-count-row">
              <span>
                <strong>{followStats.followers}</strong> follower
                {followStats.followers === 1 ? "" : "s"}
              </span>
              <span>
                <strong>{followStats.following}</strong> following
              </span>
            </div>

            <p>{profile.bio || "Add a little reader bio to make this page feel like yours."}</p>
          </div>
        </div>

        <div className="profile-banner">
          <p>Reader Flair</p>
          <div className="profile-flair-row">
            <span>{profileReadingAesthetic}</span>
            <span>{profileReaderType}</span>
            <span>{profileFavoriteSubgenre}</span>
          </div>
        </div>

        <div className="profile-favorites-grid">
          <div>
            <strong>Favorite Genre</strong>
            <p>{profileFavoriteGenre}</p>
          </div>
          <div>
            <strong>Favorite Trope</strong>
            <p>{profileFavoriteTrope}</p>
          </div>
          <div>
            <strong>Favorite Reading Vibe</strong>
            <p>{profileFavoriteVibe}</p>
          </div>
        </div>
      </div>

      <div className="profile-public-card">
        <p>Public Profile</p>
        <h3>{profile.isPublicProfile ? "🌎 Public profile enabled" : "🔒 Profile is private"}</h3>
        <p>
          {profile.isPublicProfile
            ? "Share a reader-safe version of this page with your profile link."
            : "Your profile stays private until you turn public sharing on in Edit Profile."}
        </p>

        {profile.isPublicProfile && (
          <>
            <input readOnly value={publicProfileUrl} aria-label="Public profile link" />
            <button type="button" onClick={copyPublicProfileLink}>
              Copy Profile Link
            </button>
            <button type="button" onClick={() => setStep("publicProfilePreview")}>
              Preview Public Profile
            </button>
          </>
        )}
      </div>

      <button onClick={() => setStep("editProfile")}>Edit Profile</button>

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
        <div className="score-card">
          <p>🌶️ Average Spice</p>
          <h2>{averageSpice}</h2>
          <p>out of 5</p>
        </div>
        <div className="score-card">
          <p>📖 Reading Days</p>
          <h2>{readingAnalyticsStats.readingDaysThisYear}</h2>
          <p>this year</p>
        </div>
      </div>

      <div className="score-card">
        <p>🌸 Pressed Petals</p>
        <p>A bloom for every day you spent reading.</p>
        <ReadingHeatMap
          heatMapStats={getReadingHeatMapStats(90)}
          compact
          formatDateKey={formatDateKey}
        />
      </div>

      <div className="score-card profile-recent-card">
        <p>Recently Finished Shelf</p>

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
                <p>⭐ {item.bookScore}/5 • 🌶️ {item.metrics?.spice || 0}/5</p>
                {item.bookInfo.dateFinished && (
                  <p>Finished {formatDate(item.bookInfo.dateFinished)}</p>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p>No finished books yet. Finish a book to start building your shelf.</p>
        )}
      </div>

      <div className="score-card">
        <p>Achievement Showcase</p>
        <p>Unlocked Achievements: {achievementStats.unlocked} / {achievementStats.total}</p>
        {achievementStats.nextAchievement ? (
          <p>
            Next Up: {achievementStats.nextAchievement.icon}{" "}
            {achievementStats.nextAchievement.name}
          </p>
        ) : (
          <p>Every achievement is unlocked. Icon behavior.</p>
        )}
      </div>

      <button onClick={() => setStep("home")}>Back Home</button>
    </section>
  )
}

export default ProfilePage