import ReaderCard from "./ReaderCard"
import ReaderShelves from "./ReaderShelves"

function PublicProfileViewPage({
  publicProfileView,
  publicProfileLoading,
  publicProfileMessage,
  user,
  followStats,
  toggleFollowPublicProfile,
  publicProfileBooks,
  publicProfileShelf,
  setPublicProfileShelf,
  openSavedReview,
  setStep,
}) {
  return (
    <section>
      <p>Public Reader Profile</p>
      <h1>{publicProfileView ? `@${publicProfileView.username}` : "Reader profile"}</h1>

      {publicProfileLoading && <p>Loading public profile...</p>}
      {publicProfileMessage && <p>{publicProfileMessage}</p>}

      {publicProfileView ? (
        <>
          <ReaderCard
            reader={publicProfileView}
            stats={publicProfileView.statsData || {}}
            followStats={followStats}
            actionLabel={
              user && publicProfileView.userId !== user.id
                ? followStats.isFollowing
                  ? "Following ✓"
                  : "Follow Reader"
                : ""
            }
            onAction={
              user && publicProfileView.userId !== user.id
                ? toggleFollowPublicProfile
                : null
            }
          />

          {!user && <p>Log in to follow @{publicProfileView.username}.</p>}

          <div className="profile-stats-grid">
            <div className="score-card">
              <p>📚 Books This Year</p>
              <h2>{publicProfileView.statsData?.booksThisYear || 0}</h2>
            </div>

            <div className="score-card">
              <p>🔥 Current Streak</p>
              <h2>{publicProfileView.statsData?.currentStreak || 0}</h2>
              <p>day{publicProfileView.statsData?.currentStreak === 1 ? "" : "s"}</p>
            </div>

            <div className="score-card">
              <p>🏆 Longest Streak</p>
              <h2>{publicProfileView.statsData?.longestStreak || 0}</h2>
              <p>day{publicProfileView.statsData?.longestStreak === 1 ? "" : "s"}</p>
            </div>

            <div className="score-card">
              <p>⭐ Average Rating</p>
              <h2>{publicProfileView.statsData?.averageRating || "0.0"}</h2>
              <p>out of 5</p>
            </div>
          </div>

          <ReaderShelves
            books={publicProfileBooks}
            activeShelf={publicProfileShelf}
            onShelfChange={setPublicProfileShelf}
            emptyName={`@${publicProfileView.username}`}
            onOpenBook={openSavedReview}
          />

          <button type="button" onClick={() => setStep("home")}>
            Back Home
          </button>
        </>
      ) : (
        !publicProfileLoading && (
          <div className="score-card">
            <p>🔒 No public profile loaded.</p>
            <p>This reader may have turned their profile private.</p>
            <button type="button" onClick={() => setStep("home")}>
              Back Home
            </button>
          </div>
        )
      )}
    </section>
  )
}

export default PublicProfileViewPage