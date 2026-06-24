import ReaderCard from "./ReaderCard"

export default function FindReadersPage({
  user,
  readerSearch,
  setReaderSearch,
  readerSearchResults,
  readerSearchLoading,
  readerSearchMessage,
  searchReaders,
  openReaderProfile,
  setStep,
}) {
  return (
    <section>
      <p>Community</p>
      <h1>Find Readers</h1>
      <p>Search public reader profiles by display name or username.</p>

      {!user && <p>Log in to search for readers.</p>}

      {user && (
        <>
          <label>
            Search readers
            <input
              type="text"
              value={readerSearch}
              onChange={(event) => {
                setReaderSearch(event.target.value)
                searchReaders(event.target.value)
              }}
              placeholder="Search by name or username..."
            />
          </label>

          {readerSearchLoading && <p>Searching readers...</p>}
          {readerSearchMessage && <p>{readerSearchMessage}</p>}

          <div className="reader-card-list">
            {readerSearchResults.map((reader) => (
              <ReaderCard
                key={reader.userId}
                reader={reader}
                stats={reader.statsData}
                compact
                actionLabel="View Profile"
                onAction={() => openReaderProfile(reader.username)}
              />
            ))}
          </div>

          <button type="button" onClick={() => setStep("activityFeed")}>
            Back to Activity Feed
          </button>
        </>
      )}
    </section>
  )
}