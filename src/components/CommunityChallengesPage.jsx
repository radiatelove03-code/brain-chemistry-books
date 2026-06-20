import CommunityChallengeCard from "./CommunityChallengeCard"

function CommunityChallengesPage({
  joinedCommunityChallengeIds,
  completedCommunityChallengeCount,
  totalCommunityReaderCount,
  communityChallengeView,
  setCommunityChallengeView,
  visibleCommunityChallenges,
  getCommunityChallengeProgress,
  joinedCommunityChallengeSet,
  getCommunityChallengeParticipantCount,
  getCommunityChallengeParticipants,
  getCommunityChallengeLeaderboard,
  user,
  profile,
  toggleCommunityChallenge,
  openSavedReview,
  setStep,
}) {
  return (
    <section>
      <p>Phase 12A • Community Challenges</p>
      <h1>Challenge Hub</h1>
      <p>
        Join cozy reading challenges, track your progress automatically from your library,
        and see which readers are participating with you.
      </p>

      <div className="community-challenge-summary">
        <div className="score-card">
          <p>Joined</p>
          <h2>{joinedCommunityChallengeIds.length}</h2>
          <p>challenge{joinedCommunityChallengeIds.length === 1 ? "" : "s"}</p>
        </div>

        <div className="score-card">
          <p>Completed</p>
          <h2>{completedCommunityChallengeCount}</h2>
          <p>finished challenge{completedCommunityChallengeCount === 1 ? "" : "s"}</p>
        </div>

        <div className="score-card">
          <p>Community</p>
          <h2>{totalCommunityReaderCount}</h2>
          <p>reader{totalCommunityReaderCount === 1 ? "" : "s"} participating</p>
        </div>
      </div>

      <div className="community-challenge-filter-tabs" aria-label="Challenge filters">
        {[
          ["all", "All"],
          ["joined", "Joined"],
          ["completed", "Completed"],
          ["open", "Still Open"],
        ].map(([filterId, label]) => (
          <button
            type="button"
            key={filterId}
            className={communityChallengeView === filterId ? "active" : ""}
            onClick={() => setCommunityChallengeView(filterId)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="community-challenge-grid">
        {visibleCommunityChallenges.map((challenge) => {
          const challengeProgress = getCommunityChallengeProgress(challenge)
          const isJoined = joinedCommunityChallengeSet.has(challenge.id)
          const participantCount = getCommunityChallengeParticipantCount(challenge.id)
          const participantProfiles = getCommunityChallengeParticipants(challenge.id)
          const visibleParticipantProfiles = participantProfiles.slice(0, 4)
          const hiddenParticipantCount = Math.max(0, participantCount - visibleParticipantProfiles.length)
          const leaderboard = getCommunityChallengeLeaderboard(challenge.id)
          const topLeaderboardReaders = leaderboard.topReaders || []
          const ownLeaderboardEntry = leaderboard.ownEntry || null
          const isPrivateLeaderboardReader = isJoined && Boolean(user) && !profile.isPublicProfile

          return (
            <CommunityChallengeCard
              key={challenge.id}
              challenge={challenge}
              challengeProgress={challengeProgress}
              isJoined={isJoined}
              participantCount={participantCount}
              visibleParticipantProfiles={visibleParticipantProfiles}
              hiddenParticipantCount={hiddenParticipantCount}
              leaderboard={leaderboard}
              topLeaderboardReaders={topLeaderboardReaders}
              ownLeaderboardEntry={ownLeaderboardEntry}
              isPrivateLeaderboardReader={isPrivateLeaderboardReader}
              toggleCommunityChallenge={toggleCommunityChallenge}
              openSavedReview={openSavedReview}
            />
          )
        })}
      </div>

      {visibleCommunityChallenges.length === 0 && (
        <div className="score-card">
          <p>No challenges match that filter yet.</p>
          <p>Join a challenge or finish a matching book to fill this shelf.</p>
        </div>
      )}

      <button type="button" onClick={() => setStep("home")}>
        Back Home
      </button>
    </section>
  )
}

export default CommunityChallengesPage