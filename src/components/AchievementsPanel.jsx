import ProgressBar from "./ProgressBar"
import AchievementCard from "./AchievementCard"

function AchievementsPanel({
  analyticsTab,
  achievementStats,
  downloadAchievementGraphicPng,
}) {
  const overallPercent = achievementStats.total
    ? Math.round((achievementStats.unlocked / achievementStats.total) * 100)
    : 0

  return (
    <div className={`score-card ${analyticsTab === "achievements" ? "" : "analytics-panel-hidden"}`}>
      <p>🏆 Achievements</p>
      <h2>{achievementStats.unlocked} / {achievementStats.total} unlocked</h2>

      <ProgressBar percent={overallPercent} />

      {achievementStats.nextAchievement && (
        <p>
          Next up: {achievementStats.nextAchievement.icon}{" "}
          {achievementStats.nextAchievement.name} (
          {Math.min(
            Number(achievementStats.nextAchievement.current || 0),
            achievementStats.nextAchievement.target
          )}{" "}
          / {achievementStats.nextAchievement.target})
        </p>
      )}

      {achievementStats.groups.map((group) => (
        <div key={group.title} style={{ marginTop: "1.5rem" }}>
          <h3>{group.title}</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {group.achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                groupTitle={group.title}
                downloadAchievementGraphicPng={downloadAchievementGraphicPng}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AchievementsPanel