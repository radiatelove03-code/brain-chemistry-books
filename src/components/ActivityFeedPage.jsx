import ReaderCard from "./ReaderCard"

function ActivityFeedPage({
  user,
  activityFeedMessage,
  activityFeedLoading,
  activityFeed,
  loadActivityFeed,
  setStep,
  formatDate,
  getActivityIcon,
  getActivityLabel,
  toggleActivityLike,
}) {
  return (
    <section>
      <p>Friends & Following</p>
      <h1>Activity Feed</h1>
      <p>See recent reading updates from you and the readers you follow.</p>

      {activityFeedMessage && <p>{activityFeedMessage}</p>}

      <div className="activity-feed-actions">
        <button type="button" onClick={() => loadActivityFeed(user)}>
          Refresh Feed
        </button>
        <button type="button" onClick={() => setStep("profile")}>
          My Profile
        </button>
      </div>

      {!user && (
        <div className="score-card">
          <p>Log in to see your personalized reading feed.</p>
        </div>
      )}

      {user && activityFeedLoading && <p>Loading activity...</p>}

      {user && !activityFeedLoading && activityFeed.length === 0 && (
        <div className="score-card">
          <p>🌸 Your feed is quiet for now.</p>
          <p>Follow a public reader profile or save a book update to start filling this page.</p>
        </div>
      )}

      {user && !activityFeedLoading && activityFeed.length > 0 && (
        <div className="activity-feed-list">
          {activityFeed.map((event) => {
            const eventData = event.event_data || {}
            const reader = event.readerProfile || {}
            const profileData = reader.profile_data || {}
            const readerName =
              profileData.displayName ||
              reader.display_name ||
              reader.username ||
              (event.isOwnActivity ? "You" : "Pressed Pages Reader")
            const readerUsername = reader.username || "reader"
            const avatarUrl = profileData.avatarUrl || reader.avatar_url || ""

            return (
              <article key={event.id} className="activity-feed-card">
                <ReaderCard
                  reader={{
                    ...reader,
                    displayName: event.isOwnActivity ? "You" : readerName,
                    username: readerUsername,
                    avatarUrl,
                    profileData,
                  }}
                  stats={reader?.stats_data || reader?.statsData || {}}
                  isOwnReader={event.isOwnActivity}
                  compact
                  meta={formatDate(event.created_at)}
                />

                <div className="activity-feed-body">
                  <p className="activity-feed-type">
                    {getActivityIcon(event.event_type)} {getActivityLabel(event.event_type)}
                  </p>

                  <div className="activity-feed-book">
                    {eventData.coverUrl && (
                      <img src={eventData.coverUrl} alt={`${eventData.title} cover`} />
                    )}

                    <div>
                      <h3>{eventData.title || "Untitled Book"}</h3>
                      <p>{eventData.author || "Unknown Author"}</p>
                      <p>
                        {eventData.rating ? `⭐ ${eventData.rating}/5` : ""}
                        {eventData.spice ? ` • 🌶️ ${eventData.spice}/5` : ""}
                        {eventData.obsession ? ` • ❤️ ${eventData.obsession}/5` : ""}
                        {eventData.isFavorite ? " • 🧠 Brain chemistry" : ""}
                      </p>

                      {eventData.oneSentenceReview && <p>“{eventData.oneSentenceReview}”</p>}
                    </div>
                  </div>

                  <div className="activity-reaction-row">
                    <button
                      type="button"
                      className={event.hasLiked ? "activity-like-button liked" : "activity-like-button"}
                      onClick={() => toggleActivityLike(event)}
                    >
                      {event.hasLiked ? "💗 Liked" : "🤍 Like"}
                    </button>

                    <span>
                      {Number(event.likeCount || 0)}{" "}
                      {Number(event.likeCount || 0) === 1 ? "like" : "likes"}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <button type="button" onClick={() => setStep("home")}>
        Back Home
      </button>
    </section>
  )
}

export default ActivityFeedPage