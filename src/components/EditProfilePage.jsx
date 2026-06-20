function EditProfilePage({
  profile,
  profileSavedMessage,
  profileDisplayName,
  cleanProfileUsername,
  followStats,
  updateProfile,
  readingAestheticOptions,
  readerTypeOptions,
  favoriteSubgenreOptions,
  publicProfileUrl,
  saveProfile,
  setStep,
}) {
  return (
    <section>
      <p>Pressed Pages Profile</p>
      <h1>Edit your reader scrapbook.</h1>
      <p>Update your profile details, reader flair, and square avatar image.</p>

      {profileSavedMessage && <p>{profileSavedMessage}</p>}

      <div className="profile-card profile-edit-preview">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={`${profileDisplayName} avatar preview`} />
            ) : (
              <span>📚</span>
            )}
          </div>

          <div>
            <p>Preview</p>
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
      </div>

      <div className="score-card profile-edit-card">
        <p>Edit Profile</p>

        <label>
          Display Name
          <input
            type="text"
            value={profile.displayName}
            onChange={(event) => updateProfile("displayName", event.target.value)}
            placeholder="Example: Kenna Jean"
          />
        </label>

        <label>
          Username
          <input
            type="text"
            value={profile.username}
            onChange={(event) => updateProfile("username", event.target.value)}
            placeholder="Example: kenna_reads"
          />
        </label>

        <label>
          Bio
          <textarea
            value={profile.bio}
            onChange={(event) => updateProfile("bio", event.target.value)}
            placeholder="Romance reader. Small-town addict. Professional TBR collector."
          />
        </label>

        <label>
          Reading Aesthetic
          <select
            value={profile.readingAesthetic || ""}
            onChange={(event) => updateProfile("readingAesthetic", event.target.value)}
          >
            <option value="">Choose a reading aesthetic</option>
            {readingAestheticOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Reader Type
          <select
            value={profile.readerType || ""}
            onChange={(event) => updateProfile("readerType", event.target.value)}
          >
            <option value="">Choose a reader type</option>
            {readerTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Favorite Subgenre
          <select
            value={profile.favoriteSubgenre || ""}
            onChange={(event) => updateProfile("favoriteSubgenre", event.target.value)}
          >
            <option value="">Choose a favorite subgenre</option>
            {favoriteSubgenreOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Favorite Genre
          <input
            type="text"
            value={profile.favoriteGenre}
            onChange={(event) => updateProfile("favoriteGenre", event.target.value)}
            placeholder="Example: Romance"
          />
        </label>

        <label>
          Favorite Trope
          <input
            type="text"
            value={profile.favoriteTrope}
            onChange={(event) => updateProfile("favoriteTrope", event.target.value)}
            placeholder="Example: Small Town"
          />
        </label>

        <label>
          Favorite Reading Vibe
          <input
            type="text"
            value={profile.favoriteVibe}
            onChange={(event) => updateProfile("favoriteVibe", event.target.value)}
            placeholder="Example: Cozy rural romance"
          />
        </label>

        <label>
          Avatar Image URL
          <input
            type="url"
            value={profile.avatarUrl}
            onChange={(event) => updateProfile("avatarUrl", event.target.value)}
            placeholder="Paste an image link for now"
          />
        </label>

        <p className="profile-helper-text">
          Avatar images are automatically cropped to a 200px by 200px square.
        </p>

        <label className="profile-public-toggle">
          <input
            type="checkbox"
            checked={Boolean(profile.isPublicProfile)}
            onChange={(event) => updateProfile("isPublicProfile", event.target.checked)}
          />
          <span>Make my profile public and shareable</span>
        </label>

        {profile.isPublicProfile && (
          <div className="profile-public-card">
            <p>Your public profile link</p>
            <input readOnly value={publicProfileUrl} aria-label="Public profile link preview" />
          </div>
        )}

        <button
          onClick={() => {
            saveProfile()
            setStep("profile")
          }}
        >
          Save Profile
        </button>

        <button onClick={() => setStep("profile")}>Cancel</button>
      </div>
    </section>
  )
}

export default EditProfilePage