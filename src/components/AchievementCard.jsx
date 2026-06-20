import ProgressBar from "./ProgressBar"

function AchievementCard({ achievement, groupTitle, downloadAchievementGraphicPng }) {
  const current = Number(achievement.current || 0)
  const unlocked = current >= achievement.target
  const progressPercent = achievement.target
    ? Math.min(100, Math.round((current / achievement.target) * 100))
    : 0

  return (
    <div
      style={{
        border: unlocked
          ? "2px solid rgba(166, 84, 52, 0.75)"
          : "1px solid rgba(47, 36, 32, 0.18)",
        borderRadius: "1rem",
        padding: "1rem",
        background: unlocked
          ? "rgba(166, 84, 52, 0.14)"
          : "rgba(255, 255, 255, 0.45)",
      }}
    >
      <p style={{ fontSize: "2rem", margin: 0 }}>
        {unlocked ? achievement.icon : "🔒"}
      </p>

      <h4 style={{ marginBottom: "0.25rem" }}>{achievement.name}</h4>

      <p>{achievement.description}</p>

      <p>
        {unlocked
          ? "Unlocked ✅"
          : `${Math.min(current, achievement.target)} / ${achievement.target}`}
      </p>

      <ProgressBar percent={progressPercent} />

      {unlocked && achievement.id !== "author-era-placeholder" && (
        <button
          type="button"
          className="secondary-button"
          style={{ marginTop: "0.75rem", width: "100%" }}
          onClick={() => downloadAchievementGraphicPng(achievement, groupTitle)}
        >
          🎨 Download Badge Graphic
        </button>
      )}
    </div>
  )
}

export default AchievementCard