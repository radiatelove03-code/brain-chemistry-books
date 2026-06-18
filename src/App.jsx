import { useEffect, useMemo, useState } from "react"
import { supabase } from "./lib/supabase"
import Auth from "./Auth"
import "./App.css"
import ProgressBar from "./components/ProgressBar"
import ReaderCard from "./components/ReaderCard"
import ReadingHeatMap from "./components/ReadingHeatMap"
import CommunityChallengeCard from "./components/CommunityChallengeCard"

const tropeOptions = [
  "Small Town",
  "Found Family",
  "Forced Proximity",
  "Protective MMC",
  "Slow Burn",
  "Single Parent",
  "Banter",
  "Enemies to Lovers",
  "Friends to Lovers",
  "Second Chance",
  "Cowboy Romance",
  "Sports Romance",
  "Dark Romance",
  "Why Choose",
]

const readingAestheticOptions = [
  "🌸 Scrapbook Reader",
  "🌙 Dark Academia",
  "🍂 Cozy Autumn",
  "🌲 Forest Library",
  "🕯️ Midnight Reader",
  "🌾 Small Town Dreamer",
  "📖 Bookstore Wanderer",
  "✨ Soft Romance Era",
]

const readerTypeOptions = [
  "📚 TBR Collector",
  "💕 Mood Reader",
  "🔁 Series Binger",
  "🎧 Audiobook Lover",
  "✨ KU Addict",
  "📝 Review Writer",
  "🌙 Night Reader",
  "☕ Cozy Chapter Chaser",
]

const favoriteSubgenreOptions = [
  "🌾 Small Town Romance",
  "🏒 Sports Romance",
  "🖤 Dark Romance",
  "🐺 Paranormal Romance",
  "🗡️ Fantasy Romance",
  "🕵️ Romantic Suspense",
  "🤠 Cowboy Romance",
  "💐 Contemporary Romance",
]



const communityChallenges = [
  {
    id: "romance-sprint",
    friendPreview: ["book besties", "romance readers"],
    icon: "💕",
    title: "Romance Sprint",
    subtitle: "Read 5 finished books and fill your shelves with fresh romance wins.",
    goal: 5,
    label: "Finished books",
    tag: "Starter challenge",
    ends: "Ongoing",
    matchType: "finished",
  },
  {
    id: "small-town-stack",
    friendPreview: ["cozy readers", "small-town girlies"],
    icon: "🌻",
    title: "Small Town Stack",
    subtitle: "Read 3 books with small-town energy, found family, porch swings, or local drama.",
    goal: 3,
    label: "Small Town books",
    tag: "Trope challenge",
    ends: "Ongoing",
    matchType: "small-town",
  },
  {
    id: "spice-shelf",
    friendPreview: ["spicy shelf readers", "KU baddies"],
    icon: "🌶️",
    title: "Spice Shelf",
    subtitle: "Finish 3 books with a spice rating of 3 or higher.",
    goal: 3,
    label: "Spicy reads",
    tag: "Mood challenge",
    ends: "Ongoing",
    matchType: "spicy",
  },
  {
    id: "brain-chemistry",
    friendPreview: ["favorite hoarders", "five-star collectors"],
    icon: "🧠",
    title: "Brain Chemistry Books",
    subtitle: "Mark 3 finished reads as favorites because some books alter the wiring permanently.",
    goal: 3,
    label: "Favorite reads",
    tag: "Favorites challenge",
    ends: "Ongoing",
    matchType: "favorite",
  },
  {
    id: "dark-and-dangerous",
    friendPreview: ["dark romance readers", "monster lovers"],
    icon: "🖤",
    title: "Dark & Dangerous",
    subtitle: "Read 3 dark romance, paranormal, fantasy, or suspense-leaning books.",
    goal: 3,
    label: "Darker reads",
    tag: "Genre challenge",
    ends: "Ongoing",
    matchType: "dark",
  },
  {
    id: "fresh-pages",
    friendPreview: ["backlog builders", "library reset readers"],
    icon: "📚",
    title: "Fresh Pages",
    subtitle: "Add 10 finished books to your library, including backlog imports and already-read books.",
    goal: 10,
    label: "Finished books added",
    tag: "Library builder",
    ends: "Ongoing",
    matchType: "finished",
  },
]

function App() {
  const [step, setStep] = useState("home")
  const [user, setUser] = useState(null)
  const [selectedReview, setSelectedReview] = useState(null)
  const [selectedReadingLogBookId, setSelectedReadingLogBookId] = useState(null)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [libraryFilter, setLibraryFilter] = useState("all")
  const [librarySearch, setLibrarySearch] = useState("")
  const [libraryRatingFilter, setLibraryRatingFilter] = useState("all")
  const [librarySpiceFilter, setLibrarySpiceFilter] = useState("all")
  const [libraryFinishedYearFilter, setLibraryFinishedYearFilter] = useState("all")
  const [libraryFinishedMonthFilter, setLibraryFinishedMonthFilter] = useState("all")
  const [libraryTropeFilter, setLibraryTropeFilter] = useState("all")

  function getBlankReviewText() {
    return {
      oneSentenceReview: "",
      favoriteThing: "",
      biggestComplaint: "",
      vibeCheck: "",
    }
  }

  function normalizeReviewForDisplay(reviewItem) {
    const safeReview = reviewItem || {}
    const safeBookInfo = safeReview.bookInfo || {}

    return {
      ...safeReview,
      bookInfo: {
        title: "",
        author: "",
        coverUrl: "",
        series: "",
        bookNumber: "",
        genre: "",
        format: "Kindle",
        reviewGraphicUrl: "",
        status: "Finished",
        totalPages: "",
        currentPage: "",
        dateStarted: "",
        dateFinished: "",
        ...safeBookInfo,
      },
      dnfInfo:
        safeReview.dnfInfo || {
          percent: "",
          reason: "",
          wouldReadAuthorAgain: "Maybe",
        },
      scores:
        safeReview.scores || {
          plot: 0,
          vibe: 0,
          characters: 0,
          writingStyle: 0,
          enjoyability: 0,
        },
      metrics: {
        spice: 0,
        chemistry: 0,
        tension: 0,
        emotionalDamage: 0,
        bookHangover: 0,
        contentIntensity: 0,
        ...(safeReview.metrics || {}),
      },
      review: safeReview.review || getBlankReviewText(),
      tropes: Array.isArray(safeReview.tropes) ? safeReview.tropes : [],
      obsessionScore: safeReview.obsessionScore ?? "",
      recommendationLevel: safeReview.recommendationLevel || "",
      isFavorite: Boolean(safeReview.isFavorite),
      bookScore: safeReview.bookScore ?? "",
      miniReviewText: safeReview.miniReviewText || "",
      readingLogs: Array.isArray(safeReview.readingLogs) ? safeReview.readingLogs : [],
    }
  }

  function isReviewOwnedByCurrentUser(reviewItem) {
    const safeReviewItem = normalizeReviewForDisplay(reviewItem)

    if (!safeReviewItem?.id) return false

    // Local-only reviews may not have user_id yet, but they only exist in the owner's library.
    if (!safeReviewItem.user_id) return true

    return Boolean(user?.id && safeReviewItem.user_id === user.id)
  }

  function loadLocalSavedReviews() {
    try {
      const saved = localStorage.getItem("brainChemistryBooksReviews")
      const parsedReviews = saved ? JSON.parse(saved) : []
      return Array.isArray(parsedReviews) ? parsedReviews.map(normalizeReviewForDisplay) : []
    } catch (error) {
      console.warn("Could not load local reviews:", error)
      return []
    }
  }

  const [savedReviews, setSavedReviews] = useState(() => loadLocalSavedReviews())
  const [isLibraryLoading, setIsLibraryLoading] = useState(true)

  const [bookInfo, setBookInfo] = useState({
    title: "",
    author: "",
    coverUrl: "",
    series: "",
    bookNumber: "",
    genre: "",
    format: "Kindle",
    reviewGraphicUrl: "",
    status: "Finished",
    totalPages: "",
    currentPage: "",
    dateStarted: "",
    dateFinished: "",
  })

  const [dnfInfo, setDnfInfo] = useState({
    percent: "",
    reason: "",
    wouldReadAuthorAgain: "Maybe",
  })

  const [scores, setScores] = useState({
    plot: 0,
    vibe: 0,
    characters: 0,
    writingStyle: 0,
    enjoyability: 0,
  })

  const [metrics, setMetrics] = useState({
    spice: 0,
    chemistry: 0,
    tension: 0,
    emotionalDamage: 0,
    bookHangover: 0,
    contentIntensity: 0,
  })

  const [review, setReview] = useState({
    oneSentenceReview: "",
    favoriteThing: "",
    biggestComplaint: "",
    vibeCheck: "",
  })

  const [tropes, setTropes] = useState([])
  const [obsessionScore, setObsessionScore] = useState(5)
  const [recommendationLevel, setRecommendationLevel] = useState("Recommend")
  const [isFavorite, setIsFavorite] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [alreadyReadBook, setAlreadyReadBook] = useState({
    title: "",
    author: "",
    coverUrl: "",
    rating: "",
    dateFinished: "",
    notes: "",
  })
  const [backlogRows, setBacklogRows] = useState([
    { title: "", author: "", rating: "", dateFinished: "" },
    { title: "", author: "", rating: "", dateFinished: "" },
    { title: "", author: "", rating: "", dateFinished: "" },
  ])
  const [joinedCommunityChallengeIds, setJoinedCommunityChallengeIds] = useState(() => {
    try {
      const saved = localStorage.getItem("pressedPagesJoinedCommunityChallenges")
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [communityChallengeView, setCommunityChallengeView] = useState("all")
  const [communityChallengeParticipantCounts, setCommunityChallengeParticipantCounts] = useState({})
  const [communityChallengeParticipantProfiles, setCommunityChallengeParticipantProfiles] = useState({})
  const [communityChallengeLeaderboards, setCommunityChallengeLeaderboards] = useState({})
  const [progressInputs, setProgressInputs] = useState({})
  const [readingLogDrafts, setReadingLogDrafts] = useState({})
  const [readingLogDirty, setReadingLogDirty] = useState({})
  const [readingLogs, setReadingLogs] = useState([])
  const [readingLogMinutesInputs, setReadingLogMinutesInputs] = useState({})
  const [readingLogNoteInputs, setReadingLogNoteInputs] = useState({})
  const [calendarMonthKey, setCalendarMonthKey] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  })
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  })

  const [wrapUpMonthKey, setWrapUpMonthKey] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  })
  const [yearInBooksKey, setYearInBooksKey] = useState(() => String(new Date().getFullYear()))
  const [analyticsTab, setAnalyticsTab] = useState("overview")
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("pressedPagesProfile")

    return savedProfile
      ? JSON.parse(savedProfile)
      : {
          displayName: "",
          username: "",
          bio: "",
          favoriteGenre: "",
          favoriteTrope: "",
          favoriteVibe: "",
          avatarUrl: "",
          readingAesthetic: "",
          readerType: "",
          favoriteSubgenre: "",
          isPublicProfile: false,
        }
  })
  const [profileSavedMessage, setProfileSavedMessage] = useState("")
  const [cloudProfileId, setCloudProfileId] = useState(null)
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0, isFollowing: false })
  const [publicProfileView, setPublicProfileView] = useState(null)
  const [publicProfileLoading, setPublicProfileLoading] = useState(false)
  const [publicProfileMessage, setPublicProfileMessage] = useState("")
  const [activityFeed, setActivityFeed] = useState([])
  const [activityFeedLoading, setActivityFeedLoading] = useState(false)
  const [activityFeedMessage, setActivityFeedMessage] = useState("")
  const [publicProfileBooks, setPublicProfileBooks] = useState([])
  const [publicProfileShelf, setPublicProfileShelf] = useState("reading")
  const [profilePreviewShelf, setProfilePreviewShelf] = useState("reading")


  const [readingGoals, setReadingGoals] = useState(() => {
    const savedGoals = localStorage.getItem("brainChemistryBooksReadingGoals")

    return savedGoals
      ? JSON.parse(savedGoals)
      : {
          books: "75",
          pages: "",
          readingDays: "",
          minutes: "",
        }
  })

  const [reviewGraphicTemplate, setReviewGraphicTemplate] = useState("scrapbook")
  const [reviewGraphicSize, setReviewGraphicSize] = useState("square")
  const [reviewCaptionPlatform, setReviewCaptionPlatform] = useState("instagram")
  const [reviewGraphicFields, setReviewGraphicFields] = useState({
    rating: true,
    spice: true,
    obsession: true,
    review: true,
    vibe: true,
    tropes: true,
  })

  const libraryFinishedYears = Array.from(
    new Set(
      savedReviews
        .filter((item) => item.bookInfo?.status === "Finished" && item.bookInfo.dateFinished)
        .map((item) => new Date(item.bookInfo.dateFinished).getFullYear())
        .filter((year) => !Number.isNaN(year))
    )
  ).sort((a, b) => b - a)

  const wrapUpMonthOptions = Array.from(
    new Set([
      wrapUpMonthKey,
      ...savedReviews
        .filter((item) => item.bookInfo?.status === "Finished" && item.bookInfo.dateFinished)
        .map((item) => String(item.bookInfo.dateFinished).slice(0, 7)),
    ])
  )
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))

  const yearInBooksOptions = Array.from(
    new Set([
      yearInBooksKey,
      String(new Date().getFullYear()),
      ...savedReviews
        .filter((item) => item.bookInfo?.status === "Finished" && item.bookInfo.dateFinished)
        .map((item) => String(item.bookInfo.dateFinished).slice(0, 4)),
      ...getAllReadingLogs()
        .filter((log) => log.date)
        .map((log) => String(log.date).slice(0, 4)),
    ])
  )
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))

  const libraryTropeOptions = Array.from(
    new Set(savedReviews.flatMap((item) => item?.tropes || []))
  ).sort()

const filteredReviews = useMemo(() => {
  return savedReviews.filter((item) => {
    const book = item?.bookInfo || {}
    const status = book.status || ""

    if (libraryFilter === "favorites" && !item.isFavorite) return false
    if (libraryFilter === "reading" && status !== "Reading") return false
    if (libraryFilter === "finished" && status !== "Finished") return false
    if (libraryFilter === "dnf" && status !== "DNF") return false

    const searchTerm = librarySearch.trim().toLowerCase()
    if (searchTerm) {
      const searchableText = `${book.title || ""} ${book.author || ""}`.toLowerCase()
      if (!searchableText.includes(searchTerm)) return false
    }

    if (libraryRatingFilter !== "all") {
      const minimumRating = Number(libraryRatingFilter)
      if (Number(item.bookScore || 0) < minimumRating) return false
    }

    if (librarySpiceFilter !== "all") {
      const minimumSpice = Number(librarySpiceFilter)
      if (Number(item.metrics?.spice || 0) < minimumSpice) return false
    }

    if (libraryFinishedYearFilter !== "all") {
      if (!book.dateFinished) return false
      const finishedYear = new Date(book.dateFinished).getFullYear()
      if (String(finishedYear) !== libraryFinishedYearFilter) return false
    }

    if (libraryFinishedMonthFilter !== "all") {
      if (!book.dateFinished) return false
      const finishedMonth = new Date(book.dateFinished).getMonth() + 1
      if (String(finishedMonth) !== libraryFinishedMonthFilter) return false
    }

    if (libraryTropeFilter !== "all") {
      if (!(item.tropes || []).includes(libraryTropeFilter)) return false
    }

    return true
  })
}, [
  savedReviews,
  libraryFilter,
  librarySearch,
  libraryRatingFilter,
  librarySpiceFilter,
  libraryFinishedYearFilter,
  libraryFinishedMonthFilter,
  libraryTropeFilter,
])

  const joinedCommunityChallengeSet = new Set(
    Array.isArray(joinedCommunityChallengeIds) ? joinedCommunityChallengeIds : []
  )

  function doesBookMatchCommunityChallenge(item, challenge) {
    const bookInfo = item?.bookInfo || {}
    const status = bookInfo.status || ""
    const genre = String(bookInfo.genre || "").toLowerCase()
    const tropes = Array.isArray(item?.tropes) ? item.tropes : []
    const metrics = item?.metrics || {}
    const isFinished = status === "Finished"

    if (!isFinished) return false

    if (challenge.matchType === "small-town") {
      return tropes.includes("Small Town") || genre.includes("small town")
    }

    if (challenge.matchType === "spicy") {
      return Number(metrics.spice || 0) >= 3
    }

    if (challenge.matchType === "favorite") {
      return Boolean(item?.isFavorite)
    }

    if (challenge.matchType === "dark") {
      return (
        tropes.includes("Dark Romance") ||
        genre.includes("dark") ||
        genre.includes("paranormal") ||
        genre.includes("fantasy") ||
        genre.includes("suspense")
      )
    }

    return isFinished
  }

  function getCommunityChallengeProgress(challenge) {
    const safeReviews = Array.isArray(savedReviews) ? savedReviews : []
    const matchingBooks = safeReviews.filter((item) => doesBookMatchCommunityChallenge(item, challenge))
    const progress = Math.min(challenge.goal, matchingBooks.length)
    const percent = challenge.goal > 0 ? Math.min(100, Math.round((progress / challenge.goal) * 100)) : 0

    return {
      progress,
      total: matchingBooks.length,
      percent,
      isComplete: progress >= challenge.goal,
      recentBooks: matchingBooks
        .slice()
        .sort((a, b) => {
          const aDate = new Date(a?.bookInfo?.dateFinished || a?.createdAt || 0).getTime() || 0
          const bDate = new Date(b?.bookInfo?.dateFinished || b?.createdAt || 0).getTime() || 0
          return bDate - aDate
        })
        .slice(0, 3),
    }
  }

  function getCommunityChallengeParticipantCount(challengeId) {
    const cloudCount = Number(communityChallengeParticipantCounts?.[challengeId] || 0)
    const localCount = joinedCommunityChallengeSet.has(challengeId) ? 1 : 0
    return user ? cloudCount : Math.max(cloudCount, localCount)
  }

  function getCommunityChallengeParticipants(challengeId) {
    const participants = communityChallengeParticipantProfiles?.[challengeId]
    return Array.isArray(participants) ? participants : []
  }

  function getCommunityChallengeLeaderboard(challengeId) {
    const leaderboard = communityChallengeLeaderboards?.[challengeId]
    return leaderboard || { topReaders: [], ownEntry: null, visibleCount: 0 }
  }

  async function loadCommunityChallengeParticipation(currentUser = user) {
    if (!currentUser) {
      setCommunityChallengeParticipantCounts({})
      setCommunityChallengeParticipantProfiles({})
      setCommunityChallengeLeaderboards({})
      return
    }

    const { data: participantRows, error: participantError } = await supabase
      .from("challenge_participants")
      .select("challenge_id, user_id, joined_at")

    if (participantError) {
      console.warn("Could not load challenge participants:", participantError.message)
      return
    }

    const safeRows = Array.isArray(participantRows) ? participantRows : []
    const counts = {}

    safeRows.forEach((row) => {
      if (!row?.challenge_id) return
      counts[row.challenge_id] = (counts[row.challenge_id] || 0) + 1
    })

    setCommunityChallengeParticipantCounts(counts)

    const myChallenges = safeRows
      .filter((row) => row.user_id === currentUser.id)
      .map((row) => row.challenge_id)

    setJoinedCommunityChallengeIds(myChallenges)

    const userIds = [...new Set(safeRows.map((row) => row.user_id).filter(Boolean))]

    if (userIds.length === 0) {
      setCommunityChallengeParticipantProfiles({})
      setCommunityChallengeLeaderboards({})
      return
    }

    const [{ data: profileRows, error: profileError }, { data: followRows, error: followError }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url, is_public, profile_data")
          .in("user_id", userIds),
        supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", currentUser.id),
      ])

    if (profileError) {
      console.warn("Could not load challenge participant profiles:", profileError.message)
    }

    if (followError) {
      console.warn("Could not load followed challenge participants:", followError.message)
    }

    const profileByUserId = {}
    ;(Array.isArray(profileRows) ? profileRows : []).forEach((profileRow) => {
      profileByUserId[profileRow.user_id] = profileRow
    })

    const followedIds = new Set(
      (Array.isArray(followRows) ? followRows : [])
        .map((row) => row.following_id)
        .filter(Boolean)
    )

    const publicUserIds = new Set(
      (Array.isArray(profileRows) ? profileRows : [])
        .filter((profileRow) => Boolean(profileRow?.is_public))
        .map((profileRow) => profileRow.user_id)
        .filter(Boolean)
    )

    if (currentUser?.id) {
      publicUserIds.add(currentUser.id)
    }

    let reviewRows = []

    if (publicUserIds.size > 0) {
      const { data: publicReviewRows, error: publicReviewError } = await supabase
        .from("reviews")
        .select("user_id, review_data, updated_at")
        .in("user_id", [...publicUserIds])

      if (publicReviewError) {
        console.warn("Could not load challenge leaderboard reviews:", publicReviewError.message)
      } else {
        reviewRows = Array.isArray(publicReviewRows) ? publicReviewRows : []
      }
    }

    const reviewsByUserId = {}

    reviewRows.forEach((row) => {
      if (!row?.user_id) return
      if (!reviewsByUserId[row.user_id]) reviewsByUserId[row.user_id] = []
      reviewsByUserId[row.user_id].push({ ...(row.review_data || {}), id: row.review_data?.id || row.id, user_id: row.user_id })
    })

    if (currentUser?.id) {
      reviewsByUserId[currentUser.id] = Array.isArray(savedReviews) ? savedReviews : []
    }

    const profilesByChallenge = {}
    const leaderboardEntriesByChallenge = {}

    safeRows.forEach((row) => {
      if (!row?.challenge_id || !row?.user_id) return

      const profileRow = profileByUserId[row.user_id]
      const profileData = profileRow?.profile_data || {}
      const isOwnReader = row.user_id === currentUser.id
      const isPublicReader = Boolean(profileRow?.is_public)
      const canShowProfile = isOwnReader || isPublicReader
      const displayName = isOwnReader
        ? "You"
        : canShowProfile
          ? profileData.displayName || profileRow?.display_name || profileRow?.username || "Pressed Pages Reader"
          : "Private reader"
      const username = canShowProfile
        ? profileData.username || profileRow?.username || ""
        : ""
      const avatarUrl = canShowProfile
        ? profileData.avatarUrl || profileRow?.avatar_url || ""
        : ""

      if (!profilesByChallenge[row.challenge_id]) {
        profilesByChallenge[row.challenge_id] = []
      }

      const participantProfile = {
        userId: row.user_id,
        displayName,
        username,
        avatarUrl,
        isOwnReader,
        isPublicReader,
        isFollowing: followedIds.has(row.user_id),
        joinedAt: row.joined_at || "",
      }

      profilesByChallenge[row.challenge_id].push(participantProfile)

      const challenge = communityChallenges.find((item) => item.id === row.challenge_id)
      const readerReviews = reviewsByUserId[row.user_id] || []
      const matchingBooks = challenge
        ? readerReviews.filter((item) => doesBookMatchCommunityChallenge(item, challenge))
        : []
      const rawProgress = matchingBooks.length
      const cappedProgress = challenge?.goal
        ? Math.min(challenge.goal, rawProgress)
        : rawProgress

      if (!leaderboardEntriesByChallenge[row.challenge_id]) {
        leaderboardEntriesByChallenge[row.challenge_id] = []
      }

      leaderboardEntriesByChallenge[row.challenge_id].push({
        ...participantProfile,
        progress: cappedProgress,
        total: rawProgress,
        goal: challenge?.goal || 0,
        isComplete: challenge?.goal ? cappedProgress >= challenge.goal : false,
      })
    })

    Object.keys(profilesByChallenge).forEach((challengeId) => {
      profilesByChallenge[challengeId].sort((a, b) => {
        if (a.isOwnReader && !b.isOwnReader) return -1
        if (!a.isOwnReader && b.isOwnReader) return 1
        if (a.isFollowing && !b.isFollowing) return -1
        if (!a.isFollowing && b.isFollowing) return 1
        return String(a.displayName).localeCompare(String(b.displayName))
      })
    })

    const leaderboardsByChallenge = {}

    Object.keys(leaderboardEntriesByChallenge).forEach((challengeId) => {
      const entries = leaderboardEntriesByChallenge[challengeId]
      const publicEntries = entries
        .filter((entry) => entry.isPublicReader)
        .sort((a, b) => {
          if (Number(b.progress || 0) !== Number(a.progress || 0)) {
            return Number(b.progress || 0) - Number(a.progress || 0)
          }
          if (a.isFollowing && !b.isFollowing) return -1
          if (!a.isFollowing && b.isFollowing) return 1
          return String(a.displayName).localeCompare(String(b.displayName))
        })
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }))

      const ownPublicEntry = publicEntries.find((entry) => entry.isOwnReader) || null
      const ownPrivateEntry = entries.find((entry) => entry.isOwnReader) || null

      leaderboardsByChallenge[challengeId] = {
        topReaders: publicEntries.slice(0, 5),
        ownEntry: ownPublicEntry || (ownPrivateEntry ? { ...ownPrivateEntry, rank: null } : null),
        visibleCount: publicEntries.length,
      }
    })

    setCommunityChallengeParticipantProfiles(profilesByChallenge)
    setCommunityChallengeLeaderboards(leaderboardsByChallenge)
  }

  async function syncJoinedCommunityChallengesToCloud(nextIds, currentIds = joinedCommunityChallengeIds) {
    if (!user) return

    try {
      const safeCurrentIds = Array.isArray(currentIds) ? currentIds : []
      const safeNextIds = Array.isArray(nextIds) ? nextIds : []

      const idsToAdd = safeNextIds.filter((id) => !safeCurrentIds.includes(id))
      const idsToRemove = safeCurrentIds.filter((id) => !safeNextIds.includes(id))

      if (idsToAdd.length) {
        const rows = idsToAdd.map((challengeId) => ({
          challenge_id: challengeId,
          user_id: user.id,
        }))

        const { error } = await supabase
          .from("challenge_participants")
          .upsert(rows, { onConflict: "challenge_id,user_id" })

        if (error) throw error
      }

      for (const challengeId of idsToRemove) {
        const { error } = await supabase
          .from("challenge_participants")
          .delete()
          .eq("challenge_id", challengeId)
          .eq("user_id", user.id)

        if (error) throw error
      }

      await loadCommunityChallengeParticipation(user)
    } catch (error) {
      console.warn("Could not sync community challenge signups:", error)
    }
  }

  function toggleCommunityChallenge(challengeId) {
    const safeIds = Array.isArray(joinedCommunityChallengeIds)
      ? joinedCommunityChallengeIds
      : []
    const nextIds = safeIds.includes(challengeId)
      ? safeIds.filter((id) => id !== challengeId)
      : [...safeIds, challengeId]

    setJoinedCommunityChallengeIds(nextIds)

    if (user) {
      syncJoinedCommunityChallengesToCloud(nextIds, safeIds)
    } else {
      localStorage.setItem(
        "pressedPagesJoinedCommunityChallenges",
        JSON.stringify(nextIds)
      )
    }
  }

  const completedCommunityChallengeCount = communityChallenges.filter((challenge) => {
    const progress = getCommunityChallengeProgress(challenge)
    return joinedCommunityChallengeSet.has(challenge.id) && progress.isComplete
  }).length

  const visibleCommunityChallenges = communityChallenges.filter((challenge) => {
    const challengeProgress = getCommunityChallengeProgress(challenge)
    const isJoined = joinedCommunityChallengeSet.has(challenge.id)

    if (communityChallengeView === "joined") return isJoined
    if (communityChallengeView === "completed") return isJoined && challengeProgress.isComplete
    if (communityChallengeView === "open") return !challengeProgress.isComplete
    return true
  })

  const totalCommunityReaderCount = communityChallenges.reduce(
    (sum, challenge) => sum + getCommunityChallengeParticipantCount(challenge.id),
    0
  )

  function resetLibraryFilters() {
    setLibraryFilter("all")
    setLibrarySearch("")
    setLibraryRatingFilter("all")
    setLibrarySpiceFilter("all")
    setLibraryFinishedYearFilter("all")
    setLibraryFinishedMonthFilter("all")
    setLibraryTropeFilter("all")
  }

  const totalBooks = savedReviews.length
 const finishedReviews = useMemo(() => {
  return savedReviews.filter(
    (item) => item.bookInfo?.status === "Finished"
  )
}, [savedReviews])
  const dnfReviews = useMemo(() => {
  return savedReviews.filter(
    (item) => item.bookInfo?.status === "DNF"
  )
}, [savedReviews])

  const currentlyReadingReviews = useMemo(() => {
    return savedReviews.filter(
      (item) => item.bookInfo?.status === "Reading"
    )
  }, [savedReviews])
  const tbrReviews = useMemo(() => {
  return savedReviews.filter(
    (item) => item.bookInfo?.status === "TBR"
  )
}, [savedReviews])
  const favoriteReviews = useMemo(() => {
    return savedReviews.filter((item) => item.isFavorite)
  }, [savedReviews])

  const embeddedReadingLogCount = savedReviews.reduce(
    (sum, item) => sum + (item.readingLogs || []).length,
    0
  )

  const averageRating =
    finishedReviews.length > 0
      ? (
          finishedReviews.reduce((sum, item) => sum + Number(item.bookScore), 0) /
          finishedReviews.length
        ).toFixed(1)
      : "0.0"

  const averageSpice =
    finishedReviews.length > 0
      ? (
          finishedReviews.reduce(
            (sum, item) => sum + Number(item.metrics?.spice || 0),
            0
          ) / finishedReviews.length
        ).toFixed(1)
      : "0.0"

  const averageObsession =
    finishedReviews.length > 0
      ? (
          finishedReviews.reduce(
            (sum, item) => sum + Number(item.obsessionScore),
            0
          ) / finishedReviews.length
        ).toFixed(1)
      : "0.0"

  const brainChemistryCount = savedReviews.filter(
    (item) => item.isFavorite
  ).length

  const tropeCounts = {}

  finishedReviews.forEach((item) => {
    ;(item.tropes || []).forEach((trope) => {
      tropeCounts[trope] = (tropeCounts[trope] || 0) + 1
    })
  })

  const mostReadTrope =
    Object.keys(tropeCounts).length > 0
      ? Object.entries(tropeCounts).sort((a, b) => b[1] - a[1])[0]
      : null

  const authorCounts = {}

  savedReviews.forEach((item) => {
    const author = item.bookInfo.author || "Unknown Author"
    authorCounts[author] = (authorCounts[author] || 0) + 1
  })

  const mostReadAuthor =
    Object.keys(authorCounts).length > 0
      ? Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]
      : null

  function updateBookInfo(field, value) {
    setBookInfo({ ...bookInfo, [field]: value })
  }

  function updateDnfInfo(field, value) {
    setDnfInfo({ ...dnfInfo, [field]: value })
  }

  function updateScore(category, value) {
    setScores({ ...scores, [category]: Number(value) })
  }

  function updateMetric(metric, value) {
    setMetrics({ ...metrics, [metric]: Number(value) })
  }

  function updateReview(field, value) {
    setReview({ ...review, [field]: value })
  }

  function toggleTrope(trope) {
    if (tropes.includes(trope)) {
      setTropes(tropes.filter((item) => item !== trope))
    } else {
      setTropes([...tropes, trope])
    }
  }

  function resetForm() {
    setBookInfo({
      title: "",
      author: "",
      coverUrl: "",
      series: "",
      bookNumber: "",
      genre: "",
      format: "Kindle",
      reviewGraphicUrl: "",
      status: "Finished",
      totalPages: "",
      currentPage: "",
      dateStarted: "",
      dateFinished: "",
    })

    setDnfInfo({
      percent: "",
      reason: "",
      wouldReadAuthorAgain: "Maybe",
    })

    setScores({
      plot: 0,
      vibe: 0,
      characters: 0,
      writingStyle: 0,
      enjoyability: 0,
    })

    setMetrics({
      spice: 0,
      chemistry: 0,
      tension: 0,
      emotionalDamage: 0,
      bookHangover: 0,
      contentIntensity: 0,
    })

    setReview({
      oneSentenceReview: "",
      favoriteThing: "",
      biggestComplaint: "",
      vibeCheck: "",
    })

    setTropes([])
    setObsessionScore(5)
    setRecommendationLevel("Recommend")
    setIsFavorite(false)
    setSaveMessage("")
    setEditingReviewId(null)
  }

  function startNewReview() {
    resetForm()
    setSelectedReview(null)
    setStep(0)
  }

  function openAddBookMenu() {
    resetForm()
    setSelectedReview(null)
    setSaveMessage("")
    setStep("addBook")
  }

  function startAlreadyReadBook() {
    resetForm()
    setAlreadyReadBook({
      title: "",
      author: "",
      coverUrl: "",
      rating: "",
      dateFinished: "",
      notes: "",
    })
    setSaveMessage("")
    setStep("alreadyRead")
  }

  function updateAlreadyReadBook(field, value) {
    setAlreadyReadBook((currentBook) => ({
      ...currentBook,
      [field]: value,
    }))
  }

  function updateBacklogRow(index, field, value) {
    setBacklogRows((currentRows) =>
      currentRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    )
  }

  function addBacklogRow() {
    setBacklogRows((currentRows) => [
      ...currentRows,
      { title: "", author: "", rating: "", dateFinished: "" },
    ])
  }

  function removeBacklogRow(index) {
    setBacklogRows((currentRows) =>
      currentRows.length === 1
        ? currentRows
        : currentRows.filter((_, rowIndex) => rowIndex !== index)
    )
  }

  function createBacklogReview(bookData) {
    const now = new Date().toISOString()
    const cleanRating = String(bookData.rating || "").trim()
    const ratingNumber = cleanRating === "" ? null : Number(cleanRating)
    const safeRating =
      ratingNumber !== null && !Number.isNaN(ratingNumber)
        ? Math.min(5, Math.max(0, ratingNumber)).toFixed(1)
        : null

    const dateFinished = bookData.dateFinished || now
    const safeNotes = bookData.notes?.trim() || ""

    return {
      id: crypto.randomUUID(),
      bookInfo: {
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        coverUrl: bookData.coverUrl || "",
        series: "",
        bookNumber: "",
        genre: "",
        format: "Kindle",
        reviewGraphicUrl: "",
        status: "Finished",
        totalPages: "",
        currentPage: "",
        dateStarted: "",
        dateFinished,
      },
      dnfInfo: null,
      scores: {
        plot: safeRating ? Number(safeRating) : 0,
        vibe: safeRating ? Number(safeRating) : 0,
        characters: safeRating ? Number(safeRating) : 0,
        writingStyle: safeRating ? Number(safeRating) : 0,
        enjoyability: safeRating ? Number(safeRating) : 0,
      },
      metrics: {
        spice: 0,
        chemistry: 0,
        tension: 0,
        emotionalDamage: 0,
        bookHangover: 0,
        contentIntensity: 0,
      },
      review: {
        ...getBlankReviewText(),
        oneSentenceReview: safeNotes,
      },
      tropes: [],
      obsessionScore: null,
      recommendationLevel: safeRating ? "Recommend" : null,
      isFavorite: false,
      bookScore: safeRating,
      miniReviewText: `📚 Already Read\n\n📖 Book:\n${bookData.title.trim()}\n\n✍️ Author:\n${bookData.author.trim()}${
        safeRating ? `\n\n⭐ Rating:\n${safeRating}/5` : ""
      }${safeNotes ? `\n\n📝 Notes:\n${safeNotes}` : ""}`,
      readingLogs: [],
      savedAt: now,
      updatedAt: now,
    }
  }

  async function saveBacklogReviews(newReviews, successMessage) {
    const updatedReviews = [...newReviews, ...savedReviews]

    if (user) {
      const rowsToUpsert = newReviews.map((reviewItem) => ({
        id: reviewItem.id,
        user_id: user.id,
        review_data: reviewItem,
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from("reviews").upsert(rowsToUpsert)

      if (error) {
        setSaveMessage(error.message)
        return false
      }

      for (const reviewItem of newReviews) {
        const activityResult = await createActivityEvent(reviewItem, false)
        if (!activityResult?.ok) {
          return false
        }
      }
    } else {
      localStorage.setItem(
        "brainChemistryBooksReviews",
        JSON.stringify(updatedReviews)
      )
    }

    setSavedReviews(updatedReviews)
    setSaveMessage(successMessage)
    setStep("library")
    return true
  }

  async function saveAlreadyReadBook() {
    if (!alreadyReadBook.title.trim() || !alreadyReadBook.author.trim()) {
      setSaveMessage("Add a title and author before saving.")
      return
    }

    const reviewToSave = createBacklogReview(alreadyReadBook)
    const saved = await saveBacklogReviews([reviewToSave], "Already read book added to your Finished shelf ✨")

    if (saved) {
      setAlreadyReadBook({
        title: "",
        author: "",
        coverUrl: "",
        rating: "",
        dateFinished: "",
        notes: "",
      })
    }
  }

  async function importBacklogBooks() {
    const validRows = backlogRows
      .map((row) => ({
        ...row,
        title: row.title.trim(),
        author: row.author.trim(),
      }))
      .filter((row) => row.title && row.author)

    const incompleteRows = backlogRows.filter(
      (row) =>
        (row.title.trim() || row.author.trim() || row.rating || row.dateFinished) &&
        (!row.title.trim() || !row.author.trim())
    )

    if (incompleteRows.length > 0) {
      setSaveMessage("Every filled row needs both a title and an author.")
      return
    }

    if (validRows.length === 0) {
      setSaveMessage("Add at least one title and author before importing.")
      return
    }

    const reviewsToSave = validRows.map((row) => createBacklogReview(row))
    const successText = `${validRows.length} book${validRows.length === 1 ? "" : "s"} imported to your Finished shelf ✨`
    const saved = await saveBacklogReviews(reviewsToSave, successText)

    if (saved) {
      setBacklogRows([
        { title: "", author: "", rating: "", dateFinished: "" },
        { title: "", author: "", rating: "", dateFinished: "" },
        { title: "", author: "", rating: "", dateFinished: "" },
      ])
    }
  }

  function openSavedReview(reviewItem) {
    setSelectedReview(normalizeReviewForDisplay(reviewItem))
    setStep("viewReview")
  }

  async function deleteReview(reviewId) {
    const reviewToDelete = savedReviews.find((item) => item.id === reviewId) || selectedReview

    if (!isReviewOwnedByCurrentUser(reviewToDelete)) {
      setSaveMessage("You can only delete reviews from your own library.")
      return
    }

    const confirmed = window.confirm("Delete this review?")
    if (!confirmed) return

    if (user) {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id)

      if (error) {
        setSaveMessage(error.message)
        return
      }

      const { error: readingLogError } = await supabase
        .from("reading_logs")
        .delete()
        .eq("book_id", reviewId)
        .eq("user_id", user.id)

      if (readingLogError) {
        setSaveMessage(readingLogError.message)
        return
      }

      setReadingLogs((currentLogs) =>
        currentLogs.filter((log) => log.bookId !== reviewId)
      )
    }

    const updatedReviews = savedReviews.filter((item) => item.id !== reviewId)

    setSavedReviews(updatedReviews)

    if (!user) {
      localStorage.setItem(
        "brainChemistryBooksReviews",
        JSON.stringify(updatedReviews)
      )
    }

    setSelectedReview(null)
    setStep("library")
  }

  function finishBook(reviewItem) {
    setBookInfo({
      ...reviewItem.bookInfo,
      status: "Finished",
      currentPage: reviewItem.bookInfo.totalPages,
      dateStarted: reviewItem.bookInfo.dateStarted || new Date().toISOString(),
      dateFinished: new Date().toISOString(),
    })

    setDnfInfo({
      percent: "",
      reason: "",
      wouldReadAuthorAgain: "Maybe",
    })

    setScores({
      plot: 0,
      vibe: 0,
      characters: 0,
      writingStyle: 0,
      enjoyability: 0,
    })

    setMetrics({
      spice: 0,
      chemistry: 0,
      tension: 0,
      emotionalDamage: 0,
      bookHangover: 0,
      contentIntensity: 0,
    })

    setReview({
      oneSentenceReview: "",
      favoriteThing: "",
      biggestComplaint: "",
      vibeCheck: "",
    })

    setTropes([])
    setObsessionScore(5)
    setRecommendationLevel("Recommend")
    setIsFavorite(false)

    setEditingReviewId(reviewItem.id)
    setSelectedReview(null)
    setSaveMessage("")

    setStep(1)
  }

  function editReview(reviewItem) {
    const safeReviewItem = normalizeReviewForDisplay(reviewItem)

    if (!isReviewOwnedByCurrentUser(safeReviewItem)) {
      setSaveMessage("You can only edit reviews from your own library.")
      return
    }

    setBookInfo(safeReviewItem.bookInfo)

    setDnfInfo(
      safeReviewItem.dnfInfo || {
        percent: "",
        reason: "",
        wouldReadAuthorAgain: "Maybe",
      }
    )

    setScores(
      safeReviewItem.scores || {
        plot: 0,
        vibe: 0,
        characters: 0,
        writingStyle: 0,
        enjoyability: 0,
      }
    )

    setMetrics(
      safeReviewItem.metrics || {
        spice: 0,
        chemistry: 0,
        tension: 0,
        emotionalDamage: 0,
        bookHangover: 0,
        contentIntensity: 0,
      }
    )

    setReview(
      safeReviewItem.review || {
        oneSentenceReview: "",
        favoriteThing: "",
        biggestComplaint: "",
        vibeCheck: "",
      }
    )

    setTropes(safeReviewItem.tropes || [])
    setObsessionScore(safeReviewItem.obsessionScore || 5)
    setRecommendationLevel(safeReviewItem.recommendationLevel || "Recommend")
    setIsFavorite(safeReviewItem.isFavorite || false)
    setEditingReviewId(safeReviewItem.id)
    setSelectedReview(null)
    setSaveMessage("")
    setStep(0)
  }

  const bookScore =
    scores.plot * 0.2 +
    scores.vibe * 0.2 +
    scores.characters * 0.2 +
    scores.writingStyle * 0.15 +
    scores.enjoyability * 0.25

  const miniReviewText = `⭐ Rating: ${bookScore.toFixed(1)}/5

❤️ Obsession: ${obsessionScore}/5

🌶️ Spice: ${metrics.spice}/5

📢 Recommendation:
${recommendationLevel}

${isFavorite ? "🧠 Brain Chemistry Book\n" : ""}
❤️ Tropes:
${tropes.length > 0 ? tropes.join(" • ") : "None selected"}

💬 One-Sentence Review:
${review.oneSentenceReview}

👎 Biggest Complaint:
${review.biggestComplaint}

🌾 Vibe Check:
${review.vibeCheck}`


  function getProgressPercent(info) {
    const currentPage = Number(info.currentPage)
    const totalPages = Number(info.totalPages)

    if (!totalPages || totalPages <= 0) return 0

    const percent = Math.round((currentPage / totalPages) * 100)
    return Math.min(100, Math.max(0, percent))
  }

  function formatDate(dateString) {
    if (!dateString) return ""

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  function getDaysToRead(reviewItem) {
    if (
      !reviewItem.bookInfo.dateStarted ||
      !reviewItem.bookInfo.dateFinished
    ) {
      return null
    }

    const started = new Date(reviewItem.bookInfo.dateStarted)
    const finished = new Date(reviewItem.bookInfo.dateFinished)

    if (Number.isNaN(started.getTime()) || Number.isNaN(finished.getTime())) {
      return null
    }

    const startedDay = new Date(started.getFullYear(), started.getMonth(), started.getDate())
    const finishedDay = new Date(finished.getFullYear(), finished.getMonth(), finished.getDate())
    const diffMs = finishedDay - startedDay

    if (diffMs < 0) return null

    return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
  }


  function getLocalDateKey(dateValue = new Date()) {
    const date = new Date(dateValue)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  function formatDateKey(dateKey) {
    if (!dateKey) return ""

    return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  function getBookReadingLogs(bookId) {
    const book = savedReviews.find((item) => item.id === bookId)
    const embeddedLogs = book?.readingLogs || []

    if (user) {
      const cloudLogs = readingLogs.filter((log) => log.bookId === bookId)
      return cloudLogs.length > 0 ? cloudLogs : embeddedLogs
    }

    return embeddedLogs
  }

  function getAllReadingLogs() {
    const safeReviews = Array.isArray(savedReviews) ? savedReviews : []
    const safeReadingLogs = Array.isArray(readingLogs) ? readingLogs : []
    const titleByBookId = new Map(
      safeReviews.map((item) => [item.id, item.bookInfo?.title || "Untitled Book"])
    )

    if (user) {
      const cloudBookIds = new Set(safeReadingLogs.map((log) => log.bookId))
      const embeddedLogsWithoutCloudCopies = safeReviews.flatMap((item) => {
        if (cloudBookIds.has(item.id)) return []

        return (item.readingLogs || []).map((log) => ({
          ...log,
          bookId: item.id,
          title: item.bookInfo?.title || "Untitled Book",
        }))
      })

      const cloudLogs = safeReadingLogs.map((log) => ({
        ...log,
        title: titleByBookId.get(log.bookId) || "Untitled Book",
      }))

      return [...cloudLogs, ...embeddedLogsWithoutCloudCopies]
    }

    return safeReviews.flatMap((item) =>
      (item.readingLogs || []).map((log) => ({
        ...log,
        bookId: item.id,
        title: item.bookInfo?.title || "Untitled Book",
      }))
    )
  }
const allReadingLogs = useMemo(() => {
  return getAllReadingLogs()
}, [savedReviews, readingLogs, user])


  function updateReadingGoal(field, value) {
    const cleanValue = value === "" ? "" : Math.max(0, Number(value))
    setReadingGoals({
      ...readingGoals,
      [field]: cleanValue === "" ? "" : String(cleanValue),
    })
  }

  function getGoalPercent(currentValue, goalValue) {
    const goalNumber = Number(goalValue || 0)

    if (!goalNumber) return 0

    return Math.min(100, Math.round((Number(currentValue || 0) / goalNumber) * 100))
  }

  function getReadingGoalStats() {
    const logs = allReadingLogs
    const currentYearKey = String(new Date().getFullYear())
    const logsThisYear = logs.filter((log) => (log.date || "").startsWith(currentYearKey))
    const readingDaysThisYear = new Set(
      logsThisYear.filter((log) => log.date).map((log) => log.date)
    ).size

    const pagesThisYear = logsThisYear.reduce(
      (sum, log) => sum + Number(log.pagesRead || 0),
      0
    )

    const minutesThisYear = logsThisYear.reduce(
      (sum, log) => sum + Number(log.minutesRead || 0),
      0
    )

    const booksFinishedThisYear = finishedReviews.filter((item) =>
      (item.bookInfo.dateFinished || "").startsWith(currentYearKey)
    ).length

    return {
      currentYearKey,
      booksFinishedThisYear,
      pagesThisYear,
      readingDaysThisYear,
      minutesThisYear,
      hoursThisYear: Math.round((minutesThisYear / 60) * 10) / 10,
      booksPercent: getGoalPercent(booksFinishedThisYear, readingGoals.books),
      pagesPercent: getGoalPercent(pagesThisYear, readingGoals.pages),
      readingDaysPercent: getGoalPercent(readingDaysThisYear, readingGoals.readingDays),
      minutesPercent: getGoalPercent(minutesThisYear, readingGoals.minutes),
    }
  }


  function escapeSvgText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  function getWrappedSvgLines(value, maxCharacters = 34, maxLines = 4) {
    const words = String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)

    const lines = []
    let currentLine = ""

    words.forEach((word) => {
      const nextLine = currentLine ? `${currentLine} ${word}` : word

      if (nextLine.length > maxCharacters && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = nextLine
      }
    })

    if (currentLine) lines.push(currentLine)

    if (lines.length > maxLines) {
      const trimmedLines = lines.slice(0, maxLines)
      trimmedLines[maxLines - 1] = `${trimmedLines[maxLines - 1].replace(/\.*$/, "")}...`
      return trimmedLines
    }

    return lines
  }

  function getSafeFileName(value) {
    return String(value || "review-graphic")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "review-graphic"
  }

  function getReviewGraphicOptions() {
    return {
      template: reviewGraphicTemplate,
      size: reviewGraphicSize,
      fields: reviewGraphicFields,
    }
  }

  function toggleReviewGraphicField(fieldName) {
    setReviewGraphicFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }))
  }

  function getReviewGraphicDimensions(size = "square") {
    if (size === "story") return { width: 1080, height: 1920 }
    if (size === "pinterest") return { width: 1000, height: 1500 }
    return { width: 1080, height: 1080 }
  }

  function getReviewGraphicFacts(reviewItem) {
    const title = reviewItem?.bookInfo?.title || "Untitled Book"
    const author = reviewItem?.bookInfo?.author || "Unknown Author"
    const coverUrl = reviewItem?.bookInfo?.coverUrl || ""
    const rating = reviewItem?.bookScore || "0"
    const spice = reviewItem?.metrics?.spice ?? "0"
    const obsession = reviewItem?.obsessionScore ?? "0"
    const quote =
      reviewItem?.review?.oneSentenceReview ||
      reviewItem?.review?.favoriteThing ||
      "No review text yet."
    const vibe = reviewItem?.review?.vibeCheck || "No vibe check added yet."
    const tropeList = (reviewItem?.tropes || []).slice(0, 6)

    return { title, author, coverUrl, rating, spice, obsession, quote, vibe, tropeList }
  }

  function buildReviewGraphicSvg(reviewItem, options = {}) {
    if (!reviewItem) return ""

    const facts = getReviewGraphicFacts(reviewItem)
    const template = options.template || "scrapbook"
    const fields = {
      rating: true,
      spice: true,
      obsession: true,
      review: true,
      vibe: true,
      tropes: true,
      ...(options.fields || {}),
    }
    const { width, height } = getReviewGraphicDimensions(options.size || "square")
    const isTall = height > width
    const topShift = isTall ? 220 : 0
    const bottomY = isTall ? height - 435 : 824
    const footerY = height - 50
    const coverX = 90
    const coverY = 262 + topShift
    const coverW = 280
    const coverH = 390

    const themes = {
      scrapbook: {
        bg: "#221A16",
        paper: "#F5EBDD",
        accent: "#B56B6B",
        gold: "#C29A5A",
        ink: "#2F2420",
        label: "#8A4F2A",
        card: "#F1E4D2",
        footer: "#2F2420",
        footerText: "#F3E9DD",
        lines: 0.72,
      },
      minimal: {
        bg: "#F8F4EE",
        paper: "#FFFFFF",
        accent: "#A49484",
        gold: "#D8C7B1",
        ink: "#2F2420",
        label: "#4B3A32",
        card: "#F5EFE8",
        footer: "#E6DED4",
        footerText: "#4B3A32",
        lines: 0.24,
      },
      dark: {
        bg: "#100C0A",
        paper: "#211915",
        accent: "#B56B6B",
        gold: "#C29A5A",
        ink: "#F3E9DD",
        label: "#C29A5A",
        card: "#2F2420",
        footer: "#C29A5A",
        footerText: "#100C0A",
        lines: 0.22,
      },
      soft: {
        bg: "#F2DCDC",
        paper: "#FFF7EF",
        accent: "#B56B6B",
        gold: "#E8C6B5",
        ink: "#4B3A32",
        label: "#A6546D",
        card: "#FFEDED",
        footer: "#B56B6B",
        footerText: "#FFF7EF",
        lines: 0.48,
      },
    }
    const theme = themes[template] || themes.scrapbook

    const titleLines = getWrappedSvgLines(facts.title, 18, 2)
    const quoteLines = getWrappedSvgLines(facts.quote, 32, 3)
    const vibeLines = getWrappedSvgLines(facts.vibe, 28, 3)
    const tropeText = facts.tropeList.length ? facts.tropeList.join(" • ") : "No tropes selected."
    const tropeLines = getWrappedSvgLines(tropeText, 30, 3)

    const titleSvg = titleLines
      .map((line, index) => `<text x="${width / 2}" y="${150 + topShift + index * 52}" class="title" text-anchor="middle">${escapeSvgText(line)}</text>`)
      .join("")

    const quoteSvg = quoteLines
      .map((line, index) => `<text x="710" y="${650 + topShift + index * 39}" class="handText" text-anchor="middle">${escapeSvgText(line)}</text>`)
      .join("")

    const vibeSvg = vibeLines
      .map((line, index) => `<text x="${width * 0.36}" y="${bottomY + 80 + index * 30}" class="smallText" text-anchor="middle">${escapeSvgText(line)}</text>`)
      .join("")

    const tropeSvg = tropeLines
      .map((line, index) => `<text x="${width * 0.72}" y="${bottomY + 80 + index * 30}" class="smallText" text-anchor="middle">${escapeSvgText(line)}</text>`)
      .join("")

    const coverSvg = facts.coverUrl
      ? `<image href="${escapeSvgText(facts.coverUrl)}" x="${coverX + 18}" y="${coverY + 32}" width="${coverW - 36}" height="${coverH - 80}" preserveAspectRatio="xMidYMid slice" clip-path="url(#coverClip)" />`
      : `<rect x="${coverX + 18}" y="${coverY + 32}" width="${coverW - 36}" height="${coverH - 80}" rx="10" class="coverPlaceholder" />
         <text x="${coverX + coverW / 2}" y="${coverY + 190}" class="placeholderText" text-anchor="middle">No Cover</text>`

    const statItems = []
    if (fields.rating) statItems.push({ label: "RATING", icon: "⭐", value: `${facts.rating}/5` })
    if (fields.spice) statItems.push({ label: "SPICE", icon: "🌶️", value: `${facts.spice}/5` })
    if (fields.obsession) statItems.push({ label: "OBSESSION", icon: "🔥", value: `${facts.obsession}/5` })

    const statStartX = statItems.length === 1 ? 650 : statItems.length === 2 ? 560 : 450
    const statGap = statItems.length === 2 ? 210 : 180
    const statSvg = statItems.map((stat, index) => {
      const x = statStartX + index * statGap
      const y = 372 + topShift
      return `<g>
        <rect x="${x - 72}" y="${y - 52}" width="144" height="172" rx="18" class="statCard" />
        <text x="${x}" y="${y - 14}" class="label" text-anchor="middle">${escapeSvgText(stat.label)}</text>
        <text x="${x}" y="${y + 46}" class="statText" text-anchor="middle">${escapeSvgText(stat.icon)}</text>
        <text x="${x}" y="${y + 98}" class="statText" text-anchor="middle">${escapeSvgText(stat.value)}</text>
      </g>`
    }).join("")

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <clipPath id="coverClip"><rect x="${coverX + 18}" y="${coverY + 32}" width="${coverW - 36}" height="${coverH - 80}" rx="10" /></clipPath>
        <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#000000" flood-opacity="0.22" />
        </filter>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.16" />
        </filter>
        <pattern id="notebookLines" width="${width}" height="38" patternUnits="userSpaceOnUse">
          <line x1="0" y1="37" x2="${width}" y2="37" stroke="${theme.accent}" stroke-opacity="0.16" stroke-width="2" />
        </pattern>
        <pattern id="gridTape" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="${theme.ink}" stroke-opacity="0.14" stroke-width="1.5" />
        </pattern>
        <style>
          .label { font: 800 22px Georgia, serif; fill: ${theme.label}; letter-spacing: 1.8px; text-transform: uppercase; }
          .title { font: 800 46px Georgia, serif; fill: ${theme.ink}; }
          .author { font: 700 24px Georgia, serif; fill: ${theme.ink}; opacity: 0.86; }
          .statText { font: 800 36px Georgia, serif; fill: ${theme.ink}; }
          .handText { font: 500 30px Georgia, serif; fill: ${theme.ink}; font-style: italic; }
          .smallText { font: 600 22px Georgia, serif; fill: ${theme.ink}; }
          .footer { font: 700 17px Georgia, serif; fill: ${theme.footerText}; letter-spacing: 2.5px; }
          .placeholderText { font: 700 28px Georgia, serif; fill: #F3E9DD; }
          .doodle { font: 500 38px Georgia, serif; fill: ${theme.accent}; }
          .coverPlaceholder { fill: #5C524B; }
          .statCard { fill: ${theme.card}; stroke: ${theme.accent}; stroke-opacity: 0.32; stroke-width: 2; }
        </style>
      </defs>

      <rect width="${width}" height="${height}" fill="${theme.bg}" />
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#gridTape)" opacity="0.35" />
      <path d="M70 ${56 + topShift / 3} L${width - 66} ${44 + topShift / 3} L${width - 42} ${height - 46} L66 ${height - 54} L42 ${128 + topShift / 3} Z" fill="${theme.paper}" filter="url(#paperShadow)" />
      <rect x="76" y="${90 + topShift / 3}" width="${width - 152}" height="${height - 170 - topShift / 3}" fill="url(#notebookLines)" opacity="${theme.lines}" />

      <path d="M0 ${height - 238} C118 ${height - 290} 232 ${height - 270} 306 ${height - 176} C356 ${height - 110} 352 ${height - 46} 314 ${height} L0 ${height} Z" fill="${theme.gold}" opacity="0.52" />
      <path d="M${width - 276} 0 L${width} 0 L${width} 156 C${width - 70} 208 ${width - 176} 210 ${width - 238} 140 C${width - 280} 94 ${width - 294} 44 ${width - 276} 0 Z" fill="${theme.accent}" opacity="0.38" />

      <rect x="${width / 2 - 134}" y="${88 + topShift}" width="268" height="46" rx="5" fill="${theme.gold}" opacity="0.62" transform="rotate(-1 ${width / 2} ${111 + topShift})" />
      <text x="${width / 2}" y="${120 + topShift}" class="label" text-anchor="middle">MINI REVIEW</text>
      ${titleSvg}
      <rect x="${width / 2 - 150}" y="${238 + topShift}" width="300" height="44" rx="4" fill="${theme.accent}" opacity="0.28" transform="rotate(-1 ${width / 2} ${260 + topShift})" />
      <text x="${width / 2}" y="${268 + topShift}" class="author" text-anchor="middle">by ${escapeSvgText(facts.author)}</text>

      <g filter="url(#softShadow)" transform="rotate(-2 ${coverX + coverW / 2} ${coverY + coverH / 2})">
        <rect x="${coverX}" y="${coverY}" width="${coverW}" height="${coverH}" rx="14" fill="#EEE0CF" />
        ${coverSvg}
      </g>
      <rect x="${coverX + 54}" y="${coverY - 24}" width="164" height="46" rx="3" fill="${theme.gold}" opacity="0.7" transform="rotate(-4 ${coverX + 136} ${coverY - 1})" />

      ${statSvg}

      ${fields.review ? `
        <text x="710" y="${610 + topShift}" class="label" text-anchor="middle">✧ ONE-SENTENCE REVIEW ✧</text>
        <path d="M424 ${638 + topShift} L948 ${626 + topShift} L962 ${780 + topShift} L434 ${792 + topShift} Z" fill="${theme.card}" stroke="${theme.accent}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="8 7" filter="url(#softShadow)" />
        <text x="466" y="${698 + topShift}" class="doodle" text-anchor="middle">“</text>
        <text x="910" y="${764 + topShift}" class="doodle" text-anchor="middle">”</text>
        ${quoteSvg}
      ` : ""}

      <line x1="90" y1="${bottomY}" x2="${width - 90}" y2="${bottomY}" stroke="${theme.accent}" stroke-opacity="0.34" stroke-width="2" />
      <line x1="${width / 2}" y1="${bottomY}" x2="${width / 2}" y2="${bottomY + 160}" stroke="${theme.accent}" stroke-opacity="0.34" stroke-width="2" stroke-dasharray="6 7" />

      ${fields.vibe ? `<text x="${width * 0.36}" y="${bottomY + 40}" class="label" text-anchor="middle">VIBE CHECK</text>${vibeSvg}` : ""}
      ${fields.tropes ? `<text x="${width * 0.72}" y="${bottomY + 40}" class="label" text-anchor="middle">TROPES I LOVED</text>${tropeSvg}` : ""}

      <rect x="${width / 2 - 250}" y="${footerY - 34}" width="500" height="54" rx="5" fill="${theme.footer}" transform="rotate(-1 ${width / 2} ${footerY - 7})" />
      <text x="${width / 2}" y="${footerY}" class="footer" text-anchor="middle" textLength="330" lengthAdjust="spacingAndGlyphs">READ • RATE • ROMANTICIZE ♡</text>
    </svg>`
  }

  function getReviewGraphicDataUrl(reviewItem, options = {}) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildReviewGraphicSvg(reviewItem, options))}`
  }

  function downloadSvgFile(reviewItem, options = {}) {
    const svg = buildReviewGraphicSvg(reviewItem, options)
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${getSafeFileName(reviewItem?.bookInfo?.title)}-review-graphic.svg`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function downloadReviewGraphicPng(reviewItem, options = {}) {
    const svgUrl = getReviewGraphicDataUrl(reviewItem, options)
    const image = new Image()
    image.crossOrigin = "anonymous"

    image.onload = () => {
      const { width, height } = getReviewGraphicDimensions(options.size || "square")
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext("2d")
      context.drawImage(image, 0, 0)

      const link = document.createElement("a")
      link.download = `${getSafeFileName(reviewItem?.bookInfo?.title)}-review-graphic.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      setSaveMessage("Review graphic downloaded ✨")
    }

    image.onerror = () => {
      setSaveMessage("PNG download had trouble with this cover image. Downloaded an SVG backup instead.")
      downloadSvgFile(reviewItem, options)
    }

    image.src = svgUrl
  }


  function getAchievementGraphicData(achievement = {}, groupTitle = "Achievement") {
    const safeAchievement = achievement && typeof achievement === "object" ? achievement : {}
    const current = Number(safeAchievement.current || 0)
    const target = Number(safeAchievement.target || 0)
    const unlocked = target ? current >= target : true
    const progressPercent = target ? Math.min(100, Math.round((current / target) * 100)) : 100
    const cleanedGroupTitle = String(groupTitle || "Achievement").replace(/^[^A-Za-z0-9]+\s*/, "")

    return {
      icon: safeAchievement.icon || "🏆",
      name: safeAchievement.name || "Achievement Unlocked",
      description: safeAchievement.description || "Unlocked in Pressed Pages.",
      groupTitle: cleanedGroupTitle,
      current,
      target,
      unlocked,
      progressPercent,
    }
  }

  function buildAchievementGraphicSvg(achievement, groupTitle = "Achievement") {
    const data = getAchievementGraphicData(achievement, groupTitle)
    const width = 1080
    const height = 1080
    const nameLines = getWrappedSvgLines(data.name.toUpperCase(), 19, 3)
    const descriptionLines = getWrappedSvgLines(data.description, 34, 4)
    const progressText = data.target
      ? `${Math.min(data.current, data.target)} / ${data.target}`
      : "Unlocked"
    const safeGroupTitle = escapeSvgText(data.groupTitle.toUpperCase())

    const nameSvg = nameLines
      .map((line, index) => `<text x="540" y="${438 + index * 58}" class="badge-title" text-anchor="middle">${escapeSvgText(line)}</text>`)
      .join("")

    const descriptionSvg = descriptionLines
      .map((line, index) => `<text x="540" y="${655 + index * 34}" class="badge-copy" text-anchor="middle">${escapeSvgText(line)}</text>`)
      .join("")

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#2F2420" flood-opacity="0.22" />
          </filter>
          <pattern id="tinyDots" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="8" r="2" fill="#A65434" opacity="0.13" />
            <circle cx="25" cy="24" r="1.6" fill="#4B3A32" opacity="0.10" />
          </pattern>
          <style>
            .kicker { font: 800 30px Georgia, serif; fill: #F3E9DD; letter-spacing: 5px; }
            .label { font: 800 27px Georgia, serif; fill: #A65434; letter-spacing: 4px; }
            .badge-title { font: 900 55px Georgia, serif; fill: #2F2420; letter-spacing: 1px; }
            .badge-copy { font: 500 27px Georgia, serif; fill: #4B3A32; }
            .small { font: 800 24px Georgia, serif; fill: #4B3A32; letter-spacing: 2px; }
            .progress { font: 800 31px Georgia, serif; fill: #2F2420; }
            .footer { font: 700 20px Georgia, serif; fill: #F3E9DD; letter-spacing: 2px; }
          </style>
        </defs>

        <rect width="1080" height="1080" fill="#E6DED4" />
        <rect width="1080" height="1080" fill="url(#tinyDots)" />
        <path d="M76 96 C210 58 336 82 462 62 C611 39 718 91 860 68 C946 54 1004 71 1026 96 L1006 1000 C872 1030 758 1000 629 1022 C486 1046 363 1001 219 1023 C134 1036 87 1015 62 989 Z" fill="#F3E9DD" filter="url(#badgeShadow)" />
        <path d="M91 120 C230 88 333 111 466 91 C612 69 716 117 852 96 C932 84 982 98 1005 118 L986 975 C856 1000 745 973 623 994 C487 1018 369 976 232 997 C150 1009 109 990 86 966 Z" fill="#FFF8EE" opacity="0.58" />

        <rect x="210" y="105" width="660" height="68" rx="7" fill="#2F2420" transform="rotate(-1 540 139)" />
        <text x="540" y="150" class="kicker" text-anchor="middle">ACHIEVEMENT UNLOCKED</text>

        <g transform="rotate(-4 540 277)">
          <rect x="381" y="202" width="318" height="156" rx="22" fill="#C29A5A" opacity="0.25" />
          <rect x="401" y="222" width="278" height="116" rx="18" fill="#A65434" opacity="0.16" />
          <text x="540" y="310" font-size="94" text-anchor="middle">${escapeSvgText(data.icon)}</text>
        </g>

        <text x="540" y="392" class="label" text-anchor="middle">${safeGroupTitle}</text>
        ${nameSvg}

        <line x1="226" y1="575" x2="854" y2="575" stroke="#A65434" stroke-width="4" stroke-opacity="0.28" stroke-dasharray="10 10" />
        ${descriptionSvg}

        <g transform="translate(210 800)">
          <text x="330" y="0" class="small" text-anchor="middle">PROGRESS</text>
          <rect x="0" y="28" width="660" height="42" rx="21" fill="#E6DED4" stroke="#4B3A32" stroke-opacity="0.16" />
          <rect x="0" y="28" width="${Math.max(18, Math.round(660 * data.progressPercent / 100))}" height="42" rx="21" fill="#A65434" opacity="0.82" />
          <text x="330" y="112" class="progress" text-anchor="middle">${escapeSvgText(progressText)} • ${data.progressPercent}%</text>
        </g>

        <g transform="rotate(3 197 218)">
          <rect x="121" y="195" width="152" height="34" rx="4" fill="#B56B6B" opacity="0.48" />
        </g>
        <g transform="rotate(-6 887 849)">
          <rect x="803" y="831" width="168" height="35" rx="4" fill="#7A8C6A" opacity="0.42" />
        </g>
        <text x="165" y="886" font-size="54" opacity="0.38">✦</text>
        <text x="888" y="265" font-size="48" opacity="0.35">♡</text>

        <rect x="290" y="975" width="500" height="54" rx="5" fill="#2F2420" transform="rotate(-1 540 1002)" />
        <text x="540" y="1010" class="footer" text-anchor="middle" textLength="330" lengthAdjust="spacingAndGlyphs">READ • RATE • ROMANTICIZE ♡</text>
      </svg>`
  }

  function getAchievementGraphicDataUrl(achievement, groupTitle = "Achievement") {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildAchievementGraphicSvg(achievement, groupTitle))}`
  }

  function downloadAchievementGraphicSvg(achievement = {}, groupTitle = "Achievement") {
    const data = getAchievementGraphicData(achievement, groupTitle)
    const svg = buildAchievementGraphicSvg(data, groupTitle)
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${getSafeFileName(data.name || "achievement")}-achievement.svg`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function downloadAchievementGraphicPng(achievement = {}, groupTitle = "Achievement") {
    const data = getAchievementGraphicData(achievement, groupTitle)
    const svg = buildAchievementGraphicSvg(data, groupTitle)
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1080
      canvas.height = 1080
      const context = canvas.getContext("2d")

      if (!context) {
        URL.revokeObjectURL(svgUrl)
        downloadAchievementGraphicSvg(data, groupTitle)
        setSaveMessage("PNG download had trouble, so I downloaded an SVG backup instead.")
        return
      }

      context.fillStyle = "#E6DED4"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0)

      const link = document.createElement("a")
      link.download = `${getSafeFileName(data.name || "achievement")}-achievement.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      URL.revokeObjectURL(svgUrl)
      setSaveMessage("Achievement graphic downloaded 🏆")
    }

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl)
      setSaveMessage("PNG download had trouble, so I downloaded an SVG backup instead.")
      downloadAchievementGraphicSvg(data, groupTitle)
    }

    image.src = svgUrl
  }

  function buildReviewCaption(reviewItem, platform = "instagram") {
    if (!reviewItem) return ""

    const facts = getReviewGraphicFacts(reviewItem)
    const ratingLine = `⭐ ${facts.rating}/5  |  🌶️ ${facts.spice}/5  |  🔥 ${facts.obsession}/5`
    const titleLine = `${facts.title} by ${facts.author}`
    const quoteLine = facts.quote ? `"${facts.quote}"` : ""
    const vibeLine = facts.vibe ? `Vibe check: ${facts.vibe}` : ""
    const tropesLine =
      facts.tropeList.length > 0
        ? `Tropes: ${facts.tropeList.join(" • ")}`
        : ""

    if (platform === "story") {
      return [
        titleLine,
        ratingLine,
        quoteLine,
        "",
        "Would you add this to your TBR?",
      ]
        .filter(Boolean)
        .join("\n")
    }

    if (platform === "pinterest") {
      return [
        `${facts.title} book review`,
        ratingLine,
        quoteLine,
        vibeLine,
        tropesLine,
        "",
        "Save this romance book review for your next TBR add.",
        "#romancebooks #bookreview #bookrecommendations #tbr",
      ]
        .filter(Boolean)
        .join("\n")
    }

    if (platform === "facebook") {
      return [
        `I finished ${titleLine} and had thoughts 📚`,
        ratingLine,
        quoteLine,
        vibeLine,
        tropesLine,
        "",
        "Have you read this one yet?",
      ]
        .filter(Boolean)
        .join("\n")
    }

    return [
      `Mini review: ${titleLine}`,
      ratingLine,
      "",
      quoteLine,
      vibeLine,
      tropesLine,
      "",
      "#romancereader #romancebooks #bookreview #kindleunlimited #bookstagram #tbr",
    ]
      .filter(Boolean)
      .join("\n")
  }

  async function copyReviewCaption(reviewItem, platform = reviewCaptionPlatform) {
    const caption = buildReviewCaption(reviewItem, platform)

    try {
      await navigator.clipboard.writeText(caption)
      setSaveMessage("Caption copied to clipboard 📋")
    } catch (error) {
      console.error("Error copying caption:", error)
      setSaveMessage("Could not copy automatically. You can select and copy the caption text manually.")
    }
  }

  function downloadSocialGraphic(reviewItem, size) {
    setReviewGraphicSize(size)
    downloadReviewGraphicPng(reviewItem, {
      ...getReviewGraphicOptions(),
      size,
    })
  }

  function getReadingStreakStats() {
    const logs = allReadingLogs
    const logsByDate = {}

    logs.forEach((log) => {
      if (!log.date) return
      logsByDate[log.date] = (logsByDate[log.date] || 0) + Number(log.pagesRead || 0)
    })

    const loggedDates = Object.keys(logsByDate)
      .filter((date) => logsByDate[date] > 0)
      .sort()

    let longestStreak = 0
    let runningStreak = 0
    let previousDate = null

    loggedDates.forEach((dateKey) => {
      const currentDate = new Date(`${dateKey}T12:00:00`)

      if (!previousDate) {
        runningStreak = 1
      } else {
        const diffDays = Math.round(
          (currentDate - previousDate) / (1000 * 60 * 60 * 24)
        )
        runningStreak = diffDays === 1 ? runningStreak + 1 : 1
      }

      longestStreak = Math.max(longestStreak, runningStreak)
      previousDate = currentDate
    })

    const today = getLocalDateKey()
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = getLocalDateKey(yesterdayDate)
    const lastLoggedDate = loggedDates[loggedDates.length - 1]

    let currentStreak = 0

    if (lastLoggedDate === today || lastLoggedDate === yesterday) {
      currentStreak = 1
      for (let index = loggedDates.length - 2; index >= 0; index -= 1) {
        const newerDate = new Date(`${loggedDates[index + 1]}T12:00:00`)
        const olderDate = new Date(`${loggedDates[index]}T12:00:00`)
        const diffDays = Math.round(
          (newerDate - olderDate) / (1000 * 60 * 60 * 24)
        )

        if (diffDays === 1) {
          currentStreak += 1
        } else {
          break
        }
      }
    }

    return {
      currentStreak: currentStreak >= 2 ? currentStreak : 0,
      longestStreak: longestStreak >= 2 ? longestStreak : 0,
      daysLogged: loggedDates.length,
      pagesLogged: logs.reduce((sum, log) => sum + Number(log.pagesRead || 0), 0),
      lastLoggedDate,
    }
  }


  function shiftCalendarMonth(amount) {
    const [year, month] = calendarMonthKey.split("-").map(Number)
    const nextMonth = new Date(year, month - 1 + amount, 1)
    const nextMonthKey = `${nextMonth.getFullYear()}-${String(
      nextMonth.getMonth() + 1
    ).padStart(2, "0")}`

    setCalendarMonthKey(nextMonthKey)
    setSelectedCalendarDate(`${nextMonthKey}-01`)
  }

  function getReadingCalendarStats(monthKey) {
    const [year, month] = monthKey.split("-").map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const startingWeekday = firstDay.getDay()
    const logs = allReadingLogs

    const bookTitleById = savedReviews.reduce((lookup, item) => {
      lookup[item.id] = item.bookInfo?.title || "Untitled Book"
      return lookup
    }, {})

    const logsByDate = logs.reduce((lookup, log) => {
      if (!log.date || !log.date.startsWith(monthKey)) return lookup

      if (!lookup[log.date]) {
        lookup[log.date] = {
          date: log.date,
          pages: 0,
          minutes: 0,
          sessions: 0,
          books: new Set(),
          logs: [],
        }
      }

      lookup[log.date].pages += Number(log.pagesRead || 0)
      lookup[log.date].minutes += Number(log.minutesRead || 0)
      lookup[log.date].sessions += 1

      if (log.bookId) {
        lookup[log.date].books.add(log.bookId)
      }

      lookup[log.date].logs.push({
        ...log,
        title: bookTitleById[log.bookId] || log.title || "Untitled Book",
      })

      return lookup
    }, {})

    const calendarDays = []

    for (let i = 0; i < startingWeekday; i += 1) {
      calendarDays.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${monthKey}-${String(day).padStart(2, "0")}`
      const dateData = logsByDate[date]

      calendarDays.push({
        date,
        day,
        pages: dateData?.pages || 0,
        minutes: dateData?.minutes || 0,
        sessions: dateData?.sessions || 0,
        bookCount: dateData?.books?.size || 0,
        logs: dateData?.logs || [],
      })
    }

    const monthTotals = Object.values(logsByDate)
    const totalPages = monthTotals.reduce((sum, day) => sum + day.pages, 0)
    const totalMinutes = monthTotals.reduce((sum, day) => sum + day.minutes, 0)

    return {
      monthLabel: firstDay.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      calendarDays,
      selectedDay: calendarDays.find((day) => day?.date === selectedCalendarDate),
      totalDaysRead: monthTotals.length,
      totalPages,
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    }
  }

  function getReadingAnalyticsStats() {
    const logs = allReadingLogs
    const today = new Date()
    const currentYearKey = String(today.getFullYear())
    const currentMonthKey = getLocalDateKey(today).slice(0, 7)

    const logsThisYear = logs.filter((log) => (log.date || "").startsWith(currentYearKey))
    const logsThisMonth = logs.filter((log) => (log.date || "").startsWith(currentMonthKey))

    const sumPages = (items) =>
      items.reduce((sum, log) => sum + Number(log.pagesRead || 0), 0)

    const sumMinutes = (items) =>
      items.reduce((sum, log) => sum + Number(log.minutesRead || 0), 0)

    const buildDateTotals = (items) => {
      const totals = {}

      items.forEach((log) => {
        if (!log.date) return

        if (!totals[log.date]) {
          totals[log.date] = {
            date: log.date,
            pages: 0,
            minutes: 0,
            sessions: 0,
          }
        }

        totals[log.date].pages += Number(log.pagesRead || 0)
        totals[log.date].minutes += Number(log.minutesRead || 0)
        totals[log.date].sessions += 1
      })

      return Object.values(totals).sort((a, b) => a.date.localeCompare(b.date))
    }

    const dateTotals = buildDateTotals(logs)
    const monthDateTotals = buildDateTotals(logsThisMonth)
    const yearDateTotals = buildDateTotals(logsThisYear)
    const biggestReadingDay = [...dateTotals].sort((a, b) => b.pages - a.pages)[0]

    const totalPages = sumPages(logs)
    const totalMinutes = sumMinutes(logs)
    const pagesThisMonth = sumPages(logsThisMonth)
    const pagesThisYear = sumPages(logsThisYear)
    const minutesThisMonth = sumMinutes(logsThisMonth)
    const minutesThisYear = sumMinutes(logsThisYear)

    const finishedThisMonth = finishedReviews.filter((item) =>
      (item.bookInfo.dateFinished || "").startsWith(currentMonthKey)
    )

    const finishedThisYear = finishedReviews.filter((item) =>
      (item.bookInfo.dateFinished || "").startsWith(currentYearKey)
    )

    const finishedWithDays = finishedReviews
      .map((item) => ({ item, days: getDaysToRead(item) }))
      .filter((entry) => entry.days)

    const fastestRead = [...finishedWithDays].sort((a, b) => a.days - b.days)[0]
    const slowestRead = [...finishedWithDays].sort((a, b) => b.days - a.days)[0]

    const averageDaysToFinish = finishedWithDays.length
      ? Math.round(
          (finishedWithDays.reduce((sum, entry) => sum + entry.days, 0) /
            finishedWithDays.length) *
            10
        ) / 10
      : 0

    const averagePagesPerReadingDay = dateTotals.length
      ? Math.round((totalPages / dateTotals.length) * 10) / 10
      : 0

    const averageSessionLength = logs.length && totalMinutes
      ? Math.round((totalMinutes / logs.length) * 10) / 10
      : 0

    const pagesPerHour = totalMinutes
      ? Math.round((totalPages / (totalMinutes / 60)) * 10) / 10
      : 0

    return {
      currentMonthLabel: today.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      currentYearKey,
      readingDaysThisMonth: monthDateTotals.length,
      readingDaysThisYear: yearDateTotals.length,
      pagesThisMonth,
      pagesThisYear,
      totalPages,
      minutesThisMonth,
      minutesThisYear,
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      averagePagesPerReadingDay,
      averageSessionLength,
      pagesPerHour,
      biggestReadingDay,
      finishedThisMonth: finishedThisMonth.length,
      finishedThisYear: finishedThisYear.length,
      averageDaysToFinish,
      fastestRead,
      slowestRead,
      totalSessions: logs.length,
    }
  }



  function getMonthlyWrapUpStats(monthKey) {
    const safeMonthKey = monthKey || getLocalDateKey().slice(0, 7)
    const [yearPart, monthPart] = safeMonthKey.split("-")
    const year = Number(yearPart)
    const monthIndex = Number(monthPart) - 1
    const monthDate = new Date(year, monthIndex, 1)

    const monthLabel = Number.isNaN(monthDate.getTime())
      ? "Selected Month"
      : monthDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })

    const books = finishedReviews.filter((item) =>
      String(item.bookInfo.dateFinished || "").startsWith(safeMonthKey)
    )

    const logs = allReadingLogs.filter((log) =>
      String(log.date || "").startsWith(safeMonthKey)
    )

    const readingDays = new Set(logs.map((log) => log.date).filter(Boolean)).size
    const pagesLogged = logs.reduce((sum, log) => sum + Number(log.pagesRead || 0), 0)
    const minutesLogged = logs.reduce((sum, log) => sum + Number(log.minutesRead || 0), 0)

    const averageRating = books.length
      ? Math.round(
          (books.reduce((sum, item) => sum + Number(item.bookScore || 0), 0) / books.length) *
            10
        ) / 10
      : 0

    const averageSpice = books.length
      ? Math.round(
          (books.reduce((sum, item) => sum + Number(item.metrics?.spice || 0), 0) / books.length) *
            10
        ) / 10
      : 0

    const averageObsession = books.length
      ? Math.round(
          (books.reduce((sum, item) => sum + Number(item.obsessionScore || 0), 0) / books.length) *
            10
        ) / 10
      : 0

    const tropeTotals = {}
    books.forEach((item) => {
      ;(item.tropes || []).forEach((trope) => {
        tropeTotals[trope] = (tropeTotals[trope] || 0) + 1
      })
    })

    const topTrope =
      Object.keys(tropeTotals).length > 0
        ? Object.entries(tropeTotals).sort((a, b) => b[1] - a[1])[0]
        : null

    const authorTotals = {}
    books.forEach((item) => {
      const author = item.bookInfo.author || "Unknown Author"
      authorTotals[author] = (authorTotals[author] || 0) + 1
    })

    const topAuthor =
      Object.keys(authorTotals).length > 0
        ? Object.entries(authorTotals).sort((a, b) => b[1] - a[1])[0]
        : null

    const booksWithDays = books
      .map((item) => ({ item, days: getDaysToRead(item) }))
      .filter((entry) => entry.days)

    const fastestRead = [...booksWithDays].sort((a, b) => a.days - b.days)[0] || null
    const slowestRead = [...booksWithDays].sort((a, b) => b.days - a.days)[0] || null

    const highestRated =
      [...books].sort((a, b) => Number(b.bookScore || 0) - Number(a.bookScore || 0))[0] ||
      null

    const favoriteReads = books.filter((item) => item.isFavorite)

    return {
      monthKey: safeMonthKey,
      monthLabel,
      books,
      booksFinished: books.length,
      readingDays,
      pagesLogged,
      minutesLogged,
      hoursLogged: Math.round((minutesLogged / 60) * 10) / 10,
      averageRating,
      averageSpice,
      averageObsession,
      topTrope,
      topAuthor,
      fastestRead,
      slowestRead,
      highestRated,
      favoriteReads,
    }
  }


  function buildMonthlyWrapUpGraphicSvg(stats = monthlyWrapUpStats) {
    const safeStats = stats || {}
    const width = 1080
    const height = 1080
    const monthLabel = safeStats.monthLabel || "Monthly Wrap-Up"
    const favoriteRead =
      safeStats.highestRated?.bookInfo?.title ||
      safeStats.favoriteReads?.[0]?.bookInfo?.title ||
      "Add a favorite read"
    const favoriteAuthor =
      safeStats.highestRated?.bookInfo?.author ||
      safeStats.favoriteReads?.[0]?.bookInfo?.author ||
      ""
    const topTrope = safeStats.topTrope?.[0] || "No trope yet"
    const topAuthor = safeStats.topAuthor?.[0] || "No author yet"
    const fastestRead = safeStats.fastestRead?.item?.bookInfo?.title || "No fastest read yet"
    const fastestDays = safeStats.fastestRead?.days
    const slowestRead = safeStats.slowestRead?.item?.bookInfo?.title || "No slowest read yet"
    const slowestDays = safeStats.slowestRead?.days
    const favoriteLines = getWrappedSvgLines(favoriteRead, 24, 2)
    const bookLines =
      (safeStats.books || []).slice(0, 5).map((item, index) => {
        const title = getWrappedSvgLines(item.bookInfo?.title || "Untitled Book", 30, 1)[0]
        const rating = item.bookScore ? `${item.bookScore}/5` : "unrated"
        return `<text x="150" y="${806 + index * 39}" font-size="27" fill="#4F3B33">${index + 1}. ${escapeSvgText(title)} • ${escapeSvgText(rating)}</text>`
      }).join("") ||
      `<text x="150" y="806" font-size="27" fill="#4F3B33">No finished books yet</text>`

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="paper" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#FFFDFC"/>
            <stop offset="55%" stop-color="#F7F1E8"/>
            <stop offset="100%" stop-color="#EFE3D4"/>
          </linearGradient>
          <linearGradient id="rose" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#E9CBC3"/>
            <stop offset="100%" stop-color="#B89AA6"/>
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#4F3B33" flood-opacity="0.18"/>
          </filter>
          <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M 42 0 L 0 0 0 42" fill="none" stroke="#7A5D50" stroke-opacity="0.08" stroke-width="2"/>
          </pattern>
        </defs>

        <rect width="1080" height="1080" fill="#F7F1E8"/>
        <rect width="1080" height="1080" fill="url(#grid)" opacity="0.7"/>
        <circle cx="135" cy="120" r="165" fill="#D9B8B0" opacity="0.28"/>
        <circle cx="930" cy="150" r="138" fill="#A8B29A" opacity="0.30"/>
        <circle cx="930" cy="942" r="170" fill="#C8A96A" opacity="0.16"/>

        <rect x="82" y="74" width="916" height="932" rx="46" fill="url(#paper)" stroke="#7A5D50" stroke-opacity="0.28" stroke-width="3" filter="url(#shadow)"/>
        <rect x="420" y="50" width="240" height="52" rx="10" fill="#D9B8B0" opacity="0.72" transform="rotate(-2 540 76)" stroke="#7A5D50" stroke-opacity="0.18"/>

        <text x="540" y="155" text-anchor="middle" font-family="Georgia, serif" font-size="31" letter-spacing="5" fill="#7A5D50">PRESSED PAGES</text>
        <text x="540" y="222" text-anchor="middle" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#4F3B33">${escapeSvgText(monthLabel)}</text>
        <text x="540" y="270" text-anchor="middle" font-family="Georgia, serif" font-size="31" fill="#7A5D50">Monthly Wrap-Up</text>

        <rect x="130" y="322" width="820" height="156" rx="30" fill="#FFFDFC" stroke="#7A5D50" stroke-opacity="0.22"/>
        <text x="178" y="382" font-family="Georgia, serif" font-size="30" fill="#7A5D50">FAVORITE READ</text>
        ${favoriteLines.map((line, index) => `<text x="178" y="${426 + index * 42}" font-family="Georgia, serif" font-size="38" font-weight="700" fill="#4F3B33">${escapeSvgText(line)}</text>`).join("")}
        ${favoriteAuthor ? `<text x="178" y="468" font-family="Georgia, serif" font-size="26" fill="#7A5D50">by ${escapeSvgText(favoriteAuthor)}</text>` : ""}

        <rect x="130" y="520" width="250" height="130" rx="28" fill="#EFE3D4" stroke="#7A5D50" stroke-opacity="0.18"/>
        <text x="255" y="568" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#7A5D50">BOOKS</text>
        <text x="255" y="620" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-weight="700" fill="#4F3B33">${safeStats.booksFinished || 0}</text>

        <rect x="415" y="520" width="250" height="130" rx="28" fill="#EFE3D4" stroke="#7A5D50" stroke-opacity="0.18"/>
        <text x="540" y="568" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#7A5D50">AVG RATING</text>
        <text x="540" y="620" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-weight="700" fill="#4F3B33">${safeStats.averageRating || 0}</text>

        <rect x="700" y="520" width="250" height="130" rx="28" fill="#EFE3D4" stroke="#7A5D50" stroke-opacity="0.18"/>
        <text x="825" y="568" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#7A5D50">AVG SPICE</text>
        <text x="825" y="620" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-weight="700" fill="#4F3B33">${safeStats.averageSpice || 0}</text>

        <rect x="130" y="690" width="820" height="265" rx="32" fill="#FFFDFC" stroke="#7A5D50" stroke-opacity="0.22"/>
        <text x="170" y="748" font-family="Georgia, serif" font-size="28" fill="#7A5D50">FINISHED SHELF</text>
        ${bookLines}
        <text x="590" y="806" font-family="Georgia, serif" font-size="24" fill="#4F3B33">Favorite trope: ${escapeSvgText(topTrope)}</text>
        <text x="590" y="846" font-family="Georgia, serif" font-size="24" fill="#4F3B33">Most read author: ${escapeSvgText(topAuthor)}</text>
        <text x="590" y="886" font-family="Georgia, serif" font-size="24" fill="#4F3B33">Fastest: ${escapeSvgText(fastestRead)}${fastestDays ? ` (${fastestDays}d)` : ""}</text>
        <text x="590" y="926" font-family="Georgia, serif" font-size="24" fill="#4F3B33">Slowest: ${escapeSvgText(slowestRead)}${slowestDays ? ` (${slowestDays}d)` : ""}</text>

        <path d="M795 276 C845 224 913 247 902 320 C894 374 838 408 792 442 C752 405 707 362 716 313 C725 264 767 257 795 276Z" fill="url(#rose)" opacity="0.42"/>
        <path d="M804 288 C823 320 830 356 827 405" fill="none" stroke="#7A5D50" stroke-opacity="0.32" stroke-width="5" stroke-linecap="round"/>
        <path d="M268 214 C241 186 201 199 204 241 C207 279 242 298 270 320 C298 296 328 269 324 235 C320 201 288 199 268 214Z" fill="#A8B29A" opacity="0.38"/>

        <text x="540" y="1000" text-anchor="middle" font-family="Georgia, serif" font-size="25" letter-spacing="3" fill="#7A5D50">READ • RATE • ROMANTICIZE ♡</text>
      </svg>`
  }

  function getMonthlyWrapUpGraphicDataUrl(stats = monthlyWrapUpStats) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildMonthlyWrapUpGraphicSvg(stats))}`
  }

  function downloadMonthlyWrapUpGraphicSvg(stats = monthlyWrapUpStats) {
    const safeStats = stats || {}
    const svg = buildMonthlyWrapUpGraphicSvg(safeStats)
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${getSafeFileName(safeStats.monthLabel || "monthly-wrap-up")}-wrap-up.svg`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function downloadMonthlyWrapUpGraphicPng(stats = monthlyWrapUpStats) {
    const safeStats = stats || {}
    const svg = buildMonthlyWrapUpGraphicSvg(safeStats)
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1080
      canvas.height = 1080
      const context = canvas.getContext("2d")

      if (!context) {
        URL.revokeObjectURL(svgUrl)
        downloadMonthlyWrapUpGraphicSvg(safeStats)
        setSaveMessage("PNG download had trouble, so I downloaded an SVG backup instead.")
        return
      }

      context.fillStyle = "#F7F1E8"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0)

      const link = document.createElement("a")
      link.download = `${getSafeFileName(safeStats.monthLabel || "monthly-wrap-up")}-wrap-up.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      URL.revokeObjectURL(svgUrl)
      setSaveMessage("Monthly wrap-up graphic downloaded 🌙")
    }

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl)
      setSaveMessage("PNG download had trouble, so I downloaded an SVG backup instead.")
      downloadMonthlyWrapUpGraphicSvg(safeStats)
    }

    image.src = svgUrl
  }


  function getYearInBooksStats(yearKey = yearInBooksKey) {
    const safeYearKey = String(yearKey || new Date().getFullYear())
    const books = finishedReviews.filter((item) =>
      String(item.bookInfo.dateFinished || "").startsWith(safeYearKey)
    )
    const logs = allReadingLogs.filter((log) =>
      String(log.date || "").startsWith(safeYearKey)
    )

    const readingDays = new Set(logs.map((log) => log.date).filter(Boolean)).size
    const pagesLogged = logs.reduce((sum, log) => sum + Number(log.pagesRead || 0), 0)
    const minutesLogged = logs.reduce((sum, log) => sum + Number(log.minutesRead || 0), 0)

    const averageRating = books.length
      ? Math.round((books.reduce((sum, item) => sum + Number(item.bookScore || 0), 0) / books.length) * 10) / 10
      : 0

    const averageSpice = books.length
      ? Math.round((books.reduce((sum, item) => sum + Number(item.metrics?.spice || 0), 0) / books.length) * 10) / 10
      : 0

    const averageObsession = books.length
      ? Math.round((books.reduce((sum, item) => sum + Number(item.obsessionScore || 0), 0) / books.length) * 10) / 10
      : 0

    const tropeTotals = {}
    const authorTotals = {}
    const formatTotals = {}
    const monthTotals = {}

    books.forEach((item) => {
      ;(item.tropes || []).forEach((trope) => {
        tropeTotals[trope] = (tropeTotals[trope] || 0) + 1
      })

      const author = item.bookInfo.author || "Unknown Author"
      authorTotals[author] = (authorTotals[author] || 0) + 1

      const format = item.bookInfo.format || "Unknown Format"
      formatTotals[format] = (formatTotals[format] || 0) + 1

      const monthKey = String(item.bookInfo.dateFinished || "").slice(0, 7)
      if (monthKey) monthTotals[monthKey] = (monthTotals[monthKey] || 0) + 1
    })

    const topTrope = Object.entries(tropeTotals).sort((a, b) => b[1] - a[1])[0] || null
    const topAuthor = Object.entries(authorTotals).sort((a, b) => b[1] - a[1])[0] || null
    const topFormat = Object.entries(formatTotals).sort((a, b) => b[1] - a[1])[0] || null
    const bestMonth = Object.entries(monthTotals).sort((a, b) => b[1] - a[1])[0] || null

    const booksWithDays = books
      .map((item) => ({ item, days: getDaysToRead(item) }))
      .filter((entry) => entry.days)

    const fastestRead = [...booksWithDays].sort((a, b) => a.days - b.days)[0] || null
    const longestRead = [...booksWithDays].sort((a, b) => b.days - a.days)[0] || null
    const highestRated = [...books].sort((a, b) => Number(b.bookScore || 0) - Number(a.bookScore || 0))[0] || null
    const brainChemistryReads = books.filter((item) => item.isFavorite)
    const fiveStarReads = books.filter((item) => Number(item.bookScore || 0) >= 5)

    const monthLabels = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Number(safeYearKey), index, 1)
      const key = `${safeYearKey}-${String(index + 1).padStart(2, "0")}`
      return {
        key,
        shortLabel: date.toLocaleDateString("en-US", { month: "short" }),
        count: monthTotals[key] || 0,
      }
    })

    return {
      yearKey: safeYearKey,
      books,
      booksFinished: books.length,
      pagesLogged,
      minutesLogged,
      hoursLogged: Math.round((minutesLogged / 60) * 10) / 10,
      readingDays,
      averageRating,
      averageSpice,
      averageObsession,
      topTrope,
      topAuthor,
      topFormat,
      bestMonth,
      fastestRead,
      longestRead,
      highestRated,
      brainChemistryReads,
      fiveStarReads,
      monthLabels,
    }
  }

  function buildYearInBooksGraphicSvg(stats = yearInBooksStats) {
    const safeStats = stats || {}
    const width = 1080
    const height = 1350
    const favoriteRead =
      safeStats.highestRated?.bookInfo?.title ||
      safeStats.brainChemistryReads?.[0]?.bookInfo?.title ||
      "Add your favorite read"
    const favoriteAuthor =
      safeStats.highestRated?.bookInfo?.author ||
      safeStats.brainChemistryReads?.[0]?.bookInfo?.author ||
      ""
    const topTrope = safeStats.topTrope?.[0] || "No trope yet"
    const topAuthor = safeStats.topAuthor?.[0] || "No author yet"
    const topFormat = safeStats.topFormat?.[0] || "No format yet"
    const bestMonthLabel = safeStats.bestMonth
      ? new Date(Number(String(safeStats.bestMonth[0]).slice(0, 4)), Number(String(safeStats.bestMonth[0]).slice(5, 7)) - 1, 1).toLocaleDateString("en-US", { month: "long" })
      : "No month yet"
    const favoriteLines = getWrappedSvgLines(favoriteRead, 25, 2)
    const maxMonthCount = Math.max(...(safeStats.monthLabels || []).map((month) => month.count), 1)
    const monthBars = (safeStats.monthLabels || []).map((month, index) => {
      const barHeight = Math.max(10, Math.round((month.count / maxMonthCount) * 125))
      const x = 150 + index * 65
      const y = 1030 - barHeight
      return `
        <rect x="${x}" y="${y}" width="34" height="${barHeight}" rx="10" fill="#D9B8B0" opacity="0.86"/>
        <text x="${x + 17}" y="1065" text-anchor="middle" font-size="20" fill="#7A5D50">${escapeSvgText(month.shortLabel)}</text>
        <text x="${x + 17}" y="${y - 10}" text-anchor="middle" font-size="18" fill="#4F3B33">${month.count || ""}</text>`
    }).join("")
    const topBooks = (safeStats.books || []).slice(0, 5).map((item, index) => {
      const title = getWrappedSvgLines(item.bookInfo?.title || "Untitled Book", 31, 1)[0]
      const rating = item.bookScore ? `${item.bookScore}/5` : "unrated"
      return `<text x="150" y="${1195 + index * 36}" font-size="25" fill="#4F3B33">${index + 1}. ${escapeSvgText(title)} • ${escapeSvgText(rating)}</text>`
    }).join("") || `<text x="150" y="1195" font-size="25" fill="#4F3B33">No finished books yet</text>`

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="paperYear" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#FFFDFC"/>
            <stop offset="55%" stop-color="#F7F1E8"/>
            <stop offset="100%" stop-color="#EFE3D4"/>
          </linearGradient>
          <filter id="yearShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#4F3B33" flood-opacity="0.18"/>
          </filter>
          <pattern id="yearGrid" width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M 42 0 L 0 0 0 42" fill="none" stroke="#7A5D50" stroke-opacity="0.08" stroke-width="2"/>
          </pattern>
        </defs>

        <rect width="1080" height="1350" fill="#F7F1E8"/>
        <rect width="1080" height="1350" fill="url(#yearGrid)" opacity="0.75"/>
        <circle cx="140" cy="140" r="170" fill="#D9B8B0" opacity="0.28"/>
        <circle cx="940" cy="180" r="145" fill="#A8B29A" opacity="0.30"/>
        <circle cx="910" cy="1190" r="175" fill="#C8A96A" opacity="0.16"/>

        <rect x="82" y="74" width="916" height="1200" rx="46" fill="url(#paperYear)" stroke="#7A5D50" stroke-opacity="0.28" stroke-width="3" filter="url(#yearShadow)"/>
        <rect x="410" y="50" width="260" height="52" rx="10" fill="#D9B8B0" opacity="0.72" transform="rotate(-2 540 76)" stroke="#7A5D50" stroke-opacity="0.18"/>

        <text x="540" y="155" text-anchor="middle" font-family="Georgia, serif" font-size="31" letter-spacing="5" fill="#7A5D50">PRESSED PAGES</text>
        <text x="540" y="235" text-anchor="middle" font-family="Georgia, serif" font-size="76" font-weight="700" fill="#4F3B33">${escapeSvgText(safeStats.yearKey || "Year")}</text>
        <text x="540" y="286" text-anchor="middle" font-family="Georgia, serif" font-size="32" fill="#7A5D50">Year In Books</text>

        <rect x="130" y="340" width="820" height="165" rx="30" fill="#FFFDFC" stroke="#7A5D50" stroke-opacity="0.22"/>
        <text x="178" y="398" font-family="Georgia, serif" font-size="29" fill="#7A5D50">FAVORITE READ</text>
        ${favoriteLines.map((line, index) => `<text x="178" y="${443 + index * 42}" font-family="Georgia, serif" font-size="38" font-weight="700" fill="#4F3B33">${escapeSvgText(line)}</text>`).join("")}
        ${favoriteAuthor ? `<text x="178" y="484" font-family="Georgia, serif" font-size="26" fill="#7A5D50">by ${escapeSvgText(favoriteAuthor)}</text>` : ""}

        <rect x="130" y="548" width="250" height="130" rx="28" fill="#EFE3D4" stroke="#7A5D50" stroke-opacity="0.18"/>
        <text x="255" y="596" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#7A5D50">BOOKS</text>
        <text x="255" y="648" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-weight="700" fill="#4F3B33">${safeStats.booksFinished || 0}</text>

        <rect x="415" y="548" width="250" height="130" rx="28" fill="#EFE3D4" stroke="#7A5D50" stroke-opacity="0.18"/>
        <text x="540" y="596" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#7A5D50">PAGES</text>
        <text x="540" y="648" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-weight="700" fill="#4F3B33">${safeStats.pagesLogged || 0}</text>

        <rect x="700" y="548" width="250" height="130" rx="28" fill="#EFE3D4" stroke="#7A5D50" stroke-opacity="0.18"/>
        <text x="825" y="596" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#7A5D50">READING DAYS</text>
        <text x="825" y="648" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-weight="700" fill="#4F3B33">${safeStats.readingDays || 0}</text>

        <rect x="130" y="720" width="390" height="190" rx="30" fill="#FFFDFC" stroke="#7A5D50" stroke-opacity="0.22"/>
        <text x="170" y="775" font-family="Georgia, serif" font-size="27" fill="#7A5D50">YEARLY VIBES</text>
        <text x="170" y="823" font-family="Georgia, serif" font-size="25" fill="#4F3B33">Avg rating: ${safeStats.averageRating || 0}/5</text>
        <text x="170" y="860" font-family="Georgia, serif" font-size="25" fill="#4F3B33">Avg spice: ${safeStats.averageSpice || 0}/5</text>
        <text x="170" y="897" font-family="Georgia, serif" font-size="25" fill="#4F3B33">Avg obsession: ${safeStats.averageObsession || 0}/10</text>

        <rect x="560" y="720" width="390" height="190" rx="30" fill="#FFFDFC" stroke="#7A5D50" stroke-opacity="0.22"/>
        <text x="600" y="775" font-family="Georgia, serif" font-size="27" fill="#7A5D50">MOST REACHED FOR</text>
        <text x="600" y="823" font-family="Georgia, serif" font-size="25" fill="#4F3B33">Trope: ${escapeSvgText(topTrope)}</text>
        <text x="600" y="860" font-family="Georgia, serif" font-size="25" fill="#4F3B33">Author: ${escapeSvgText(topAuthor)}</text>
        <text x="600" y="897" font-family="Georgia, serif" font-size="25" fill="#4F3B33">Format: ${escapeSvgText(topFormat)}</text>

        <rect x="130" y="950" width="820" height="155" rx="30" fill="#FFFDFC" stroke="#7A5D50" stroke-opacity="0.22"/>
        <text x="170" y="995" font-family="Georgia, serif" font-size="27" fill="#7A5D50">BOOKS BY MONTH</text>
        ${monthBars}

        <rect x="130" y="1140" width="820" height="170" rx="30" fill="#FFFDFC" stroke="#7A5D50" stroke-opacity="0.22"/>
        <text x="170" y="1178" font-family="Georgia, serif" font-size="26" fill="#7A5D50">TOP SHELF</text>
        ${topBooks}
        <text x="600" y="1195" font-family="Georgia, serif" font-size="23" fill="#4F3B33">Best month: ${escapeSvgText(bestMonthLabel)}</text>
        <text x="600" y="1233" font-family="Georgia, serif" font-size="23" fill="#4F3B33">5-star reads: ${safeStats.fiveStarReads?.length || 0}</text>
        <text x="600" y="1271" font-family="Georgia, serif" font-size="23" fill="#4F3B33">Brain chemistry: ${safeStats.brainChemistryReads?.length || 0}</text>

        <text x="540" y="1325" text-anchor="middle" font-family="Georgia, serif" font-size="25" letter-spacing="3" fill="#7A5D50">READ • RATE • ROMANTICIZE ♡</text>
      </svg>`
  }

  function getYearInBooksGraphicDataUrl(stats = yearInBooksStats) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildYearInBooksGraphicSvg(stats))}`
  }

  function downloadYearInBooksGraphicSvg(stats = yearInBooksStats) {
    const safeStats = stats || {}
    const svg = buildYearInBooksGraphicSvg(safeStats)
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${getSafeFileName(safeStats.yearKey || "year-in-books")}-year-in-books.svg`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function downloadYearInBooksGraphicPng(stats = yearInBooksStats) {
    const safeStats = stats || {}
    const svg = buildYearInBooksGraphicSvg(safeStats)
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1080
      canvas.height = 1350
      const context = canvas.getContext("2d")

      if (!context) {
        URL.revokeObjectURL(svgUrl)
        downloadYearInBooksGraphicSvg(safeStats)
        setSaveMessage("PNG download had trouble, so I downloaded an SVG backup instead.")
        return
      }

      context.fillStyle = "#F7F1E8"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0)

      const link = document.createElement("a")
      link.download = `${getSafeFileName(safeStats.yearKey || "year-in-books")}-year-in-books.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      URL.revokeObjectURL(svgUrl)
      setSaveMessage("Year in Books graphic downloaded 🌸")
    }

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl)
      setSaveMessage("PNG download had trouble, so I downloaded an SVG backup instead.")
      downloadYearInBooksGraphicSvg(safeStats)
    }

    image.src = svgUrl
  }


  function updateProfile(field, value) {
    setProfile({
      ...profile,
      [field]: value,
    })
  }

  function getProfileStatsSnapshot() {
    return {
      booksThisYear: yearToDateCount,
      currentStreak: readingStreakStats.currentStreak,
      longestStreak: readingStreakStats.longestStreak,
      averageRating,
      averageSpice,
      readingDaysThisYear: readingAnalyticsStats.readingDaysThisYear,
      unlockedAchievements: achievementStats.unlocked,
      totalAchievements: achievementStats.total,
    }
  }

  async function saveProfileToCloud(profileToSave = profile) {
    if (!user) return true

    const cleanUsername =
      (profileToSave.username || user.email?.split("@")[0] || "reader")
        .replace(/^@+/, "")
        .trim()
        .toLowerCase()

    if (!cleanUsername) {
      setProfileSavedMessage("Add a username before saving your public profile.")
      return false
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        username: cleanUsername,
        display_name: profileToSave.displayName || user.email?.split("@")[0] || "Pressed Pages Reader",
        avatar_url: profileToSave.avatarUrl || null,
        is_public: Boolean(profileToSave.isPublicProfile),
        profile_data: {
          ...profileToSave,
          username: cleanUsername,
          joinedCommunityChallengeIds: Array.isArray(profileToSave.joinedCommunityChallengeIds)
            ? profileToSave.joinedCommunityChallengeIds
            : Array.isArray(joinedCommunityChallengeIds)
              ? joinedCommunityChallengeIds
              : [],
        },
        stats_data: getProfileStatsSnapshot(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single()

    if (error) {
      setProfileSavedMessage(error.message)
      return false
    }

    setCloudProfileId(data.id)
    return true
  }

  async function saveProfile() {
    localStorage.setItem("pressedPagesProfile", JSON.stringify(profile))

    const savedToCloud = await saveProfileToCloud(profile)
    if (!savedToCloud) return

    setProfileSavedMessage(user ? "Profile saved and synced ✨" : "Profile saved ✨")
  }

  function copyPublicProfileLink() {
    const profilePath = `/u/${cleanProfileUsername}`
    const profileUrl = `${window.location.origin}${profilePath}`

    navigator.clipboard
      .writeText(profileUrl)
      .then(() => {
        setProfileSavedMessage("Public profile link copied 🌸")
      })
      .catch(() => {
        setProfileSavedMessage(`Copy this profile link: ${profileUrl}`)
      })
  }

  function getAchievementStats() {
    const totalPagesLogged = readingAnalyticsStats.totalPages || 0
    const finishedBookCount = finishedReviews.length
    const reviewCount = finishedReviews.length
    const longestReadingStreak = readingStreakStats.longestStreak || 0
    const averageRatingValue = Number(averageRating) || 0
    const averageSpiceValue = Number(averageSpice) || 0

    const countFinishedTropeMatches = (matchers) => {
      const matcherList = Array.isArray(matchers) ? matchers : [matchers]

      return finishedReviews.filter((item) => {
        const itemTropes = Array.isArray(item.tropes) ? item.tropes : []
        return itemTropes.some((trope) => {
          const normalizedTrope = String(trope || "").toLowerCase()
          return matcherList.some((matcher) => normalizedTrope.includes(String(matcher).toLowerCase()))
        })
      }).length
    }

    const finishedAuthorCounts = {}

    finishedReviews.forEach((item) => {
      const author = item.bookInfo.author || "Unknown Author"
      finishedAuthorCounts[author] = (finishedAuthorCounts[author] || 0) + 1
    })

    const authorEraAchievements = Object.entries(finishedAuthorCounts)
      .filter(([author]) => author && author !== "Unknown Author")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([author, count]) => ({
        id: `author-era-${author.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        icon: "📚",
        name: `Author Era: ${author}`,
        description: `Read 10 finished books by ${author}.`,
        current: count,
        target: 10,
      }))

    const achievementGroups = [
      {
        title: "📚 Books Finished",
        achievements: [
          {
            id: "first-chapter",
            icon: "📖",
            name: "First Chapter",
            description: "Finish your first book.",
            current: finishedBookCount,
            target: 1,
          },
          {
            id: "bookworm",
            icon: "🐛",
            name: "Bookworm",
            description: "Finish 10 books.",
            current: finishedBookCount,
            target: 10,
          },
          {
            id: "devourer",
            icon: "🍽️",
            name: "Devourer",
            description: "Finish 25 books.",
            current: finishedBookCount,
            target: 25,
          },
          {
            id: "bibliophile",
            icon: "📚",
            name: "Bibliophile",
            description: "Finish 50 books.",
            current: finishedBookCount,
            target: 50,
          },
          {
            id: "reading-machine",
            icon: "⚙️",
            name: "Reading Machine",
            description: "Finish 100 books.",
            current: finishedBookCount,
            target: 100,
          },
        ],
      },
      {
        title: "🔥 Reading Streaks",
        achievements: [
          {
            id: "just-getting-started",
            icon: "🔥",
            name: "Just Getting Started",
            description: "Log reading 2 days in a row.",
            current: longestReadingStreak,
            target: 2,
          },
          {
            id: "building-momentum",
            icon: "🚂",
            name: "Building Momentum",
            description: "Reach a 7-day reading streak.",
            current: longestReadingStreak,
            target: 7,
          },
          {
            id: "habit-formed",
            icon: "🗓️",
            name: "Habit Formed",
            description: "Reach a 30-day reading streak.",
            current: longestReadingStreak,
            target: 30,
          },
          {
            id: "dedicated-reader",
            icon: "🏆",
            name: "Dedicated Reader",
            description: "Reach a 100-day reading streak.",
            current: longestReadingStreak,
            target: 100,
          },
        ],
      },
      {
        title: "📄 Pages Read",
        achievements: [
          {
            id: "turning-pages",
            icon: "📄",
            name: "Turning Pages",
            description: "Log 1,000 pages read.",
            current: totalPagesLogged,
            target: 1000,
          },
          {
            id: "page-slayer",
            icon: "⚔️",
            name: "Page Slayer",
            description: "Log 5,000 pages read.",
            current: totalPagesLogged,
            target: 5000,
          },
          {
            id: "marathon-reader",
            icon: "🏃‍♀️",
            name: "Marathon Reader",
            description: "Log 10,000 pages read.",
            current: totalPagesLogged,
            target: 10000,
          },
          {
            id: "library-conqueror",
            icon: "🏰",
            name: "Library Conqueror",
            description: "Log 25,000 pages read.",
            current: totalPagesLogged,
            target: 25000,
          },
        ],
      },
      {
        title: "⭐ Reviews",
        achievements: [
          {
            id: "first-thoughts",
            icon: "💭",
            name: "First Thoughts",
            description: "Save your first finished review.",
            current: reviewCount,
            target: 1,
          },
          {
            id: "critic",
            icon: "📝",
            name: "Critic",
            description: "Save 25 finished reviews.",
            current: reviewCount,
            target: 25,
          },
          {
            id: "reviewer-extraordinaire",
            icon: "🌟",
            name: "Reviewer Extraordinaire",
            description: "Save 100 finished reviews.",
            current: reviewCount,
            target: 100,
          },
        ],
      },
      {
        title: "💘 Romance Reader",
        achievements: [
          {
            id: "small-town-sweetheart",
            icon: "🏡",
            name: "Small Town Sweetheart",
            description: "Finish 5 Small Town romances.",
            current: countFinishedTropeMatches("small town"),
            target: 5,
          },
          {
            id: "sunshine-collector",
            icon: "☀️",
            name: "Sunshine Collector",
            description: "Finish 5 Grumpy/Sunshine romances.",
            current: countFinishedTropeMatches(["grumpy", "sunshine"]),
            target: 5,
          },
          {
            id: "found-family-fanatic",
            icon: "👨‍👩‍👧",
            name: "Found Family Fanatic",
            description: "Finish 5 Found Family romances.",
            current: countFinishedTropeMatches("found family"),
            target: 5,
          },
          {
            id: "fake-dating-enthusiast",
            icon: "💌",
            name: "Fake Dating Enthusiast",
            description: "Finish 5 Fake Dating romances.",
            current: countFinishedTropeMatches("fake dating"),
            target: 5,
          },
          {
            id: "spice-enthusiast",
            icon: "🌶️",
            name: "Spice Enthusiast",
            description: "Maintain a 3.0+ average spice rating.",
            current: averageSpiceValue,
            target: 3,
          },
          {
            id: "fire-alarm-activated",
            icon: "🚨",
            name: "Fire Alarm Activated",
            description: "Maintain a 4.0+ average spice rating.",
            current: averageSpiceValue,
            target: 4,
          },
          {
            id: "impossible-standards",
            icon: "⭐",
            name: "Impossible Standards",
            description: "Maintain a 4.5+ average rating.",
            current: averageRatingValue,
            target: 4.5,
          },
        ],
      },
      {
        title: "📚 Repeatable Achievements",
        achievements: authorEraAchievements.length
          ? authorEraAchievements
          : [
              {
                id: "author-era-placeholder",
                icon: "📚",
                name: "Author Era",
                description: "Read 10 finished books by the same author.",
                current: 0,
                target: 10,
              },
            ],
      },
    ]

    const allAchievements = achievementGroups.flatMap((group) => group.achievements)
    const unlockedAchievements = allAchievements.filter(
      (achievement) => Number(achievement.current || 0) >= achievement.target
    )

    return {
      groups: achievementGroups,
      total: allAchievements.length,
      unlocked: unlockedAchievements.length,
      nextAchievement: allAchievements
        .filter((achievement) => Number(achievement.current || 0) < achievement.target)
        .sort((a, b) => {
          const aPercent = a.target ? Number(a.current || 0) / a.target : 0
          const bPercent = b.target ? Number(b.current || 0) / b.target : 0
          return bPercent - aPercent
        })[0],
    }
  }

  const shouldComputeFullStats = [
    "analytics",
    "profile",
    "editProfile",
    "publicProfilePreview",
  ].includes(step)

  const emptyAchievementStats = { groups: [], total: 0, unlocked: 0, nextAchievement: null }
  const emptyReadingCalendarStats = {
    monthLabel: "",
    calendarDays: [],
    selectedDay: null,
    totalDaysRead: 0,
    totalPages: 0,
    totalMinutes: 0,
    totalHours: 0,
  }

  const readingStreakStats = useMemo(() => {
  return getReadingStreakStats()
}, [savedReviews])
  const readingAnalyticsStats = shouldComputeFullStats ? getReadingAnalyticsStats() : {}
const monthlyWrapUpStats = useMemo(() => {
  return shouldComputeFullStats
    ? getMonthlyWrapUpStats(wrapUpMonthKey)
    : {}
}, [shouldComputeFullStats, wrapUpMonthKey, savedReviews])
const yearInBooksStats = useMemo(() => {
  return shouldComputeFullStats
    ? getYearInBooksStats(yearInBooksKey)
    : {}
}, [shouldComputeFullStats, yearInBooksKey, finishedReviews, savedReviews])
  const readingCalendarStats = shouldComputeFullStats ? getReadingCalendarStats(calendarMonthKey) : emptyReadingCalendarStats
  const readingGoalStats = shouldComputeFullStats ? getReadingGoalStats() : { currentYearKey: String(new Date().getFullYear()) }
const achievementStats = useMemo(() => {
  return shouldComputeFullStats ? getAchievementStats() : emptyAchievementStats
}, [shouldComputeFullStats, savedReviews, readingStreakStats])
  const isSelectedReviewOwner = selectedReview ? isReviewOwnedByCurrentUser(selectedReview) : false
  const profileDisplayName =
    profile.displayName || user?.email?.split("@")[0] || "Pressed Pages Reader"
  const cleanProfileUsername =
    (profile.username || "reader").replace(/^@+/, "").trim() || "reader"
  const recentFinishedReads = [...finishedReviews]
    .filter((item) => item.bookInfo.dateFinished)
    .sort(
      (a, b) =>
        new Date(b.bookInfo.dateFinished).getTime() -
        new Date(a.bookInfo.dateFinished).getTime()
    )
    .slice(0, 4)
  const profileFavoriteTrope = profile.favoriteTrope || mostReadTrope?.[0] || "Not chosen yet"
  const profileFavoriteGenre = profile.favoriteGenre || "Not chosen yet"
  const profileFavoriteVibe = profile.favoriteVibe || "Not chosen yet"
  const profileReadingAesthetic = profile.readingAesthetic || "🌸 Scrapbook Reader"
  const profileReaderType = profile.readerType || "📚 TBR Collector"
  const profileFavoriteSubgenre = profile.favoriteSubgenre || profile.favoriteGenre || "🌾 Romance Reader"
  const publicProfilePath = `/u/${cleanProfileUsername}`
  const publicProfileUrl =
    typeof window !== "undefined" ? `${window.location.origin}${publicProfilePath}` : publicProfilePath

  const currentYear = new Date().getFullYear()

  const yearToDateCount = finishedReviews.filter((item) => {
    if (!item.bookInfo.dateFinished) return false

    return new Date(item.bookInfo.dateFinished).getFullYear() === currentYear
  }).length

  const readingProgressPercent = getProgressPercent(bookInfo)

  const dnfReviewText = `🚫 DNF

📖 Book:
${bookInfo.title || "Untitled Book"}

✍️ Author:
${bookInfo.author || "Unknown Author"}

📍 DNF Percent:
${dnfInfo.percent || "Not listed"}%

💬 DNF Reason:
${dnfInfo.reason || "No reason listed"}

🔁 Would Read This Author Again:
${dnfInfo.wouldReadAuthorAgain}`

  const readingReviewText = `📖 Currently Reading

📖 Book:
${bookInfo.title || "Untitled Book"}

✍️ Author:
${bookInfo.author || "Unknown Author"}

📍 Progress:
Page ${bookInfo.currentPage || "0"} of ${bookInfo.totalPages || "?"}

📊 Percent Complete:
${readingProgressPercent}%`

  async function saveReview() {
    const isDnf = bookInfo.status === "DNF"
    const isShelfOnly = bookInfo.status === "Reading" || bookInfo.status === "TBR"
    const reviewId = editingReviewId || crypto.randomUUID()

    const now = new Date().toISOString()

    const bookInfoWithDates = {
      ...bookInfo,
      dateStarted:
        bookInfo.dateStarted ||
        (bookInfo.status === "Reading" || bookInfo.status === "TBR"
          ? now
          : ""),
      dateFinished:
        bookInfo.dateFinished ||
        (bookInfo.status === "Finished"
          ? now
          : ""),
    }

    const reviewToSave = {
      id: reviewId,
      bookInfo: bookInfoWithDates,
      dnfInfo: isDnf ? dnfInfo : null,
      scores: isDnf || isShelfOnly ? null : scores,
      metrics: isDnf || isShelfOnly ? null : metrics,
      review: isDnf || isShelfOnly ? null : review,
      tropes: isDnf || isShelfOnly ? [] : tropes,
      obsessionScore: isDnf || isShelfOnly ? null : obsessionScore,
      recommendationLevel: isDnf || isShelfOnly ? null : recommendationLevel,
      isFavorite: isDnf || isShelfOnly ? false : isFavorite,
      bookScore: isDnf || isShelfOnly ? null : bookScore.toFixed(1),
      miniReviewText: isDnf ? dnfReviewText : isShelfOnly ? readingReviewText : miniReviewText,
      readingLogs: editingReviewId
        ? savedReviews.find((item) => item.id === editingReviewId)?.readingLogs || []
        : [],
      savedAt: editingReviewId
        ? savedReviews.find((item) => item.id === editingReviewId)?.savedAt ||
          new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    let updatedReviews

    if (editingReviewId) {
      updatedReviews = savedReviews.map((item) =>
        item.id === editingReviewId ? reviewToSave : item
      )
      setSaveMessage(
        isDnf
          ? "DNF updated ✨"
          : bookInfo.status === "Reading"
          ? "Reading progress updated ✨"
          : "Review updated ✨"
      )
    } else {
      updatedReviews = [reviewToSave, ...savedReviews]
      setSaveMessage(
        isDnf
          ? "DNF saved to your library ✨"
          : bookInfo.status === "Reading"
          ? "Book added to Currently Reading ✨"
          : bookInfo.status === "TBR"
          ? "Book saved to TBR ✨"
          : "Saved to your local library ✨"
      )
    }

    if (user) {
      const { error } = await supabase
        .from("reviews")
        .upsert({
          id: reviewToSave.id,
          user_id: user.id,
          review_data: reviewToSave,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        setSaveMessage(error.message)
        return
      }

      const activityResult = await createActivityEvent(reviewToSave, Boolean(editingReviewId))
      if (!activityResult?.ok) {
        return
      }
    }

    setSavedReviews(updatedReviews)

    if (!user) {
      localStorage.setItem(
        "brainChemistryBooksReviews",
        JSON.stringify(updatedReviews)
      )
    }

    setSelectedReview(reviewToSave)
  }

  function handleBookInfoNext() {
    if (bookInfo.status === "DNF") {
      setStep("dnf")
    } else if (bookInfo.status === "Reading" || bookInfo.status === "TBR") {
      setStep("readingSummary")
    } else {
      setStep(1)
    }
  }

  async function saveReviewsToStorage(updatedReviews, changedReview, reviewId) {
    setSavedReviews(updatedReviews)

    if (user && changedReview) {
      const { error } = await supabase
        .from("reviews")
        .update({
          review_data: changedReview,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reviewId)
        .eq("user_id", user.id)

      if (error) {
        setSaveMessage(error.message)
        return false
      }

      const activityResult = await createActivityEvent(changedReview, true)
      if (!activityResult?.ok) {
        return false
      }
    }

    if (!user) {
      localStorage.setItem(
        "brainChemistryBooksReviews",
        JSON.stringify(updatedReviews)
      )
    }

    return true
  }


  async function saveReviewBasicChanges() {
    if (!editingReviewId) return

    const existingReview = savedReviews.find((item) => item.id === editingReviewId)

    if (!existingReview) {
      setSaveMessage("Could not find this review to update.")
      return
    }

    const now = new Date().toISOString()
    const cleanedBookInfo = {
      ...existingReview.bookInfo,
      ...bookInfo,
      title: bookInfo.title || existingReview.bookInfo?.title || "",
      author: bookInfo.author || existingReview.bookInfo?.author || "",
      dateStarted:
        bookInfo.dateStarted ||
        (bookInfo.status === "Reading" ? existingReview.bookInfo?.dateStarted || now : existingReview.bookInfo?.dateStarted || ""),
      dateFinished:
        bookInfo.dateFinished ||
        (bookInfo.status === "Finished" ? existingReview.bookInfo?.dateFinished || now : existingReview.bookInfo?.dateFinished || ""),
    }

    const updatedReview = normalizeReviewForDisplay({
      ...existingReview,
      bookInfo: cleanedBookInfo,
      metrics: {
        chemistry: 0,
        tension: 0,
        emotionalDamage: 0,
        bookHangover: 0,
        contentIntensity: 0,
        ...(existingReview.metrics || {}),
        spice: Number(metrics.spice || 0),
      },
      updatedAt: now,
    })

    const updatedReviews = savedReviews.map((item) =>
      item.id === editingReviewId ? updatedReview : item
    )

    const saved = await saveReviewsToStorage(updatedReviews, updatedReview, editingReviewId)

    if (saved) {
      setSelectedReview(updatedReview)
      setSaveMessage("Basic book details saved ✨")
      setStep("viewReview")
    }
  }

  async function logReadingProgress(reviewId) {
    const reviewItem = savedReviews.find((item) => item.id === reviewId)
    if (!reviewItem) return

    const startingPage = Number(reviewItem.bookInfo.currentPage || 0)
    const newCurrentPage = Number(
      progressInputs[reviewId] ?? reviewItem.bookInfo.currentPage ?? 0
    )
    const totalPages = Number(reviewItem.bookInfo.totalPages || 0)
    const minutesReadValue = readingLogMinutesInputs[reviewId]
    const notesValue = readingLogNoteInputs[reviewId] || ""

    if (!newCurrentPage || newCurrentPage <= startingPage) {
      setSaveMessage("Add a higher page number before logging reading.")
      return
    }

    if (totalPages && newCurrentPage > totalPages) {
      setSaveMessage("That page number is higher than the book's total pages.")
      return
    }

    const pagesRead = newCurrentPage - startingPage
    const today = getLocalDateKey()

    if (user) {
      const existingLog = readingLogs.find(
        (log) => log.bookId === reviewId && log.date === today
      )
      let savedLog = null

      if (existingLog) {
        const updates = {
          pages_read: Number(existingLog.pagesRead || 0) + pagesRead,
          end_page: newCurrentPage,
          minutes_read:
            minutesReadValue === "" || minutesReadValue === undefined
              ? existingLog.minutesRead || null
              : Number(existingLog.minutesRead || 0) + Number(minutesReadValue || 0),
          notes: notesValue.trim()
            ? [existingLog.notes, notesValue.trim()].filter(Boolean).join("\n")
            : existingLog.notes || null,
        }

        const { data, error } = await supabase
          .from("reading_logs")
          .update(updates)
          .eq("id", existingLog.id)
          .eq("user_id", user.id)
          .select()
          .single()

        if (error) {
          setSaveMessage(error.message)
          return
        }

        savedLog = {
          id: data.id,
          bookId: data.book_id,
          date: data.log_date,
          pagesRead: data.pages_read,
          endPage: data.end_page,
          minutesRead: data.minutes_read,
          notes: data.notes || "",
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      } else {
        const { data, error } = await supabase
          .from("reading_logs")
          .insert({
            user_id: user.id,
            book_id: reviewId,
            log_date: today,
            pages_read: pagesRead,
            end_page: newCurrentPage,
            minutes_read:
              minutesReadValue === "" || minutesReadValue === undefined
                ? null
                : Number(minutesReadValue || 0),
            notes: notesValue.trim() || null,
          })
          .select()
          .single()

        if (error) {
          setSaveMessage(error.message)
          return
        }

        savedLog = {
          id: data.id,
          bookId: data.book_id,
          date: data.log_date,
          pagesRead: data.pages_read,
          endPage: data.end_page,
          minutesRead: data.minutes_read,
          notes: data.notes || "",
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      }

      const updatedReview = buildUpdatedReadingItem(
        reviewItem,
        newCurrentPage,
        reviewItem.readingLogs || []
      )
      const updatedReviews = savedReviews.map((item) =>
        item.id === reviewId ? updatedReview : item
      )
      const saved = await saveReviewsToStorage(updatedReviews, updatedReview, reviewId)

      if (!saved) return

      setReadingLogs((currentLogs) => {
        const withoutSavedLog = currentLogs.filter((log) => log.id !== savedLog.id)
        return [savedLog, ...withoutSavedLog]
      })
      setProgressInputs({ ...progressInputs, [reviewId]: String(newCurrentPage) })
      setReadingLogMinutesInputs({ ...readingLogMinutesInputs, [reviewId]: "" })
      setReadingLogNoteInputs({ ...readingLogNoteInputs, [reviewId]: "" })
      setSaveMessage(`Logged ${pagesRead} pages for today 🔥`)
      return
    }

    let changedReview = null

    const updatedReviews = savedReviews.map((item) => {
      if (item.id !== reviewId) return item

      const existingLogs = item.readingLogs || []
      const todayLog = existingLogs.find((log) => log.date === today)
      let updatedLogs

      if (todayLog) {
        updatedLogs = existingLogs.map((log) =>
          log.id === todayLog.id
            ? {
                ...log,
                pagesRead: Number(log.pagesRead || 0) + pagesRead,
                endPage: newCurrentPage,
                minutesRead:
                  minutesReadValue === "" || minutesReadValue === undefined
                    ? log.minutesRead || null
                    : Number(log.minutesRead || 0) + Number(minutesReadValue || 0),
                notes: notesValue.trim()
                  ? [log.notes, notesValue.trim()].filter(Boolean).join("\n")
                  : log.notes || "",
                updatedAt: new Date().toISOString(),
              }
            : log
        )
      } else {
        updatedLogs = [
          ...existingLogs,
          {
            id: crypto.randomUUID(),
            date: today,
            pagesRead,
            startPage: startingPage,
            endPage: newCurrentPage,
            minutesRead:
              minutesReadValue === "" || minutesReadValue === undefined
                ? null
                : Number(minutesReadValue || 0),
            notes: notesValue.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
      }

      const updatedItem = buildUpdatedReadingItem(item, newCurrentPage, updatedLogs)
      changedReview = updatedItem
      return updatedItem
    })

    const saved = await saveReviewsToStorage(updatedReviews, changedReview, reviewId)

    if (saved) {
      setProgressInputs({ ...progressInputs, [reviewId]: String(newCurrentPage) })
      setReadingLogMinutesInputs({ ...readingLogMinutesInputs, [reviewId]: "" })
      setReadingLogNoteInputs({ ...readingLogNoteInputs, [reviewId]: "" })
      setSaveMessage(`Logged ${pagesRead} pages for today 🔥`)
    }
  }

  function buildUpdatedReadingItem(item, newCurrentPage, readingLogs) {
    const updatedItem = {
      ...item,
      bookInfo: {
        ...item.bookInfo,
        currentPage: String(newCurrentPage),
      },
      readingLogs,
      updatedAt: new Date().toISOString(),
    }

    const percent = getProgressPercent(updatedItem.bookInfo)
    updatedItem.miniReviewText = `📖 Currently Reading

📖 Book:
${updatedItem.bookInfo.title || "Untitled Book"}

✍️ Author:
${updatedItem.bookInfo.author || "Unknown Author"}

📍 Progress:
Page ${updatedItem.bookInfo.currentPage || "0"} of ${updatedItem.bookInfo.totalPages || "?"}

📊 Percent Complete:
${percent}%`

    return updatedItem
  }

  function stageReadingLogEdit(reviewId, logId, field, value) {
    const draftKey = `${reviewId}-${logId}`

    setReadingLogDrafts((currentDrafts) => ({
      ...currentDrafts,
      [draftKey]: {
        ...(currentDrafts[draftKey] || {}),
        [field]: value,
      },
    }))

    setReadingLogDirty((currentDirty) => ({
      ...currentDirty,
      [draftKey]: true,
    }))

    setSaveMessage("You have unsaved reading log edits.")
  }

  async function saveReadingLogEdits(reviewId, logId) {
    const draftKey = `${reviewId}-${logId}`
    const draft = readingLogDrafts[draftKey]

    if (!readingLogDirty[draftKey] || !draft) {
      setSaveMessage("No reading log edits to save.")
      return
    }

    if (user) {
      const updates = {}

      if (draft.date !== undefined) updates.log_date = draft.date
      if (draft.pagesRead !== undefined) updates.pages_read = Number(draft.pagesRead || 0)
      if (draft.endPage !== undefined) updates.end_page = Number(draft.endPage || 0)
      if (draft.minutesRead !== undefined) {
        updates.minutes_read = draft.minutesRead === "" ? null : Number(draft.minutesRead || 0)
      }
      if (draft.notes !== undefined) updates.notes = draft.notes

      const { data, error } = await supabase
        .from("reading_logs")
        .update(updates)
        .eq("id", logId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        setSaveMessage(error.message)
        return
      }

      const savedLog = {
        id: data.id,
        bookId: data.book_id,
        date: data.log_date,
        pagesRead: data.pages_read,
        endPage: data.end_page,
        minutesRead: data.minutes_read,
        notes: data.notes || "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      const nextReadingLogs = readingLogs.map((log) =>
        log.id === logId ? savedLog : log
      )
      setReadingLogs(nextReadingLogs)

      const reviewItem = savedReviews.find((item) => item.id === reviewId)
      const maxEndPage = Math.max(
        0,
        ...nextReadingLogs
          .filter((log) => log.bookId === reviewId)
          .map((log) => Number(log.endPage || 0))
      )

      if (reviewItem && String(maxEndPage) !== String(reviewItem.bookInfo.currentPage || 0)) {
        const updatedReview = buildUpdatedReadingItem(
          reviewItem,
          maxEndPage,
          reviewItem.readingLogs || []
        )
        const updatedReviews = savedReviews.map((item) =>
          item.id === reviewId ? updatedReview : item
        )
        await saveReviewsToStorage(updatedReviews, updatedReview, reviewId)
        setProgressInputs({ ...progressInputs, [reviewId]: String(maxEndPage) })
      }

      setReadingLogDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts }
        delete nextDrafts[draftKey]
        return nextDrafts
      })

      setReadingLogDirty((currentDirty) => {
        const nextDirty = { ...currentDirty }
        delete nextDirty[draftKey]
        return nextDirty
      })

      setSaveMessage("Reading log edits saved ✅")
      return
    }

    let changedReview = null

    const updatedReviews = savedReviews.map((item) => {
      if (item.id !== reviewId) return item

      const updatedLogs = (item.readingLogs || []).map((log) => {
        if (log.id !== logId) return log

        return {
          ...log,
          ...draft,
          pagesRead:
            draft.pagesRead !== undefined
              ? Number(draft.pagesRead)
              : Number(log.pagesRead || 0),
          endPage:
            draft.endPage !== undefined
              ? Number(draft.endPage)
              : Number(log.endPage || 0),
          minutesRead:
            draft.minutesRead !== undefined
              ? draft.minutesRead === ""
                ? null
                : Number(draft.minutesRead || 0)
              : log.minutesRead || null,
          notes: draft.notes !== undefined ? draft.notes : log.notes || "",
          updatedAt: new Date().toISOString(),
        }
      })

      const maxEndPage = Math.max(
        0,
        ...updatedLogs.map((log) => Number(log.endPage || 0))
      )
      changedReview = buildUpdatedReadingItem(item, maxEndPage, updatedLogs)

      return changedReview
    })

    const saved = await saveReviewsToStorage(updatedReviews, changedReview, reviewId)
    if (saved) {
      setReadingLogDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts }
        delete nextDrafts[draftKey]
        return nextDrafts
      })

      setReadingLogDirty((currentDirty) => {
        const nextDirty = { ...currentDirty }
        delete nextDirty[draftKey]
        return nextDirty
      })

      setSaveMessage("Reading log edits saved ✅")
    }
  }

  async function deleteReadingLog(reviewId, logId) {
    const confirmed = window.confirm("Delete this reading log?")
    if (!confirmed) return

    if (user) {
      const { error } = await supabase
        .from("reading_logs")
        .delete()
        .eq("id", logId)
        .eq("user_id", user.id)

      if (error) {
        setSaveMessage(error.message)
        return
      }

      const nextReadingLogs = readingLogs.filter((log) => log.id !== logId)
      setReadingLogs(nextReadingLogs)

      const reviewItem = savedReviews.find((item) => item.id === reviewId)
      const maxEndPage = Math.max(
        0,
        ...nextReadingLogs
          .filter((log) => log.bookId === reviewId)
          .map((log) => Number(log.endPage || 0))
      )

      if (reviewItem) {
        const updatedReview = buildUpdatedReadingItem(
          reviewItem,
          maxEndPage,
          reviewItem.readingLogs || []
        )
        const updatedReviews = savedReviews.map((item) =>
          item.id === reviewId ? updatedReview : item
        )
        await saveReviewsToStorage(updatedReviews, updatedReview, reviewId)
        setProgressInputs({ ...progressInputs, [reviewId]: String(maxEndPage) })
      }

      const draftKey = `${reviewId}-${logId}`
      setReadingLogDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts }
        delete nextDrafts[draftKey]
        return nextDrafts
      })
      setReadingLogDirty((currentDirty) => {
        const nextDirty = { ...currentDirty }
        delete nextDirty[draftKey]
        return nextDirty
      })
      setSaveMessage("Reading log deleted.")
      return
    }

    let changedReview = null

    const updatedReviews = savedReviews.map((item) => {
      if (item.id !== reviewId) return item

      const updatedLogs = (item.readingLogs || []).filter((log) => log.id !== logId)
      const newCurrentPage = Math.max(
        0,
        ...updatedLogs.map((log) => Number(log.endPage || 0))
      )

      changedReview = buildUpdatedReadingItem(item, newCurrentPage, updatedLogs)
      return changedReview
    })

    const saved = await saveReviewsToStorage(updatedReviews, changedReview, reviewId)
    if (saved) {
      const draftKey = `${reviewId}-${logId}`
      setProgressInputs({ ...progressInputs, [reviewId]: String(changedReview?.bookInfo?.currentPage || 0) })
      setReadingLogDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts }
        delete nextDrafts[draftKey]
        return nextDrafts
      })
      setReadingLogDirty((currentDirty) => {
        const nextDirty = { ...currentDirty }
        delete nextDirty[draftKey]
        return nextDirty
      })
      setSaveMessage("Reading log deleted.")
    }
  }


  async function migrateEmbeddedReadingLogsToCloud() {
    if (!user) {
      setSaveMessage("Log in before migrating reading logs.")
      return
    }

    const embeddedLogsToUpload = savedReviews.flatMap((item) =>
      (item.readingLogs || []).map((log) => ({
        id: log.id,
        user_id: user.id,
        book_id: item.id,
        log_date: log.date,
        pages_read: Number(log.pagesRead || 0),
        end_page: log.endPage === undefined ? null : Number(log.endPage || 0),
        minutes_read:
          log.minutesRead === undefined || log.minutesRead === ""
            ? null
            : Number(log.minutesRead || 0),
        notes: log.notes || null,
        created_at: log.createdAt || new Date().toISOString(),
        updated_at: log.updatedAt || new Date().toISOString(),
      }))
    )

    if (embeddedLogsToUpload.length === 0) {
      setSaveMessage("No embedded reading logs found to move.")
      return
    }

    const { data, error } = await supabase
      .from("reading_logs")
      .upsert(embeddedLogsToUpload)
      .select()

    if (error) {
      setSaveMessage(error.message)
      return
    }

    const updatedReviews = savedReviews.map((item) => ({
      ...item,
      readingLogs: [],
      updatedAt: new Date().toISOString(),
    }))

    const reviewRows = updatedReviews.map((item) => ({
      id: item.id,
      user_id: user.id,
      review_data: item,
      updated_at: new Date().toISOString(),
    }))

    const { error: reviewError } = await supabase
      .from("reviews")
      .upsert(reviewRows)

    if (reviewError) {
      setSaveMessage(reviewError.message)
      return
    }

    const movedLogs = (data || []).map((row) => ({
      id: row.id,
      bookId: row.book_id,
      date: row.log_date,
      pagesRead: row.pages_read,
      endPage: row.end_page,
      minutesRead: row.minutes_read,
      notes: row.notes || "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    setSavedReviews(updatedReviews)
    setReadingLogs((currentLogs) => {
      const movedIds = new Set(movedLogs.map((log) => log.id))
      return [...movedLogs, ...currentLogs.filter((log) => !movedIds.has(log.id))]
    })
    setSaveMessage(`Moved ${embeddedLogsToUpload.length} reading logs to the Supabase reading_logs table ✅`)
  }

  async function migrateLocalReviewsToCloud() {
    if (!user) {
      setSaveMessage("Log in before migrating reviews.")
      return
    }

    const saved = localStorage.getItem("brainChemistryBooksReviews")
    const localReviews = saved ? JSON.parse(saved) : []

    if (localReviews.length === 0) {
      setSaveMessage("No local reviews found to migrate.")
      return
    }

    const reviewsToUpload = localReviews.map((item) => {
      const reviewId =
        typeof item.id === "string" && item.id.includes("-")
          ? item.id
          : crypto.randomUUID()

      const reviewData = {
        ...item,
        id: reviewId,
        updatedAt: new Date().toISOString(),
      }

      return {
        id: reviewId,
        user_id: user.id,
        review_data: reviewData,
        updated_at: new Date().toISOString(),
      }
    })

    const { error } = await supabase
      .from("reviews")
      .upsert(reviewsToUpload)

    if (error) {
      setSaveMessage(error.message)
      return
    }

    localStorage.removeItem("brainChemistryBooksReviews")
    setSaveMessage("Local reviews migrated to your account ✨")
    await loadCloudReviews(user)
  }

  async function loadCloudReadingLogs(currentUser) {
    const { data, error } = await supabase
      .from("reading_logs")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("log_date", { ascending: false })

    if (error) {
      setSaveMessage(error.message)
      return
    }

    const cloudReadingLogs = (data || []).map((row) => ({
      id: row.id,
      bookId: row.book_id,
      date: row.log_date,
      pagesRead: row.pages_read,
      endPage: row.end_page,
      minutesRead: row.minutes_read,
      notes: row.notes || "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    setReadingLogs(cloudReadingLogs)
  }

  async function loadFollowStats(targetUserId, currentUser = user) {
    if (!targetUserId) return

    const [followersResult, followingResult] = await Promise.all([
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", targetUserId),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", targetUserId),
    ])

    let isFollowing = false

    if (currentUser && currentUser.id !== targetUserId) {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", targetUserId)
        .maybeSingle()

      isFollowing = Boolean(data)
    }

    setFollowStats({
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
      isFollowing,
    })
  }

  async function loadCloudProfile(currentUser) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle()

    if (error) {
      setProfileSavedMessage(error.message)
      return
    }

    if (data) {
      setCloudProfileId(data.id)
      const cloudProfile = data.profile_data || {}
      setProfile({
        displayName: cloudProfile.displayName || data.display_name || "",
        username: cloudProfile.username || data.username || "",
        bio: cloudProfile.bio || "",
        favoriteGenre: cloudProfile.favoriteGenre || "",
        favoriteTrope: cloudProfile.favoriteTrope || "",
        favoriteVibe: cloudProfile.favoriteVibe || "",
        avatarUrl: cloudProfile.avatarUrl || data.avatar_url || "",
        readingAesthetic: cloudProfile.readingAesthetic || "",
        readerType: cloudProfile.readerType || "",
        favoriteSubgenre: cloudProfile.favoriteSubgenre || "",
        isPublicProfile: Boolean(cloudProfile.isPublicProfile ?? data.is_public),
      })

      if (Array.isArray(cloudProfile.joinedCommunityChallengeIds)) {
        setJoinedCommunityChallengeIds((currentIds) => {
          const mergedIds = Array.from(new Set([
            ...(Array.isArray(currentIds) ? currentIds : []),
            ...cloudProfile.joinedCommunityChallengeIds,
          ]))
          return mergedIds
        })
      }
    }

    await loadFollowStats(currentUser.id, currentUser)
  }

  async function loadPublicProfileByUsername(username, currentUser = user) {
    const cleanUsername = String(username || "").replace(/^@+/, "").trim().toLowerCase()
    if (!cleanUsername) return

    setPublicProfileLoading(true)
    setPublicProfileMessage("")

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", cleanUsername)
      .eq("is_public", true)
      .maybeSingle()

    if (error) {
      setPublicProfileMessage(error.message)
      setPublicProfileView(null)
      setPublicProfileBooks([])
      setPublicProfileLoading(false)
      return
    }

    if (!data) {
      setPublicProfileMessage("This public profile could not be found, or it is private.")
      setPublicProfileView(null)
      setPublicProfileBooks([])
      setPublicProfileLoading(false)
      return
    }

    setPublicProfileView({
      userId: data.user_id,
      username: data.username,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      profileData: data.profile_data || {},
      statsData: data.stats_data || {},
    })

    const { data: publicReviews, error: publicReviewsError } = await supabase
      .from("reviews")
      .select("id, review_data, updated_at")
      .eq("user_id", data.user_id)
      .order("updated_at", { ascending: false })

    if (publicReviewsError) {
      setPublicProfileBooks([])
      setPublicProfileMessage(`Profile loaded, but shelves could not load: ${publicReviewsError.message}`)
    } else {
      setPublicProfileBooks(
        (publicReviews || [])
          .map((row) => ({ ...(row.review_data || {}), id: row.id, user_id: data.user_id }))
          .filter((item) => item.bookInfo?.title)
      )
    }

    await loadFollowStats(data.user_id, currentUser)
    setPublicProfileLoading(false)
  }

  async function toggleFollowPublicProfile() {
    if (!user) {
      setPublicProfileMessage("Log in to follow this reader.")
      return
    }

    if (!publicProfileView?.userId || publicProfileView.userId === user.id) return

    if (followStats.isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", publicProfileView.userId)

      if (error) {
        setPublicProfileMessage(error.message)
        return
      }

      setFollowStats((current) => ({
        ...current,
        followers: Math.max(0, Number(current.followers || 0) - 1),
        isFollowing: false,
      }))
      setPublicProfileMessage(`Unfollowed @${publicProfileView.username}.`)
      return
    }

    const { error } = await supabase
      .from("follows")
      .insert({
        follower_id: user.id,
        following_id: publicProfileView.userId,
      })

    if (error) {
      setPublicProfileMessage(error.message)
      return
    }

    setFollowStats((current) => ({
      ...current,
      followers: Number(current.followers || 0) + 1,
      isFollowing: true,
    }))
    setPublicProfileMessage(`Following @${publicProfileView.username} 🌸`)
  }

  function getActivityTypeForReview(reviewItem, wasEditing = false) {
    const status = reviewItem?.bookInfo?.status

    if (status === "Finished") return wasEditing ? "updated_finished_book" : "finished_book"
    if (status === "Reading") return wasEditing ? "updated_current_read" : "started_book"
    if (status === "TBR") return wasEditing ? "updated_tbr_book" : "added_tbr_book"
    if (status === "DNF") return wasEditing ? "updated_dnf_book" : "dnf_book"

    return wasEditing ? "updated_book" : "added_book"
  }

  function getActivityLabel(eventType) {
    const labels = {
      finished_book: "finished a book",
      updated_finished_book: "updated a finished book",
      started_book: "started reading",
      updated_current_read: "updated a current read",
      added_tbr_book: "added a book to TBR",
      updated_tbr_book: "updated a TBR book",
      dnf_book: "DNF’d a book",
      updated_dnf_book: "updated a DNF",
      added_book: "added a book",
      updated_book: "updated a book",
    }

    return labels[eventType] || "shared a reading update"
  }

  function getActivityIcon(eventType) {
    if (eventType.includes("finished")) return "✅"
    if (eventType.includes("started") || eventType.includes("current")) return "📖"
    if (eventType.includes("tbr")) return "🌙"
    if (eventType.includes("dnf")) return "🚫"
    return "🌸"
  }

  async function createActivityEvent(reviewItem, wasEditing = false) {
    if (!user || !reviewItem?.id) {
      const message = "Activity feed error: no logged-in user or review ID was available."
      setSaveMessage(message)
      setActivityFeedMessage(message)
      return { ok: false, error: message }
    }

    const eventType = getActivityTypeForReview(reviewItem, wasEditing)
    const eventData = {
      title: reviewItem.bookInfo?.title || "Untitled Book",
      author: reviewItem.bookInfo?.author || "Unknown Author",
      coverUrl: reviewItem.bookInfo?.coverUrl || "",
      status: reviewItem.bookInfo?.status || "",
      rating: reviewItem.bookScore || null,
      spice: reviewItem.metrics?.spice || null,
      obsession: reviewItem.obsessionScore || null,
      isFavorite: Boolean(reviewItem.isFavorite),
      oneSentenceReview: reviewItem.review?.oneSentenceReview || "",
      dateFinished: reviewItem.bookInfo?.dateFinished || "",
    }

    const activityPayload = {
      user_id: user.id,
      event_type: eventType,
      book_id: String(reviewItem.id),
      event_data: eventData,
    }

    const { error } = await supabase
      .from("activity_feed")
      .insert(activityPayload)

    if (error) {
      const message = `Activity feed error: ${error.message}`
      console.error(message, error, activityPayload)
      setActivityFeedMessage(message)
      setSaveMessage(message)
      return { ok: false, error: message }
    }

    await loadActivityFeed(user)
    return { ok: true }
  }

  async function loadActivityFeed(currentUser = user) {
    if (!currentUser) {
      setActivityFeed([])
      setActivityFeedMessage("Log in to see your friends’ reading activity.")
      return
    }

    setActivityFeedLoading(true)
    setActivityFeedMessage("")

    const { data: followingRows, error: followingError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUser.id)

    if (followingError) {
      setActivityFeedMessage(followingError.message)
      setActivityFeedLoading(false)
      return
    }

    const followingIds = (followingRows || []).map((row) => row.following_id).filter(Boolean)
    const feedUserIds = Array.from(new Set([currentUser.id, ...followingIds]))

    if (!feedUserIds.length) {
      setActivityFeed([])
      setActivityFeedLoading(false)
      return
    }

    const { data: events, error: eventsError } = await supabase
      .from("activity_feed")
      .select("*")
      .in("user_id", feedUserIds)
      .order("created_at", { ascending: false })
      .limit(40)

    if (eventsError) {
      setActivityFeedMessage(eventsError.message)
      setActivityFeedLoading(false)
      return
    }

    const eventIds = (events || []).map((event) => event.id).filter(Boolean)

    let activityLikeRows = []
    if (eventIds.length > 0) {
      const { data: likesData, error: likesError } = await supabase
        .from("activity_likes")
        .select("activity_id, user_id")
        .in("activity_id", eventIds)

      if (likesError) {
        setActivityFeedMessage(`Likes error: ${likesError.message}`)
      } else {
        activityLikeRows = likesData || []
      }
    }

    const activityLikeCounts = activityLikeRows.reduce((counts, like) => {
      counts[like.activity_id] = (counts[like.activity_id] || 0) + 1
      return counts
    }, {})

    const likedActivityIds = new Set(
      activityLikeRows
        .filter((like) => like.user_id === currentUser.id)
        .map((like) => like.activity_id)
    )

    const { data: profileRows, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url, profile_data")
      .in("user_id", feedUserIds)

    if (profilesError) {
      setActivityFeedMessage(profilesError.message)
    }

    const profileMap = new Map((profileRows || []).map((row) => [row.user_id, row]))

    setActivityFeed(
      (events || []).map((event) => ({
        ...event,
        readerProfile: profileMap.get(event.user_id) || null,
        isOwnActivity: event.user_id === currentUser.id,
        likeCount: activityLikeCounts[event.id] || 0,
        hasLiked: likedActivityIds.has(event.id),
      }))
    )
    setActivityFeedLoading(false)
  }

  async function toggleActivityLike(activityEvent) {
    if (!user || !activityEvent?.id) {
      setActivityFeedMessage("Log in to like reading updates.")
      return
    }

    const alreadyLiked = Boolean(activityEvent.hasLiked)

    setActivityFeed((currentFeed) =>
      currentFeed.map((event) =>
        event.id === activityEvent.id
          ? {
              ...event,
              hasLiked: !alreadyLiked,
              likeCount: Math.max(0, Number(event.likeCount || 0) + (alreadyLiked ? -1 : 1)),
            }
          : event
      )
    )

    if (alreadyLiked) {
      const { error } = await supabase
        .from("activity_likes")
        .delete()
        .eq("activity_id", activityEvent.id)
        .eq("user_id", user.id)

      if (error) {
        setActivityFeedMessage(`Unlike error: ${error.message}`)
        await loadActivityFeed(user)
      }
      return
    }

    const { error } = await supabase
      .from("activity_likes")
      .insert({
        activity_id: activityEvent.id,
        user_id: user.id,
      })

    if (error) {
      setActivityFeedMessage(`Like error: ${error.message}`)
      await loadActivityFeed(user)
    }
  }

  async function loadCloudReviews(currentUser) {
    setIsLibraryLoading(true)

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("updated_at", { ascending: false })

    if (error) {
      setSaveMessage(error.message)
      setIsLibraryLoading(false)
      return
    }

    const cloudReviews = (Array.isArray(data) ? data : []).map((row) =>
      normalizeReviewForDisplay({
        ...row.review_data,
        id: row.id,
      })
    )

    setSavedReviews(cloudReviews)
    setIsLibraryLoading(false)
  }

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)

    if (user) {
      await Promise.all([loadCloudReviews(user), loadCloudReadingLogs(user)])
      loadCloudProfile(user)
      if (step === "activityFeed") loadActivityFeed(user)
    } else {
      setSavedReviews(loadLocalSavedReviews())
      setReadingLogs([])
      setIsLibraryLoading(false)
    }
  }

  function getReadingHeatMapStats(daysBack = 90) {
    const logs = allReadingLogs
    const logsByDate = {}

    logs.forEach((log) => {
      if (!log.date) return

      if (!logsByDate[log.date]) {
        logsByDate[log.date] = {
          sessions: 0,
          pages: 0,
          minutes: 0,
        }
      }

      logsByDate[log.date].sessions += 1
      logsByDate[log.date].pages += Number(log.pagesRead || 0)
      logsByDate[log.date].minutes += Number(log.minutesRead || 0)
    })

    const today = new Date()
    today.setHours(12, 0, 0, 0)

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - (daysBack - 1))

    const leadingBlanks = startDate.getDay()
    const days = []

    for (let index = 0; index < leadingBlanks; index += 1) {
      days.push(null)
    }

    let readingDayCount = 0
    let totalSessions = 0
    let totalPages = 0
    let totalMinutes = 0

    for (let index = 0; index < daysBack; index += 1) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + index)

      const dateKey = getLocalDateKey(currentDate)
      const dateData = logsByDate[dateKey] || {
        sessions: 0,
        pages: 0,
        minutes: 0,
      }

      if (dateData.sessions > 0) {
        readingDayCount += 1
      }

      totalSessions += dateData.sessions
      totalPages += dateData.pages
      totalMinutes += dateData.minutes

      days.push({
        date: dateKey,
        sessions: dateData.sessions,
        pages: dateData.pages,
        minutes: dateData.minutes,
      })
    }

    return {
      days,
      daysBack,
      readingDayCount,
      totalSessions,
      totalPages,
      totalMinutes,
      consistencyPercent: daysBack
        ? Math.round((readingDayCount / daysBack) * 100)
        : 0,
    }
  }


  function getShelfBooks(bookList, shelfType) {
    const list = Array.isArray(bookList) ? bookList : []

    if (shelfType === "reading") {
      return list.filter((item) => item.bookInfo?.status === "Reading")
    }

    if (shelfType === "read") {
      return list.filter((item) => item.bookInfo?.status === "Finished")
    }

    if (shelfType === "tbr") {
      return list.filter((item) => item.bookInfo?.status === "TBR")
    }

    if (shelfType === "favorites") {
      return list.filter((item) => item.isFavorite)
    }

    return list
  }

  function getShelfStats(bookList) {
    const list = Array.isArray(bookList) ? bookList : []
    return {
      reading: list.filter((item) => item.bookInfo?.status === "Reading").length,
      read: list.filter((item) => item.bookInfo?.status === "Finished").length,
      tbr: list.filter((item) => item.bookInfo?.status === "TBR").length,
      favorites: list.filter((item) => item.isFavorite).length,
    }
  }

  function formatShelfDate(dateValue) {
    if (!dateValue) return ""
    return new Date(dateValue).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  }


  
  function ReaderShelves({ books, activeShelf, onShelfChange, emptyName = "this reader", onOpenBook }) {
    const shelfStats = getShelfStats(books)
    const shelfBooks = getShelfBooks(books, activeShelf)
    const shelfOptions = [
      { key: "reading", label: "Currently Reading", icon: "📖", count: shelfStats.reading },
      { key: "read", label: "Read", icon: "📚", count: shelfStats.read },
      { key: "tbr", label: "Want To Read", icon: "✨", count: shelfStats.tbr },
      { key: "favorites", label: "Favorites", icon: "❤️", count: shelfStats.favorites },
    ]

    return (
      <div className="reader-shelves-panel">
        <div className="reader-shelves-header">
          <p>Reader Shelves</p>
          <h2>Browse the library</h2>
        </div>

        <div className="reader-shelf-stats">
          {shelfOptions.map((shelf) => (
            <button
              type="button"
              key={shelf.key}
              className={activeShelf === shelf.key ? "active" : ""}
              onClick={() => onShelfChange(shelf.key)}
            >
              <span>{shelf.icon}</span>
              <strong>{shelf.count}</strong>
              {shelf.label}
            </button>
          ))}
        </div>

        {shelfBooks.length ? (
          <div className="reader-shelf-grid">
            {shelfBooks.map((item) => (
              <button
                type="button"
                key={item.id}
                className="reader-shelf-book-card reader-shelf-book-button"
                onClick={() => onOpenBook?.(item)}
                aria-label={`Open ${item.bookInfo?.title || "book"} review`}
              >
                {item.bookInfo?.coverUrl ? (
                  <img src={item.bookInfo.coverUrl} alt={`${item.bookInfo.title || "Book"} cover`} />
                ) : (
                  <div className="reader-shelf-cover-placeholder">📖</div>
                )}

                <div>
                  <h3>{item.bookInfo?.title || "Untitled Book"}</h3>
                  <p>{item.bookInfo?.author || "Unknown Author"}</p>

                  {item.bookInfo?.status === "Finished" && item.bookScore && (
                    <p>⭐ {item.bookScore}/5</p>
                  )}

                  {item.bookInfo?.status === "Finished" && item.bookInfo?.dateFinished && (
                    <p>Finished {formatShelfDate(item.bookInfo.dateFinished)}</p>
                  )}

                  {item.bookInfo?.status === "Reading" && (
                    <p>Reading now{item.bookInfo?.currentPage && item.bookInfo?.totalPages ? ` • page ${item.bookInfo.currentPage}/${item.bookInfo.totalPages}` : ""}</p>
                  )}

                  {item.bookInfo?.status === "TBR" && (
                    <p>Waiting on the TBR cart ✨</p>
                  )}

                  {item.isFavorite && <p>❤️ Favorite</p>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="score-card reader-shelf-empty">
            <p>No books on this shelf yet.</p>
            <p>{emptyName} hasn’t added anything here.</p>
          </div>
        )}
      </div>
    )
  }

  useEffect(() => {
    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)

      if (currentUser) {
        loadCloudReviews(currentUser)
        loadCloudReadingLogs(currentUser)
        loadCloudProfile(currentUser)
      } else {
        setSavedReviews(loadLocalSavedReviews())
        setReadingLogs([])
        setIsLibraryLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const pathParts = window.location.pathname.split("/").filter(Boolean)

    if (pathParts[0] === "u" && pathParts[1]) {
      setStep("publicProfileView")
      loadPublicProfileByUsername(pathParts[1], user)
    }
  }, [user])

  useEffect(() => {
    if (step === "activityFeed") {
      loadActivityFeed(user)
    }
  }, [step, user])


  useEffect(() => {
    if (user && step === "communityChallenges") {
      loadCommunityChallengeParticipation(user)
      return
    }

    if (!user) {
      localStorage.setItem(
        "pressedPagesJoinedCommunityChallenges",
        JSON.stringify(Array.isArray(joinedCommunityChallengeIds) ? joinedCommunityChallengeIds : [])
      )
    }
  }, [user, step])


  useEffect(() => {
    localStorage.setItem(
      "brainChemistryBooksReadingGoals",
      JSON.stringify(readingGoals)
    )
  }, [readingGoals])


  const pageTitles = {
    activityFeed: "Activity Feed",
    communityChallenges: "Challenge Hub",
    addBook: "Add Book",
    alreadyRead: "Already Read",
    backlogImport: "Backlog Import",
    analytics: "Stats",
    currentlyReading: "Currently Reading",
    dnf: "DNF Notes",
    dnfSummary: "DNF Summary",
    editProfile: "Edit Profile",
    library: "Library",
    profile: "Reader Profile",
    publicProfilePreview: "Public Profile Preview",
    publicProfileView: "Public Profile",
    readingLog: "Reading Log",
    readingSummary: "Reading Summary",
    reviewGraphic: "Review Graphic",
    viewReview: "Book Review",
  }

  function goHome() {
    setStep("home")
  }

  function goBackFromPage() {
    const backStepByPage = {
      activityFeed: "home",
      communityChallenges: "home",
      addBook: "home",
      alreadyRead: "addBook",
      backlogImport: "addBook",
      analytics: "home",
      currentlyReading: "home",
      dnf: "library",
      dnfSummary: "library",
      editProfile: "profile",
      library: "home",
      profile: "home",
      publicProfilePreview: "profile",
      publicProfileView: "home",
      readingLog: "currentlyReading",
      readingSummary: "viewReview",
      reviewGraphic: "viewReview",
      viewReview: "library",
    }

    setStep(backStepByPage[step] || "home")
  }

  return (
    <main className={step === "home" ? "" : "has-page-navigation"}>
      {step !== "home" && (
        <nav className="page-navigation" aria-label="Page navigation">
          <button type="button" className="page-nav-button" onClick={goBackFromPage}>
            ← Back
          </button>
          <span className="page-navigation-title">{pageTitles[step] || "Pressed Pages"}</span>
          <button type="button" className="page-nav-button" onClick={goHome}>
            Home
          </button>
        </nav>
      )}
      {step === "home" && (
        <section>
          <Auth
            user={user}
            onAuthChange={loadUser}
          />

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
              <p>Found {embeddedReadingLogCount} reading log{embeddedReadingLogCount === 1 ? "" : "s"} saved inside book records.</p>
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
          <button onClick={() => setStep("communityChallenges")}>Community Challenges</button>
          <button onClick={() => setStep("profile")}>Reader Profile</button>

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
                    : `${item.isFavorite ? "🧠 " : ""}${item.bookInfo.author || "Unknown Author"} • ⭐ ${item.bookScore}/5 • ❤️ ${item.obsessionScore}/5`}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {step === "addBook" && (
        <section>
          <p>Library Management</p>
          <h1>Add Book</h1>
          <p>
            Choose the kind of book entry you want to add. Full reviews are still
            here, but backlog books can be added without filling out every rating.
          </p>

          <div className="add-book-choice-grid">
            <button type="button" className="add-book-choice-card" onClick={startNewReview}>
              <span>📝</span>
              <strong>Full Review</strong>
              <p>Rate the book, track spice, tropes, notes, graphics, and all the scrapbook details.</p>
            </button>

            <button type="button" className="add-book-choice-card" onClick={() => {
              resetForm()
              setBookInfo((currentInfo) => ({
                ...currentInfo,
                status: "Reading",
                dateStarted: currentInfo.dateStarted || new Date().toISOString(),
              }))
              setStep(0)
            }}>
              <span>📖</span>
              <strong>Currently Reading</strong>
              <p>Add a book to your active reading shelf and start tracking page progress.</p>
            </button>

            <button type="button" className="add-book-choice-card" onClick={startAlreadyReadBook}>
              <span>📚</span>
              <strong>Already Read</strong>
              <p>Quick-add one finished book without writing a full review.</p>
            </button>

            <button type="button" className="add-book-choice-card" onClick={() => {
              setSaveMessage("")
              setStep("backlogImport")
            }}>
              <span>📦</span>
              <strong>Import Multiple</strong>
              <p>Batch-add older reads to fill your finished shelf faster.</p>
            </button>
          </div>
        </section>
      )}

      {step === "alreadyRead" && (
        <section>
          <p>Quick Add</p>
          <h1>Already Read</h1>
          <p>
            Add a finished book to your library without doing the full review flow.
            You can always open it later and add more details.
          </p>

          {saveMessage && <p>{saveMessage}</p>}

          <TextInput
            label="Title"
            value={alreadyReadBook.title}
            onChange={(value) => updateAlreadyReadBook("title", value)}
          />

          <TextInput
            label="Author"
            value={alreadyReadBook.author}
            onChange={(value) => updateAlreadyReadBook("author", value)}
          />

          <ImageUpload
            label="Upload Book Cover"
            value={alreadyReadBook.coverUrl}
            onChange={(value) => updateAlreadyReadBook("coverUrl", value)}
          />

          <TextInput
            label="Rating /5 optional"
            value={alreadyReadBook.rating}
            onChange={(value) => updateAlreadyReadBook("rating", value)}
          />

          <DateInput
            label="Date Finished optional"
            value={alreadyReadBook.dateFinished}
            onChange={(value) => updateAlreadyReadBook("dateFinished", value)}
          />

          <label>
            Notes optional
            <textarea
              value={alreadyReadBook.notes}
              onChange={(event) => updateAlreadyReadBook("notes", event.target.value)}
              placeholder="Tiny thoughts, memory joggers, or why you added this one..."
            />
          </label>

          <div className="library-action-row">
            <button type="button" onClick={() => setStep("addBook")}>Back</button>
            <button type="button" onClick={saveAlreadyReadBook}>
              Add To Finished Shelf
            </button>
          </div>
        </section>
      )}

      {step === "backlogImport" && (
        <section>
          <p>Bulk Add</p>
          <h1>Backlog Import</h1>
          <p>
            Add older finished books in batches. Only title and author are required;
            rating and date finished are optional.
          </p>

          {saveMessage && <p>{saveMessage}</p>}

          <div className="backlog-import-panel">
            <div className="backlog-import-header">
              <span>Title *</span>
              <span>Author *</span>
              <span>Rating</span>
              <span>Date Finished</span>
              <span></span>
            </div>

            {backlogRows.map((row, index) => (
              <div className="backlog-import-row" key={`backlog-row-${index}`}>
                <input
                  value={row.title}
                  onChange={(event) => updateBacklogRow(index, "title", event.target.value)}
                  placeholder="Book title"
                />
                <input
                  value={row.author}
                  onChange={(event) => updateBacklogRow(index, "author", event.target.value)}
                  placeholder="Author"
                />
                <input
                  value={row.rating}
                  onChange={(event) => updateBacklogRow(index, "rating", event.target.value)}
                  placeholder="4.5"
                />
                <input
                  type="date"
                  value={row.dateFinished}
                  onChange={(event) => updateBacklogRow(index, "dateFinished", event.target.value)}
                />
                <button
                  type="button"
                  className="backlog-remove-button"
                  onClick={() => removeBacklogRow(index)}
                  disabled={backlogRows.length === 1}
                  aria-label="Remove row"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="library-action-row">
            <button type="button" onClick={addBacklogRow}>+ Add Row</button>
            <button type="button" onClick={importBacklogBooks}>
              Import Books
            </button>
            <button type="button" onClick={() => setStep("addBook")}>Back</button>
          </div>
        </section>
      )}



      {step === "communityChallenges" && (
        <section>
          <p>Phase 12A • Community Challenges</p>
          <h1>Challenge Hub</h1>
          <p>Join cozy reading challenges, track your progress automatically from your library, and see which readers are participating with you.</p>

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

          <button type="button" onClick={() => setStep("home")}>Back Home</button>
        </section>
      )}


      {step === "activityFeed" && (
        <section>
          <p>Friends & Following</p>
          <h1>Activity Feed</h1>
          <p>See recent reading updates from you and the readers you follow.</p>

          {activityFeedMessage && <p>{activityFeedMessage}</p>}

          <div className="activity-feed-actions">
            <button type="button" onClick={() => loadActivityFeed(user)}>Refresh Feed</button>
            <button type="button" onClick={() => setStep("profile")}>My Profile</button>
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
                const readerName = profileData.displayName || reader.display_name || reader.username || (event.isOwnActivity ? "You" : "Pressed Pages Reader")
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
                      <p className="activity-feed-type">{getActivityIcon(event.event_type)} {getActivityLabel(event.event_type)}</p>
                      <div className="activity-feed-book">
                        {eventData.coverUrl && <img src={eventData.coverUrl} alt={`${eventData.title} cover`} />}
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
                        <span>{Number(event.likeCount || 0)} {Number(event.likeCount || 0) === 1 ? "like" : "likes"}</span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <button type="button" onClick={() => setStep("home")}>Back Home</button>
        </section>
      )}


      {step === "profile" && (
        <section>
          <p>Pressed Pages Profile</p>
          <h1>Your reader scrapbook.</h1>
          <p>{profile.isPublicProfile ? "Public profile is enabled — your reader scrapbook is ready to share." : "Private by default — turn on public sharing when you want a profile link."}</p>

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
                  <span><strong>{followStats.followers}</strong> follower{followStats.followers === 1 ? "" : "s"}</span>
                  <span><strong>{followStats.following}</strong> following</span>
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
                <button type="button" onClick={copyPublicProfileLink}>Copy Profile Link</button>
                <button type="button" onClick={() => setStep("publicProfilePreview")}>Preview Public Profile</button>
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
                    title={`${item.bookInfo.title || "Untitled Book"} by ${item.bookInfo.author || "Unknown Author"}`}
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
              <p>Next Up: {achievementStats.nextAchievement.icon} {achievementStats.nextAchievement.name}</p>
            ) : (
              <p>Every achievement is unlocked. Icon behavior.</p>
            )}
          </div>

          <button onClick={() => setStep("home")}>Back Home</button>
        </section>
      )}


      {step === "publicProfileView" && (
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

              <button type="button" onClick={() => setStep("home")}>Back Home</button>
            </>
          ) : (
            !publicProfileLoading && (
              <div className="score-card">
                <p>🔒 No public profile loaded.</p>
                <p>This reader may have turned their profile private.</p>
                <button type="button" onClick={() => setStep("home")}>Back Home</button>
              </div>
            )
          )}
        </section>
      )}


      {step === "publicProfilePreview" && (
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
                        title={`${item.bookInfo.title || "Untitled Book"} by ${item.bookInfo.author || "Unknown Author"}`}
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

          <button type="button" onClick={() => setStep("profile")}>Back to Profile</button>
        </section>
      )}


      {step === "editProfile" && (
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
                  <span><strong>{followStats.followers}</strong> follower{followStats.followers === 1 ? "" : "s"}</span>
                  <span><strong>{followStats.following}</strong> following</span>
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
                  <option key={option} value={option}>{option}</option>
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
                  <option key={option} value={option}>{option}</option>
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
                  <option key={option} value={option}>{option}</option>
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

            <p className="profile-helper-text">Avatar images are automatically cropped to a 200px by 200px square.</p>

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
      )}


      {step === "analytics" && (
        <section>
          <p>Reading Analytics</p>
          <h1>Your reading data dashboard.</h1>
          <p>Built from your reading log entries, finished dates, pages, minutes, and notes.</p>

          {saveMessage && <p>{saveMessage}</p>}

          <div className="analytics-tabs" aria-label="Reading analytics sections">
            <button type="button" className={analyticsTab === "overview" ? "active" : ""} onClick={() => setAnalyticsTab("overview")}>Overview</button>
            <button type="button" className={analyticsTab === "goals" ? "active" : ""} onClick={() => setAnalyticsTab("goals")}>Reading Goals</button>
            <button type="button" className={analyticsTab === "achievements" ? "active" : ""} onClick={() => setAnalyticsTab("achievements")}>Achievements</button>
            <button type="button" className={analyticsTab === "calendar" ? "active" : ""} onClick={() => setAnalyticsTab("calendar")}>Reading Calendar</button>
            <button type="button" className={analyticsTab === "wrapUps" ? "active" : ""} onClick={() => setAnalyticsTab("wrapUps")}>Wrap-Ups</button>
            <button type="button" className={analyticsTab === "yearInBooks" ? "active" : ""} onClick={() => setAnalyticsTab("yearInBooks")}>Year In Books</button>
          </div>

          <div className={`score-card ${analyticsTab === "goals" ? "" : "analytics-panel-hidden"}`}>
            <p>🎯 Reading Goals for {readingGoalStats.currentYearKey}</p>

            <div className="review-field">
              <label>Books Goal</label>
              <input
                type="number"
                min="0"
                value={readingGoals.books}
                onChange={(e) => updateReadingGoal("books", e.target.value)}
                placeholder="Example: 75"
              />
            </div>

            <p>{readingGoalStats.booksFinishedThisYear} / {readingGoals.books || 0} books finished</p>
            <ProgressBar percent={readingGoalStats.booksPercent} />

            <div className="review-field">
              <label>Pages Goal</label>
              <input
                type="number"
                min="0"
                value={readingGoals.pages}
                onChange={(e) => updateReadingGoal("pages", e.target.value)}
                placeholder="Example: 20000"
              />
            </div>

            <p>{readingGoalStats.pagesThisYear} / {readingGoals.pages || 0} pages read</p>
            <ProgressBar percent={readingGoalStats.pagesPercent} />

            <div className="review-field">
              <label>Reading Days Goal</label>
              <input
                type="number"
                min="0"
                value={readingGoals.readingDays}
                onChange={(e) => updateReadingGoal("readingDays", e.target.value)}
                placeholder="Example: 200"
              />
            </div>

            <p>{readingGoalStats.readingDaysThisYear} / {readingGoals.readingDays || 0} reading days</p>
            <ProgressBar percent={readingGoalStats.readingDaysPercent} />

            <div className="review-field">
              <label>Minutes Goal</label>
              <input
                type="number"
                min="0"
                value={readingGoals.minutes}
                onChange={(e) => updateReadingGoal("minutes", e.target.value)}
                placeholder="Example: 6000"
              />
            </div>

            <p>{readingGoalStats.minutesThisYear} / {readingGoals.minutes || 0} minutes read ({readingGoalStats.hoursThisYear} hours)</p>
            <ProgressBar percent={readingGoalStats.minutesPercent} />
          </div>

          <div className={`score-card ${analyticsTab === "achievements" ? "" : "analytics-panel-hidden"}`}>
            <p>🏆 Achievements</p>
            <h2>{achievementStats.unlocked} / {achievementStats.total} unlocked</h2>
            <ProgressBar percent={achievementStats.total ? Math.round((achievementStats.unlocked / achievementStats.total) * 100) : 0} />

            {achievementStats.nextAchievement && (
              <p>
                Next up: {achievementStats.nextAchievement.icon} {achievementStats.nextAchievement.name} ({Math.min(Number(achievementStats.nextAchievement.current || 0), achievementStats.nextAchievement.target)} / {achievementStats.nextAchievement.target})
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
                  {group.achievements.map((achievement) => {
                    const current = Number(achievement.current || 0)
                    const unlocked = current >= achievement.target
                    const progressPercent = achievement.target
                      ? Math.min(100, Math.round((current / achievement.target) * 100))
                      : 0

                    return (
                      <div
                        key={achievement.id}
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
                          {unlocked ? "Unlocked ✅" : `${Math.min(current, achievement.target)} / ${achievement.target}`}
                        </p>
                        <ProgressBar percent={progressPercent} />
                        {unlocked && achievement.id !== "author-era-placeholder" && (
                          <button
                            type="button"
                            className="secondary-button"
                            style={{ marginTop: "0.75rem", width: "100%" }}
                            onClick={() => downloadAchievementGraphicPng(achievement, group.title)}
                          >
                            🎨 Download Badge Graphic
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className={`score-card ${analyticsTab === "calendar" ? "" : "analytics-panel-hidden"}`}>
            <p>📅 Reading Calendar</p>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <button onClick={() => shiftCalendarMonth(-1)}>← Previous Month</button>
              <h2 style={{ margin: 0 }}>{readingCalendarStats.monthLabel}</h2>
              <button onClick={() => shiftCalendarMonth(1)}>Next Month →</button>
            </div>

            <p>
              {readingCalendarStats.totalDaysRead} reading day{readingCalendarStats.totalDaysRead === 1 ? "" : "s"} •{" "}
              {readingCalendarStats.totalPages} pages
              {readingCalendarStats.totalMinutes
                ? ` • ${readingCalendarStats.totalHours} hours`
                : ""}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: "0.35rem",
                marginTop: "1rem",
              }}
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                <strong key={dayName} style={{ textAlign: "center", fontSize: "0.8rem" }}>
                  {dayName}
                </strong>
              ))}

              {readingCalendarStats.calendarDays.map((day, index) =>
                day ? (
                  <button
                    key={day.date}
                    onClick={() => setSelectedCalendarDate(day.date)}
                    style={{
                      minHeight: "4.5rem",
                      padding: "0.4rem",
                      border:
                        selectedCalendarDate === day.date
                          ? "2px solid #2f2420"
                          : "1px solid rgba(47, 36, 32, 0.2)",
                      borderRadius: "0.75rem",
                      background: day.sessions
                        ? "rgba(166, 84, 52, 0.16)"
                        : "rgba(255, 255, 255, 0.45)",
                      color: "#2f2420",
                      textAlign: "left",
                    }}
                  >
                    <strong>{day.day}</strong>
                    {day.sessions > 0 && (
                      <>
                        <br />
                        <span>{day.pages} pg</span>
                        <br />
                        <span>
                          {day.sessions} log{day.sessions === 1 ? "" : "s"}
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <div key={`blank-${index}`} />
                )
              )}
            </div>

            <div style={{ marginTop: "1rem" }}>
              <p>
                <strong>
                  {selectedCalendarDate
                    ? formatDateKey(selectedCalendarDate)
                    : "Select a day"}
                </strong>
              </p>

              {readingCalendarStats.selectedDay?.logs?.length ? (
                readingCalendarStats.selectedDay.logs.map((log) => (
                  <div key={log.id} style={{ marginBottom: "0.75rem" }}>
                    <p>
                      <strong>{log.title}</strong>
                      <br />
                      {log.pagesRead || 0} pages
                      {log.endPage ? ` • ended on page ${log.endPage}` : ""}
                      {log.minutesRead ? ` • ${log.minutesRead} minutes` : ""}
                    </p>
                    {log.notes && <p>📝 {log.notes}</p>}
                  </div>
                ))
              ) : (
                <p>No reading logged for this day.</p>
              )}
            </div>
          </div>

          <div className={`score-card ${analyticsTab === "wrapUps" ? "" : "analytics-panel-hidden"}`}>
            <p>🌙 Monthly Wrap-Up</p>
            <h2>{monthlyWrapUpStats.monthLabel}</h2>

            <div className="review-field">
              <label>Choose Month</label>
              <select
                value={wrapUpMonthKey}
                onChange={(e) => setWrapUpMonthKey(e.target.value)}
              >
                {wrapUpMonthOptions.map((monthKey) => {
                  const [yearPart, monthPart] = monthKey.split("-")
                  const monthDate = new Date(Number(yearPart), Number(monthPart) - 1, 1)
                  const monthLabel = monthDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })

                  return (
                    <option key={monthKey} value={monthKey}>
                      {monthLabel}
                    </option>
                  )
                })}
              </select>
            </div>

            {monthlyWrapUpStats.booksFinished > 0 ? (
              <>
                <div className="wrapup-graphic-panel">
                  <img
                    className="wrapup-graphic-preview"
                    src={getMonthlyWrapUpGraphicDataUrl(monthlyWrapUpStats)}
                    alt={`${monthlyWrapUpStats.monthLabel} Pressed Pages wrap-up graphic preview`}
                  />
                  <div className="wrapup-graphic-actions">
                    <button onClick={() => downloadMonthlyWrapUpGraphicPng(monthlyWrapUpStats)}>
                      🎨 Download Wrap-Up PNG
                    </button>
                    <button onClick={() => downloadMonthlyWrapUpGraphicSvg(monthlyWrapUpStats)}>
                      Save SVG Backup
                    </button>
                  </div>
                </div>

                <p>Books Finished: {monthlyWrapUpStats.booksFinished}</p>
                <p>Average Rating: {monthlyWrapUpStats.averageRating}/5</p>
                <p>Average Spice: {monthlyWrapUpStats.averageSpice}/5</p>
                <p>Average Obsession: {monthlyWrapUpStats.averageObsession}/5</p>
                <p>Reading Days Logged: {monthlyWrapUpStats.readingDays}</p>
                <p>Pages Logged: {monthlyWrapUpStats.pagesLogged}</p>
                {monthlyWrapUpStats.minutesLogged > 0 && (
                  <p>
                    Time Logged: {monthlyWrapUpStats.minutesLogged} minutes ({monthlyWrapUpStats.hoursLogged} hours)
                  </p>
                )}

                {monthlyWrapUpStats.topTrope && (
                  <p>
                    Favorite Trope: {monthlyWrapUpStats.topTrope[0]} ({monthlyWrapUpStats.topTrope[1]})
                  </p>
                )}

                {monthlyWrapUpStats.topAuthor && (
                  <p>
                    Most Read Author: {monthlyWrapUpStats.topAuthor[0]} ({monthlyWrapUpStats.topAuthor[1]})
                  </p>
                )}

                {monthlyWrapUpStats.highestRated && (
                  <p>
                    Highest Rated: {monthlyWrapUpStats.highestRated.bookInfo.title || "Untitled Book"} • {monthlyWrapUpStats.highestRated.bookScore}/5
                  </p>
                )}

                {monthlyWrapUpStats.fastestRead && (
                  <p>
                    Fastest Read: {monthlyWrapUpStats.fastestRead.item.bookInfo.title || "Untitled Book"} • {monthlyWrapUpStats.fastestRead.days} day{monthlyWrapUpStats.fastestRead.days === 1 ? "" : "s"}
                  </p>
                )}

                {monthlyWrapUpStats.slowestRead && (
                  <p>
                    Slowest Read: {monthlyWrapUpStats.slowestRead.item.bookInfo.title || "Untitled Book"} • {monthlyWrapUpStats.slowestRead.days} day{monthlyWrapUpStats.slowestRead.days === 1 ? "" : "s"}
                  </p>
                )}

                {monthlyWrapUpStats.favoriteReads.length > 0 && (
                  <p>
                    Brain Chemistry Reads: {monthlyWrapUpStats.favoriteReads
                      .map((item) => item.bookInfo.title || "Untitled Book")
                      .join(", ")}
                  </p>
                )}

                <div style={{ marginTop: "1rem" }}>
                  <h3>Finished Shelf</h3>
                  {monthlyWrapUpStats.books.map((item) => (
                    <p key={item.id}>
                      <strong>{item.bookInfo.title || "Untitled Book"}</strong>
                      {item.bookInfo.author ? ` by ${item.bookInfo.author}` : ""} • {item.bookScore}/5
                      {item.metrics?.spice ? ` • 🌶️ ${item.metrics.spice}/5` : ""}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <p>No books finished in this month yet.</p>
            )}
          </div>

          <div className={`score-card ${analyticsTab === "yearInBooks" ? "" : "analytics-panel-hidden"}`}>
            <p>🌸 Year In Books</p>
            <h2>{yearInBooksStats.yearKey}</h2>
            <p>Your yearly scrapbook of finished books, reading days, favorite tropes, and top-shelf reads.</p>

            <div className="review-field">
              <label>Choose Year</label>
              <select
                value={yearInBooksKey}
                onChange={(e) => setYearInBooksKey(e.target.value)}
              >
                {yearInBooksOptions.map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
            </div>

            {yearInBooksStats.booksFinished > 0 ? (
              <>
                <div className="year-books-hero">
                  <div>
                    <strong>{yearInBooksStats.booksFinished}</strong>
                    <span>Books Finished</span>
                  </div>
                  <div>
                    <strong>{yearInBooksStats.pagesLogged}</strong>
                    <span>Pages Logged</span>
                  </div>
                  <div>
                    <strong>{yearInBooksStats.readingDays}</strong>
                    <span>Reading Days</span>
                  </div>
                </div>

                <div className="wrapup-graphic-panel">
                  <img
                    className="year-books-graphic-preview"
                    src={getYearInBooksGraphicDataUrl(yearInBooksStats)}
                    alt={`${yearInBooksStats.yearKey} Pressed Pages Year In Books graphic preview`}
                  />
                  <div className="wrapup-graphic-actions">
                    <button onClick={() => downloadYearInBooksGraphicPng(yearInBooksStats)}>
                      🎨 Download Year PNG
                    </button>
                    <button onClick={() => downloadYearInBooksGraphicSvg(yearInBooksStats)}>
                      Save SVG Backup
                    </button>
                  </div>
                </div>

                <div className="year-books-grid">
                  <div>
                    <p>⭐ Average Rating</p>
                    <h3>{yearInBooksStats.averageRating}/5</h3>
                  </div>
                  <div>
                    <p>🌶️ Average Spice</p>
                    <h3>{yearInBooksStats.averageSpice}/5</h3>
                  </div>
                  <div>
                    <p>💘 Average Obsession</p>
                    <h3>{yearInBooksStats.averageObsession}/10</h3>
                  </div>
                  <div>
                    <p>⏱️ Time Logged</p>
                    <h3>{yearInBooksStats.hoursLogged} hrs</h3>
                  </div>
                </div>

                {yearInBooksStats.topTrope && (
                  <p>Favorite Trope: {yearInBooksStats.topTrope[0]} ({yearInBooksStats.topTrope[1]})</p>
                )}
                {yearInBooksStats.topAuthor && (
                  <p>Most Read Author: {yearInBooksStats.topAuthor[0]} ({yearInBooksStats.topAuthor[1]})</p>
                )}
                {yearInBooksStats.topFormat && (
                  <p>Most Used Format: {yearInBooksStats.topFormat[0]} ({yearInBooksStats.topFormat[1]})</p>
                )}
                {yearInBooksStats.highestRated && (
                  <p>Highest Rated: {yearInBooksStats.highestRated.bookInfo.title || "Untitled Book"} • {yearInBooksStats.highestRated.bookScore}/5</p>
                )}
                {yearInBooksStats.fastestRead && (
                  <p>Fastest Read: {yearInBooksStats.fastestRead.item.bookInfo.title || "Untitled Book"} • {yearInBooksStats.fastestRead.days} day{yearInBooksStats.fastestRead.days === 1 ? "" : "s"}</p>
                )}
                {yearInBooksStats.longestRead && (
                  <p>Longest Read: {yearInBooksStats.longestRead.item.bookInfo.title || "Untitled Book"} • {yearInBooksStats.longestRead.days} day{yearInBooksStats.longestRead.days === 1 ? "" : "s"}</p>
                )}

                <div className="year-books-months">
                  <h3>Books by Month</h3>
                  {yearInBooksStats.monthLabels.map((month) => (
                    <div key={month.key}>
                      <span>{month.shortLabel}</span>
                      <div className="year-books-month-bar">
                        <span style={{ width: `${Math.max(4, Math.min(100, (month.count / Math.max(...yearInBooksStats.monthLabels.map((item) => item.count), 1)) * 100))}%` }} />
                      </div>
                      <strong>{month.count}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <h3>Finished Shelf</h3>
                  {yearInBooksStats.books.map((item) => (
                    <p key={item.id}>
                      <strong>{item.bookInfo.title || "Untitled Book"}</strong>
                      {item.bookInfo.author ? ` by ${item.bookInfo.author}` : ""} • {item.bookScore}/5
                      {item.metrics?.spice ? ` • 🌶️ ${item.metrics.spice}/5` : ""}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <p>No books finished in this year yet.</p>
            )}
          </div>


          {savedReviews.length > 0 && (
            <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
              <p>📚 Library Snapshot</p>
              <p>Books Saved: {totalBooks}</p>
              <p>Finished Reviews: {finishedReviews.length}</p>
              <p>Finished This Year: {yearToDateCount}</p>
              <p>Currently Reading: {currentlyReadingReviews.length}</p>
              <p>DNFs: {dnfReviews.length}</p>
              <p>Brain Chemistry Reads: {brainChemistryCount}</p>
            </div>
          )}

          {finishedReviews.length > 0 && (
            <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
              <p>⭐ Review Averages</p>
              <p>Average Rating: {averageRating}/5</p>
              <p>Average Spice: {averageSpice}/5</p>
              <p>Average Obsession: {averageObsession}/5</p>
              {mostReadTrope && (
                <p>Most Read Trope: {mostReadTrope[0]} ({mostReadTrope[1]})</p>
              )}
              {mostReadAuthor && (
                <p>Most Read Author: {mostReadAuthor[0]} ({mostReadAuthor[1]})</p>
              )}
            </div>
          )}

          <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
            <p>🔥 Reading Activity</p>
            <p>Current Streak: {readingStreakStats.currentStreak} days</p>
            <p>Longest Streak: {readingStreakStats.longestStreak} days</p>
            <p>Reading Days This Month: {readingAnalyticsStats.readingDaysThisMonth}</p>
            <p>Reading Days This Year: {readingAnalyticsStats.readingDaysThisYear}</p>
            <p>Total Reading Sessions: {readingAnalyticsStats.totalSessions}</p>
            {readingStreakStats.lastLoggedDate && (
              <p>Last Reading Day: {formatDateKey(readingStreakStats.lastLoggedDate)}</p>
            )}
          </div>

          <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
            <p>🌸 Pressed Petals</p>
            <p>A bloom for every day you spent reading.</p>
            <ReadingHeatMap
             heatMapStats={getReadingHeatMapStats(180)}
             formatDateKey={formatDateKey}
              />
          </div>

          <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
            <p>📄 Pages</p>
            <p>Pages Read This Month: {readingAnalyticsStats.pagesThisMonth}</p>
            <p>Pages Read This Year: {readingAnalyticsStats.pagesThisYear}</p>
            <p>Total Pages Logged: {readingAnalyticsStats.totalPages}</p>
            <p>Average Pages Per Reading Day: {readingAnalyticsStats.averagePagesPerReadingDay}</p>
            {readingAnalyticsStats.biggestReadingDay && (
              <p>
                Biggest Reading Day: {readingAnalyticsStats.biggestReadingDay.pages} pages on {formatDateKey(readingAnalyticsStats.biggestReadingDay.date)}
              </p>
            )}
          </div>

          <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
            <p>⏱️ Time</p>
            <p>Minutes Read This Month: {readingAnalyticsStats.minutesThisMonth}</p>
            <p>Minutes Read This Year: {readingAnalyticsStats.minutesThisYear}</p>
            <p>Total Hours Read: {readingAnalyticsStats.totalHours}</p>
            <p>Average Session Length: {readingAnalyticsStats.averageSessionLength} minutes</p>
            <p>Estimated Pace: {readingAnalyticsStats.pagesPerHour} pages/hour</p>
          </div>

          <div className={`score-card ${analyticsTab === "overview" ? "" : "analytics-panel-hidden"}`}>
            <p>✅ Finished Book Stats</p>
            <p>Books Finished This Month: {readingAnalyticsStats.finishedThisMonth}</p>
            <p>Books Finished This Year: {readingAnalyticsStats.finishedThisYear}</p>
            <p>Average Days to Finish: {readingAnalyticsStats.averageDaysToFinish}</p>
            {readingAnalyticsStats.fastestRead && (
              <p>
                Fastest Read: {readingAnalyticsStats.fastestRead.item.bookInfo.title || "Untitled Book"} • {readingAnalyticsStats.fastestRead.days} day{readingAnalyticsStats.fastestRead.days === 1 ? "" : "s"}
              </p>
            )}
            {readingAnalyticsStats.slowestRead && (
              <p>
                Slowest Read: {readingAnalyticsStats.slowestRead.item.bookInfo.title || "Untitled Book"} • {readingAnalyticsStats.slowestRead.days} day{readingAnalyticsStats.slowestRead.days === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <button onClick={() => setStep("home")}>Back Home</button>
          <button onClick={() => setStep("currentlyReading")}>Currently Reading</button>
        </section>
      )}


      {step === "currentlyReading" && (
        <section>
          <p>Currently Reading</p>
          <h1>Reading Progress</h1>
          <p>Keep this page simple: log pages here, then open the full log only when you need to edit history.</p>

          {saveMessage && <p>{saveMessage}</p>}

          {currentlyReadingReviews.length === 0 && (
            <p>No currently reading books yet.</p>
          )}

          {currentlyReadingReviews.map((item) => {
            const progressPercent = getProgressPercent(item.bookInfo)
            const pageInputValue =
              progressInputs[item.id] ?? item.bookInfo.currentPage ?? ""
            const lastLog = [...getBookReadingLogs(item.id)].sort((a, b) =>
              (b.date || "").localeCompare(a.date || "")
            )[0]

            return (
              <div className="score-card" key={item.id}>
                {item.bookInfo.coverUrl && (
                  <img
                    src={item.bookInfo.coverUrl}
                    alt="Book cover"
                    className="book-cover"
                  />
                )}

                <h2>{item.bookInfo.title || "Untitled Book"}</h2>
                <p>{item.bookInfo.author || "Unknown Author"}</p>
                <p>{item.bookInfo.format} • Currently Reading</p>

                {item.bookInfo.dateStarted && (
                  <p>📖 Started {formatDate(item.bookInfo.dateStarted)}</p>
                )}

                <p>
                  Page {item.bookInfo.currentPage || "0"} of {item.bookInfo.totalPages || "?"}
                </p>

                <ProgressBar percent={progressPercent} />

                <button
                  onClick={() => {
                    setSelectedReadingLogBookId(item.id)
                    setStep("readingLog")
                  }}
                >
                  🔥 Log Today's Reading
                </button>

                {lastLog && (
                  <p>
                    Last log: {formatDateKey(lastLog.date)} • {lastLog.pagesRead || 0} pages
                  </p>
                )}

                <button onClick={() => finishBook(item)}>
                  ✅ Finish Book
                </button>

                <button onClick={() => openSavedReview(item)}>View Details</button>
                <button onClick={() => editReview(item)}>Edit</button>
                <button onClick={() => deleteReview(item.id)}>Delete</button>
              </div>
            )
          })}

          <button onClick={() => setStep("home")}>Back Home</button>
        </section>
      )}

      {step === "readingLog" && (() => {
        const item = savedReviews.find((reviewItem) => reviewItem.id === selectedReadingLogBookId)

        if (!item) {
          return (
            <section>
              <p>Reading Log</p>
              <h1>No book selected</h1>
              <p>Go back to Currently Reading and choose a book log to manage.</p>
              <button onClick={() => setStep("currentlyReading")}>Back to Currently Reading</button>
            </section>
          )
        }

        const progressPercent = getProgressPercent(item.bookInfo)
        const pageInputValue =
          progressInputs[item.id] ?? item.bookInfo.currentPage ?? ""
        const readingLogs = [...getBookReadingLogs(item.id)].sort((a, b) =>
          (b.date || "").localeCompare(a.date || "")
        )

        return (
          <section>
            <p>Reading Log</p>
            <h1>{item.bookInfo.title || "Untitled Book"}</h1>
            <p>{item.bookInfo.author || "Unknown Author"}</p>

            {saveMessage && <p>{saveMessage}</p>}

            {item.bookInfo.coverUrl && (
              <img
                src={item.bookInfo.coverUrl}
                alt="Book cover"
                className="book-cover"
              />
            )}

            <div className="score-card">
              <p>Current Progress</p>
              <p>Page {item.bookInfo.currentPage || "0"} of {item.bookInfo.totalPages || "?"}</p>
              <ProgressBar percent={progressPercent} />

              <div className="review-field">
                <label>Page I reached today</label>
                <input
                  type="number"
                  min="0"
                  max={item.bookInfo.totalPages || undefined}
                  value={pageInputValue}
                  onChange={(event) =>
                    setProgressInputs({
                      ...progressInputs,
                      [item.id]: event.target.value,
                    })
                  }
                />
              </div>

              <div className="review-field">
                <label>Minutes Read (optional)</label>
                <input
                  type="number"
                  min="0"
                  value={readingLogMinutesInputs[item.id] || ""}
                  onChange={(event) =>
                    setReadingLogMinutesInputs({
                      ...readingLogMinutesInputs,
                      [item.id]: event.target.value,
                    })
                  }
                />
              </div>

              <div className="review-field">
                <label>Reading Notes (optional)</label>
                <textarea
                  value={readingLogNoteInputs[item.id] || ""}
                  onChange={(event) =>
                    setReadingLogNoteInputs({
                      ...readingLogNoteInputs,
                      [item.id]: event.target.value,
                    })
                  }
                  placeholder="Optional: where you read, thoughts, chaos, etc."
                />
              </div>

              <button onClick={() => logReadingProgress(item.id)}>
                🔥 Log Reading
              </button>
            </div>

            <div className="score-card">
              <p>Reading Log History</p>
              <p>Editing a log updates your streak stats. Delete accidental logs here.</p>

              {readingLogs.length === 0 && (
                <p>No page logs yet. Your streak starts once you log 2 days in a row.</p>
              )}

              {readingLogs.map((log) => {
                const draftKey = `${item.id}-${log.id}`
                const draft = readingLogDrafts[draftKey] || {}
                const hasUnsavedEdits = Boolean(readingLogDirty[draftKey])

                return (
                  <div className="review-field" key={log.id}>
                    <label>Log Date</label>
                    <input
                      type="date"
                      value={draft.date ?? log.date ?? ""}
                      onChange={(event) =>
                        stageReadingLogEdit(item.id, log.id, "date", event.target.value)
                      }
                    />

                    <label>Pages Read</label>
                    <input
                      type="number"
                      min="0"
                      value={draft.pagesRead ?? log.pagesRead ?? 0}
                      onChange={(event) =>
                        stageReadingLogEdit(item.id, log.id, "pagesRead", event.target.value)
                      }
                    />

                    <label>Ended On Page</label>
                    <input
                      type="number"
                      min="0"
                      max={item.bookInfo.totalPages || undefined}
                      value={draft.endPage ?? log.endPage ?? 0}
                      onChange={(event) =>
                        stageReadingLogEdit(item.id, log.id, "endPage", event.target.value)
                      }
                    />

                    <label>Minutes Read</label>
                    <input
                      type="number"
                      min="0"
                      value={draft.minutesRead ?? log.minutesRead ?? ""}
                      onChange={(event) =>
                        stageReadingLogEdit(item.id, log.id, "minutesRead", event.target.value)
                      }
                    />

                    <label>Notes</label>
                    <textarea
                      value={draft.notes ?? log.notes ?? ""}
                      onChange={(event) =>
                        stageReadingLogEdit(item.id, log.id, "notes", event.target.value)
                      }
                    />

                    <p>
                      {formatDateKey(draft.date ?? log.date)} • {draft.pagesRead ?? log.pagesRead ?? 0} pages
                      {(draft.minutesRead ?? log.minutesRead) ? ` • ${draft.minutesRead ?? log.minutesRead} minutes` : ""}
                    </p>

                    {hasUnsavedEdits && (
                      <button onClick={() => saveReadingLogEdits(item.id, log.id)}>
                        Save Edits
                      </button>
                    )}

                    <button onClick={() => deleteReadingLog(item.id, log.id)}>
                      Delete Log
                    </button>
                  </div>
                )
              })}
            </div>

            <button onClick={() => setStep("currentlyReading")}>Back to Currently Reading</button>
            <button onClick={() => setStep("home")}>Back Home</button>
          </section>
        )
      })()}

      {step === "library" && (
        <section>
          <p>Your Library</p>
          <h1>Saved Reviews</h1>

          <button onClick={() => setLibraryFilter("all")}>📚 All Books</button>
          <button onClick={() => setLibraryFilter("reading")}>📖 Currently Reading</button>
          <button onClick={() => setLibraryFilter("finished")}>✅ Finished</button>
          <button onClick={() => setLibraryFilter("dnf")}>🚫 DNF</button>
          <button onClick={() => setLibraryFilter("favorites")}>
            🧠 Brain Chemistry
          </button>

          <div className="score-card library-filter-card">
            <p>Smart Library Filters</p>

            <label>
              Search Title or Author
              <input
                type="text"
                value={librarySearch}
                onChange={(event) => setLibrarySearch(event.target.value)}
                placeholder="Search your shelves..."
              />
            </label>

            <label>
              Rating
              <select
                value={libraryRatingFilter}
                onChange={(event) => setLibraryRatingFilter(event.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </label>

            <label>
              Spice
              <select
                value={librarySpiceFilter}
                onChange={(event) => setLibrarySpiceFilter(event.target.value)}
              >
                <option value="all">All Spice Levels</option>
                <option value="5">🌶️ 5</option>
                <option value="4">🌶️ 4+</option>
                <option value="3">🌶️ 3+</option>
                <option value="2">🌶️ 2+</option>
                <option value="1">🌶️ 1+</option>
              </select>
            </label>

            <label>
              Finished Year
              <select
                value={libraryFinishedYearFilter}
                onChange={(event) => setLibraryFinishedYearFilter(event.target.value)}
              >
                <option value="all">All Years</option>
                {libraryFinishedYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Finished Month
              <select
                value={libraryFinishedMonthFilter}
                onChange={(event) => setLibraryFinishedMonthFilter(event.target.value)}
              >
                <option value="all">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </label>

            <label>
              Trope
              <select
                value={libraryTropeFilter}
                onChange={(event) => setLibraryTropeFilter(event.target.value)}
              >
                <option value="all">All Tropes</option>
                {libraryTropeOptions.map((trope) => (
                  <option key={trope} value={trope}>
                    {trope}
                  </option>
                ))}
              </select>
            </label>

            <p>Showing {filteredReviews.length} of {savedReviews.length} books</p>
            <button onClick={resetLibraryFilters}>Reset Filters</button>
          </div>

          {isLibraryLoading && savedReviews.length === 0 && (
            <p>Loading your library...</p>
          )}

          {!isLibraryLoading && filteredReviews.length === 0 && (
            <p>No reviews found for these filters. Try Reset Filters if your shelves look empty.</p>
          )}

          <div className="library-results-grid">
            {filteredReviews.map((item) => (
              <div className="score-card library-book-card" key={item.id}>
                {item.bookInfo.coverUrl ? (
                  <button
                    className="library-cover-button"
                    onClick={() => openSavedReview(item)}
                    aria-label={`Open review for ${item.bookInfo.title || "Untitled Book"}`}
                  >
                    <img
                      src={item.bookInfo.coverUrl}
                      alt={`${item.bookInfo.title || "Book"} cover`}
                      className="book-cover library-book-cover"
                    />
                  </button>
                ) : (
                  <button
                    className="library-cover-button library-cover-placeholder"
                    onClick={() => openSavedReview(item)}
                    aria-label={`Open review for ${item.bookInfo.title || "Untitled Book"}`}
                  >
                    📖
                  </button>
                )}

              {item.bookInfo.status === "DNF" ? (
                <>
                  <p>🚫 DNF</p>
                  <button
                    className="library-title-button"
                    onClick={() => openSavedReview(item)}
                  >
                    {item.bookInfo.title || "Untitled Book"}
                  </button>
                  <p>{item.bookInfo.author || "Unknown Author"}</p>
                  <p>{item.bookInfo.format} • {item.bookInfo.status}</p>
                  <p>📍 DNF at {item.dnfInfo?.percent || "?"}%</p>
                  <p>Reason: {item.dnfInfo?.reason || "No reason listed"}</p>
                  <p>
                    Would read author again:{" "}
                    {item.dnfInfo?.wouldReadAuthorAgain || "Maybe"}
                  </p>
                </>
              ) : item.bookInfo.status === "Reading" || item.bookInfo.status === "TBR" ? (
                <>
                  <p>📖 Currently Reading</p>
                  <button
                    className="library-title-button"
                    onClick={() => openSavedReview(item)}
                  >
                    {item.bookInfo.title || "Untitled Book"}
                  </button>
                  <p>{item.bookInfo.author || "Unknown Author"}</p>
                  <p>{item.bookInfo.format} • Reading</p>
                  {item.bookInfo.dateStarted && (
                    <p>📖 Started {formatDate(item.bookInfo.dateStarted)}</p>
                  )}
                  <p>
                    Page {item.bookInfo.currentPage || "0"} of {item.bookInfo.totalPages || "?"}
                  </p>
                  <ProgressBar percent={getProgressPercent(item.bookInfo)} />

                  <button className="library-action-button" onClick={() => finishBook(item)}>
                    ✅ Finish Book
                  </button>
                </>
              ) : (
                <>
                  {item.isFavorite && <p>🧠 Brain Chemistry Book</p>}

                  <button
                    className="library-title-button"
                    onClick={() => openSavedReview(item)}
                  >
                    {item.bookInfo.title || "Untitled Book"}
                  </button>
                  <p>{item.bookInfo.author || "Unknown Author"}</p>
                  <p>{item.bookInfo.format} • {item.bookInfo.status}</p>
                  {item.bookInfo.dateFinished && (
                    <p>📅 Finished {formatDate(item.bookInfo.dateFinished)}</p>
                  )}
                  {getDaysToRead(item) && (
                    <p>
                      ⏱️ Read in {getDaysToRead(item)} day
                      {getDaysToRead(item) !== 1 ? "s" : ""}
                    </p>
                  )}
                  <p>
                    ⭐ {item.bookScore}/5 • ❤️ {item.obsessionScore}/5 • 🌶️{" "}
                    {item.metrics?.spice}/5
                  </p>
                  <p>{item.recommendationLevel}</p>
                </>
              )}

              <button className="library-action-button" onClick={() => openSavedReview(item)}>View Review</button>
              <button className="library-action-button" onClick={() => editReview(item)}>Edit Review / Dates</button>
              <button className="library-action-button library-delete-button" onClick={() => deleteReview(item.id)}>Delete</button>
            </div>
            ))}
          </div>

          <button onClick={() => setStep("home")}>Back Home</button>
        </section>
      )}

      {step === "viewReview" && selectedReview && (
        <section>
          <p>Saved Review</p>

          {selectedReview.bookInfo.coverUrl && (
            <img
              src={selectedReview.bookInfo.coverUrl}
              alt="Book cover"
              className="book-cover"
            />
          )}

          {selectedReview.bookInfo.status === "DNF" ? (
            <>
              <p>🚫 DNF</p>
              <h1>{selectedReview.bookInfo.title || "Untitled Book"}</h1>
              <p>{selectedReview.bookInfo.author || "Unknown Author"}</p>
              <p>
                {selectedReview.bookInfo.format} •{" "}
                {selectedReview.bookInfo.status}
              </p>

              <div className="score-card">
                <p>DNF Percent</p>
                <h2>{selectedReview.dnfInfo?.percent || "?"}%</h2>
              </div>

              <p>
                <strong>DNF Reason:</strong>
                <br />
                {selectedReview.dnfInfo?.reason || "No reason listed"}
              </p>

              <p>
                <strong>Would read this author again?</strong>
                <br />
                {selectedReview.dnfInfo?.wouldReadAuthorAgain || "Maybe"}
              </p>

              <div className="score-card">
                <p>DNF Copy</p>
                <pre>{selectedReview.miniReviewText}</pre>
              </div>
            </>
          ) : selectedReview.bookInfo.status === "Reading" || selectedReview.bookInfo.status === "TBR" ? (
            <>
              <p>📖 Currently Reading</p>
              <h1>{selectedReview.bookInfo.title || "Untitled Book"}</h1>
              <p>{selectedReview.bookInfo.author || "Unknown Author"}</p>
              <p>{selectedReview.bookInfo.format} • Reading</p>

              {selectedReview.bookInfo.dateStarted && (
                <p>📖 Started {formatDate(selectedReview.bookInfo.dateStarted)}</p>
              )}

              <div className="score-card">
                <p>Reading Progress</p>
                <h2>{getProgressPercent(selectedReview.bookInfo)}%</h2>
                <p>
                  Page {selectedReview.bookInfo.currentPage || "0"} of {selectedReview.bookInfo.totalPages || "?"}
                </p>
                <ProgressBar percent={getProgressPercent(selectedReview.bookInfo)} />

                {isSelectedReviewOwner && (
                  <button onClick={() => finishBook(selectedReview)}>
                    ✅ Finish Book
                  </button>
                )}
              </div>

              <div className="score-card">
                <p>Reading Copy</p>
                <pre>{selectedReview.miniReviewText}</pre>
              </div>
            </>
          ) : (
            <>
              {selectedReview.isFavorite && <p>🧠 Brain Chemistry Book</p>}

              <h1>{selectedReview.bookInfo.title || "Untitled Book"}</h1>
              <p>{selectedReview.bookInfo.author || "Unknown Author"}</p>
              <p>
                {selectedReview.bookInfo.format} • {selectedReview.bookInfo.status}
              </p>

              {selectedReview.bookInfo.dateStarted && (
                <p>📖 Started {formatDate(selectedReview.bookInfo.dateStarted)}</p>
              )}

              {selectedReview.bookInfo.dateFinished && (
                <p>📅 Finished {formatDate(selectedReview.bookInfo.dateFinished)}</p>
              )}

              {getDaysToRead(selectedReview) && (
                <p>
                  ⏱️ Read in {getDaysToRead(selectedReview)} day
                  {getDaysToRead(selectedReview) !== 1 ? "s" : ""}
                </p>
              )}

              <div className="score-card">
                <p>On Paper Score</p>
                <h2>{selectedReview.bookScore} / 5</h2>
              </div>

              <div className="score-card">
                <p>Obsession Score</p>
                <h2>{selectedReview.obsessionScore} / 5</h2>
              </div>

              <div className="score-card">
                <p>Spice Rating</p>
                <h2>{selectedReview.metrics?.spice || 0} / 5</h2>
              </div>

              <div className="score-card">
                <p>Recommendation</p>
                <h2>{selectedReview.recommendationLevel}</h2>
              </div>

              <p>
                <strong>Tropes:</strong>
                <br />
                {(selectedReview.tropes || []).length > 0
                  ? (selectedReview.tropes || []).join(" • ")
                  : "None selected"}
              </p>

              <p>
                <strong>One-Sentence Review:</strong>
                <br />
                {selectedReview.review?.oneSentenceReview || ""}
              </p>

              <p>
                <strong>Favorite Thing:</strong>
                <br />
                {selectedReview.review?.favoriteThing || ""}
              </p>

              <p>
                <strong>Biggest Complaint:</strong>
                <br />
                {selectedReview.review?.biggestComplaint || ""}
              </p>

              <p>
                <strong>Vibe Check:</strong>
                <br />
                {selectedReview.review?.vibeCheck || ""}
              </p>

              {selectedReview.bookInfo.reviewGraphicUrl && (
                <div className="score-card">
                  <p>Review Graphic</p>

                  <img
                    src={selectedReview.bookInfo.reviewGraphicUrl}
                    alt="Review graphic"
                    className="review-graphic"
                  />
                </div>
              )}

              <div className="score-card">
                <p>Mini Review Copy</p>
                <pre>{selectedReview.miniReviewText}</pre>
              </div>
            </>
          )}

          {isSelectedReviewOwner && selectedReview.bookInfo.status === "Finished" && (
            <button onClick={() => setStep("reviewGraphic")}>
              🎨 Generate Review Graphic
            </button>
          )}

          <button onClick={() => setStep("library")}>Back to Library</button>

          {isSelectedReviewOwner && (
            <>
              <button onClick={() => editReview(selectedReview)}>Edit Review / Dates</button>
              <button onClick={() => deleteReview(selectedReview.id)}>
                Delete Review
              </button>
            </>
          )}
        </section>
      )}

      {step === "reviewGraphic" && selectedReview && (
        <section>
          <p>Review Graphic Generator</p>
          <h1>{selectedReview.bookInfo.title || "Untitled Book"}</h1>
          <p>Mini-review graphic, pulled from this saved review.</p>

          <div className="score-card">
            <p>Graphic Settings</p>

            <label>
              Template
              <select value={reviewGraphicTemplate} onChange={(event) => setReviewGraphicTemplate(event.target.value)}>
                <option value="scrapbook">Scrapbook</option>
                <option value="minimal">Minimal</option>
                <option value="dark">Dark Romance</option>
                <option value="soft">Soft Romance</option>
              </select>
            </label>

            <label>
              Export Size
              <select value={reviewGraphicSize} onChange={(event) => setReviewGraphicSize(event.target.value)}>
                <option value="square">Square Post</option>
                <option value="story">Instagram/Facebook Story</option>
                <option value="pinterest">Pinterest</option>
              </select>
            </label>

            <div className="button-row">
              {Object.entries({
                rating: "Rating",
                spice: "Spice",
                obsession: "Obsession",
                review: "One-Sentence Review",
                vibe: "Vibe Check",
                tropes: "Tropes",
              }).map(([field, label]) => (
                <button
                  key={field}
                  type="button"
                  className={reviewGraphicFields[field] ? "filter-button active" : "filter-button"}
                  onClick={() => toggleReviewGraphicField(field)}
                >
                  {reviewGraphicFields[field] ? "✓" : "+"} {label}
                </button>
              ))}
            </div>
          </div>

          <div className="score-card">
            <p>Preview</p>
            <img
              src={getReviewGraphicDataUrl(selectedReview, getReviewGraphicOptions())}
              alt="Generated review graphic preview"
              className="review-graphic"
            />
          </div>

          <div className="score-card">
            <p>Social Export</p>
            <p>Download the review graphic in the format you need.</p>

            <div className="button-row">
              <button type="button" onClick={() => downloadSocialGraphic(selectedReview, "square")}>
                Download Square Post
              </button>
              <button type="button" onClick={() => downloadSocialGraphic(selectedReview, "story")}>
                Download Story
              </button>
              <button type="button" onClick={() => downloadSocialGraphic(selectedReview, "pinterest")}>
                Download Pinterest Pin
              </button>
            </div>
          </div>

          <div className="score-card">
            <p>Auto Caption</p>

            <label>
              Caption Style
              <select
                value={reviewCaptionPlatform}
                onChange={(event) => setReviewCaptionPlatform(event.target.value)}
              >
                <option value="instagram">Instagram Feed</option>
                <option value="story">Instagram/Facebook Story</option>
                <option value="facebook">Facebook Post</option>
                <option value="pinterest">Pinterest Pin</option>
              </select>
            </label>

            <pre>{buildReviewCaption(selectedReview, reviewCaptionPlatform)}</pre>

            <button type="button" onClick={() => copyReviewCaption(selectedReview)}>
              📋 Copy Caption
            </button>
          </div>

          {saveMessage && <p>{saveMessage}</p>}

          <button onClick={() => downloadReviewGraphicPng(selectedReview, getReviewGraphicOptions())}>
            Download Current Preview PNG
          </button>
          <button onClick={() => downloadSvgFile(selectedReview, getReviewGraphicOptions())}>
            Download SVG Backup
          </button>
          <button onClick={() => setStep("viewReview")}>Back to Review</button>
          <button onClick={() => setStep("library")}>Back to Library</button>
        </section>
      )}

      {step === 0 && (
        <section>
          <p>{editingReviewId ? "Edit Review" : "Step 0 of 5"}</p>
          <h1>Book Information</h1>
          <p>Start with the basics before the emotional damage begins.</p>

          <TextInput label="Title" value={bookInfo.title} onChange={(value) => updateBookInfo("title", value)} />
          <TextInput label="Author" value={bookInfo.author} onChange={(value) => updateBookInfo("author", value)} />

          <ImageUpload
            label="Upload Book Cover"
            value={bookInfo.coverUrl}
            onChange={(value) => updateBookInfo("coverUrl", value)}
          />

          <TextInput label="Series" value={bookInfo.series} onChange={(value) => updateBookInfo("series", value)} />
          <TextInput label="Book Number" value={bookInfo.bookNumber} onChange={(value) => updateBookInfo("bookNumber", value)} />
          <TextInput label="Genre" value={bookInfo.genre} onChange={(value) => updateBookInfo("genre", value)} />
          <TextInput label="Total Pages" value={bookInfo.totalPages} onChange={(value) => updateBookInfo("totalPages", value)} />

          <div className="score-card">
            <p>Spice Rating</p>
            <ScoreSlider
              label="Spice"
              question="How spicy was the book?"
              value={metrics.spice}
              onChange={(value) => updateMetric("spice", value)}
            />
          </div>

          <div className="score-card">
            <p>Reading Dates</p>
            <p>
              These can be edited manually, but the app will also fill them in
              automatically when you start or finish a book.
            </p>

            <DateInput label="Date Started" value={bookInfo.dateStarted} onChange={(value) => updateBookInfo("dateStarted", value)} />
            <DateInput label="Date Finished" value={bookInfo.dateFinished} onChange={(value) => updateBookInfo("dateFinished", value)} />
          </div>

          {bookInfo.status === "Reading" && (
            <TextInput
              label="Current Page"
              value={bookInfo.currentPage}
              onChange={(value) => updateBookInfo("currentPage", value)}
            />
          )}

          {bookInfo.status === "Reading" && bookInfo.totalPages && (
            <ProgressBar percent={readingProgressPercent} />
          )}

          <ImageUpload
            label="Upload Review Graphic"
            value={bookInfo.reviewGraphicUrl}
            onChange={(value) => updateBookInfo("reviewGraphicUrl", value)}
          />

          <label>
            Format
            <select value={bookInfo.format} onChange={(e) => updateBookInfo("format", e.target.value)}>
              <option>Kindle</option>
              <option>KU</option>
              <option>Physical</option>
              <option>Audiobook</option>
            </select>
          </label>

          <label>
            Reading Status
            <select value={bookInfo.status} onChange={(e) => updateBookInfo("status", e.target.value)}>
              <option>TBR</option>
              <option>Reading</option>
              <option>Finished</option>
              <option>DNF</option>
            </select>
          </label>

          {editingReviewId && (
            <button type="button" onClick={saveReviewBasicChanges}>
              Save Book Info
            </button>
          )}

          <button onClick={() => setStep("home")}>Back Home</button>
          <button onClick={handleBookInfoNext}>
            {bookInfo.status === "DNF"
              ? "Next: DNF Details"
              : bookInfo.status === "Reading"
              ? "Next: Reading Summary"
              : bookInfo.status === "TBR"
              ? "Save to TBR"
              : "Next: Book Score"}
          </button>
        </section>
      )}

      {step === "readingSummary" && (
        <section>
          <p>{editingReviewId ? "Edit Reading Progress" : "Currently Reading"}</p>
          <h1>Reading Progress</h1>

          {bookInfo.coverUrl && (
            <img src={bookInfo.coverUrl} alt="Book cover" className="book-cover" />
          )}

          <h2>{bookInfo.title || "Untitled Book"}</h2>
          <p>{bookInfo.author || "Unknown Author"}</p>
          <p>{bookInfo.format} • {bookInfo.status}</p>

          <div className="score-card">
            <p>Progress</p>
            <h2>{readingProgressPercent}%</h2>
            <p>
              Page {bookInfo.currentPage || "0"} of {bookInfo.totalPages || "?"}
            </p>
            <ProgressBar percent={readingProgressPercent} />
          </div>

          <div className="score-card">
            <p>Reading Copy</p>
            <pre>{readingReviewText}</pre>
          </div>

          <button onClick={() => setStep(0)}>Back</button>
          <button onClick={saveReview}>
            {editingReviewId ? "Update Reading Progress" : "Save to Currently Reading"}
          </button>
          <button onClick={() => setStep("currentlyReading")}>View Currently Reading</button>

          {saveMessage && <p>{saveMessage}</p>}
        </section>
      )}

      {step === "dnf" && (
        <section>
          <p>{editingReviewId ? "Edit DNF" : "DNF Details"}</p>
          <h1>DNF Tracker</h1>
          <p>Sometimes the book simply does not deserve your peace.</p>

          {bookInfo.coverUrl && (
            <img src={bookInfo.coverUrl} alt="Book cover" className="book-cover" />
          )}

          <h2>{bookInfo.title || "Untitled Book"}</h2>
          <p>{bookInfo.author || "Unknown Author"}</p>

          <TextInput
            label="DNF Percent"
            value={dnfInfo.percent}
            onChange={(value) => updateDnfInfo("percent", value)}
          />

          <ReviewTextArea
            label="DNF Reason"
            value={dnfInfo.reason}
            placeholder="Why did you quit?"
            onChange={(value) => updateDnfInfo("reason", value)}
          />

          <label>
            Would You Read This Author Again?
            <select
              value={dnfInfo.wouldReadAuthorAgain}
              onChange={(e) =>
                updateDnfInfo("wouldReadAuthorAgain", e.target.value)
              }
            >
              <option>Yes</option>
              <option>Maybe</option>
              <option>No</option>
            </select>
          </label>

          <button onClick={() => setStep(0)}>Back</button>
          <button onClick={() => setStep("dnfSummary")}>Next: DNF Summary</button>
        </section>
      )}

      {step === "dnfSummary" && (
        <section>
          <p>{editingReviewId ? "Edit DNF" : "DNF Summary"}</p>
          <h1>DNF Summary</h1>

          {bookInfo.coverUrl && (
            <img src={bookInfo.coverUrl} alt="Book cover" className="book-cover" />
          )}

          <h2>{bookInfo.title || "Untitled Book"}</h2>
          <p>{bookInfo.author || "Unknown Author"}</p>
          <p>{bookInfo.format} • DNF</p>

          <div className="score-card">
            <p>DNF Percent</p>
            <h2>{dnfInfo.percent || "?"}%</h2>
          </div>

          <p>
            <strong>DNF Reason:</strong>
            <br />
            {dnfInfo.reason || "No reason listed"}
          </p>

          <p>
            <strong>Would read this author again?</strong>
            <br />
            {dnfInfo.wouldReadAuthorAgain}
          </p>

          <div className="score-card">
            <p>DNF Copy</p>
            <pre>{dnfReviewText}</pre>
          </div>

          <button onClick={() => setStep("dnf")}>Back</button>
          <button onClick={saveReview}>
            {editingReviewId ? "Update DNF" : "Save DNF"}
          </button>
          <button onClick={() => setStep("library")}>View Library</button>

          {saveMessage && <p>{saveMessage}</p>}
        </section>
      )}

      {step === 1 && (
        <section>
          <p>{editingReviewId ? "Edit Review" : "Step 1 of 5"}</p>
          <h1>Book Score</h1>
          <p>Rate how the book worked on paper.</p>

          <ScoreSlider label="Plot" question="Did the story keep your attention?" value={scores.plot} onChange={(value) => updateScore("plot", value)} />
          <ScoreSlider label="Vibe" question="Did the book deliver the atmosphere it promised?" value={scores.vibe} onChange={(value) => updateScore("vibe", value)} />
          <ScoreSlider label="Characters" question="Did you care about these people?" value={scores.characters} onChange={(value) => updateScore("characters", value)} />
          <ScoreSlider label="Writing Style" question="Did the author's voice work for you?" value={scores.writingStyle} onChange={(value) => updateScore("writingStyle", value)} />
          <ScoreSlider label="Enjoyability" question="Did you want to keep reading?" value={scores.enjoyability} onChange={(value) => updateScore("enjoyability", value)} />

          <div className="score-card">
            <p>On Paper Score</p>
            <h2>{bookScore.toFixed(1)} / 5</h2>
          </div>

          <button onClick={() => setStep(0)}>Back</button>
          <button onClick={() => setStep(2)}>Next: Romance Metrics</button>
        </section>
      )}

      {step === 2 && (
        <section>
          <p>{editingReviewId ? "Edit Review" : "Step 2 of 5"}</p>
          <h1>Romance Reader Metrics</h1>

          <ScoreSlider label="Chemistry" question="How strong was the chemistry?" value={metrics.chemistry} onChange={(value) => updateMetric("chemistry", value)} />
          <ScoreSlider label="Tension" question="How much romantic tension was there?" value={metrics.tension} onChange={(value) => updateMetric("tension", value)} />
          <ScoreSlider label="Emotional Damage" question="How emotionally wrecked were you?" value={metrics.emotionalDamage} onChange={(value) => updateMetric("emotionalDamage", value)} />
          <ScoreSlider label="Book Hangover" question="How much are you still thinking about it?" value={metrics.bookHangover} onChange={(value) => updateMetric("bookHangover", value)} />
          <ScoreSlider label="Content Intensity" question="How intense was the content overall?" value={metrics.contentIntensity} onChange={(value) => updateMetric("contentIntensity", value)} />

          <button onClick={() => setStep(1)}>Back</button>
          <button onClick={() => setStep(3)}>Next: Scrapbook Notes</button>
        </section>
      )}

      {step === 3 && (
        <section>
          <p>{editingReviewId ? "Edit Review" : "Step 3 of 5"}</p>
          <h1>Scrapbook Notes</h1>

          <div className="review-field">
            <label>Tropes</label>

            <div className="trope-grid">
              {tropeOptions.map((trope) => (
                <label key={trope} className="trope-option">
                  <input
                    type="checkbox"
                    checked={tropes.includes(trope)}
                    onChange={() => toggleTrope(trope)}
                  />
                  {trope}
                </label>
              ))}
            </div>
          </div>

          <ReviewTextArea label="One-Sentence Review" value={review.oneSentenceReview} onChange={(value) => updateReview("oneSentenceReview", value)} />
          <ReviewTextArea label="Favorite Thing" value={review.favoriteThing} onChange={(value) => updateReview("favoriteThing", value)} />
          <ReviewTextArea label="Biggest Complaint" value={review.biggestComplaint} onChange={(value) => updateReview("biggestComplaint", value)} />
          <ReviewTextArea label="Vibe Check" value={review.vibeCheck} placeholder="This book felt like..." onChange={(value) => updateReview("vibeCheck", value)} />

          <button onClick={() => setStep(2)}>Back</button>
          <button onClick={() => setStep(4)}>Next: Obsession Score</button>
        </section>
      )}

      {step === 4 && (
        <section>
          <p>{editingReviewId ? "Edit Review" : "Step 4 of 5"}</p>
          <h1>❤️ Obsession Score</h1>
          <p>I just finished this book. How obsessed am I?</p>

          <div className="score-card">
            <h2>{obsessionScore} / 5</h2>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={obsessionScore}
            onChange={(e) => setObsessionScore(Number(e.target.value))}
          />

          <label>
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
            />
            This book altered my brain chemistry
          </label>

          <label>
            Recommendation Level
            <select value={recommendationLevel} onChange={(e) => setRecommendationLevel(e.target.value)}>
              <option>Skip It</option>
              <option>Only If The Trope Interests You</option>
              <option>Recommend</option>
              <option>Strongly Recommend</option>
              <option>Altered My Brain Chemistry</option>
            </select>
          </label>

          <button onClick={() => setStep(3)}>Back</button>
          <button onClick={() => setStep(5)}>Next: Results</button>
        </section>
      )}

      {step === 5 && (
        <section>
          <p>{editingReviewId ? "Edit Review" : "Step 5 of 5"}</p>
          <h1>Review Summary</h1>

          {bookInfo.coverUrl && (
            <img src={bookInfo.coverUrl} alt="Book cover" className="book-cover" />
          )}

          {isFavorite && <p>🧠 Brain Chemistry Book</p>}

          <h2>{bookInfo.title || "Untitled Book"}</h2>
          <p>{bookInfo.author || "Unknown Author"}</p>
          <p>{bookInfo.format} • {bookInfo.status}</p>

          <div className="score-card">
            <p>On Paper Score</p>
            <h2>{bookScore.toFixed(1)} / 5</h2>
          </div>

          <div className="score-card">
            <p>Obsession Score</p>
            <h2>{obsessionScore} / 5</h2>
          </div>

          <div className="score-card">
            <p>Recommendation</p>
            <h2>{recommendationLevel}</h2>
          </div>

          <div className="score-card">
            <p>Spice Rating</p>
            <h2>{metrics.spice} / 5</h2>
          </div>

          <p><strong>Tropes:</strong><br />{tropes.length > 0 ? tropes.join(" • ") : "None selected"}</p>
          <p><strong>One-Sentence Review:</strong><br />{review.oneSentenceReview}</p>
          <p><strong>Favorite Thing:</strong><br />{review.favoriteThing}</p>
          <p><strong>Biggest Complaint:</strong><br />{review.biggestComplaint}</p>
          <p><strong>Vibe Check:</strong><br />{review.vibeCheck}</p>

          {bookInfo.reviewGraphicUrl && (
            <div className="score-card">
              <p>Review Graphic</p>

              <img
                src={bookInfo.reviewGraphicUrl}
                alt="Review graphic"
                className="review-graphic"
              />
            </div>
          )}

          <div className="score-card">
            <p>Mini Review Copy</p>
            <pre>{miniReviewText}</pre>
          </div>

          <button onClick={() => setStep(4)}>Back</button>
          <button onClick={saveReview}>
            {editingReviewId ? "Update Review" : "Save Review"}
          </button>
          <button onClick={() => setStep("library")}>View Library</button>

          {saveMessage && <p>{saveMessage}</p>}
        </section>
      )}
    </main>
  )
}



function DateInput({ label, value, onChange }) {
  const dateValue = value ? value.slice(0, 10) : ""

  return (
    <div className="review-field">
      <label>{label}</label>
      <input
        type="date"
        value={dateValue}
        onChange={(e) => {
          const newValue = e.target.value
            ? new Date(`${e.target.value}T12:00:00`).toISOString()
            : ""

          onChange(newValue)
        }}
      />
    </div>
  )
}

function TextInput({ label, value, onChange }) {
  return (
    <div className="review-field">
      <label>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function ImageUpload({ label, value, onChange }) {
  function handleImageUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onloadend = () => {
      onChange(reader.result)
    }

    reader.readAsDataURL(file)
  }

  return (
    <div className="review-field">
      <label>{label}</label>

      {value && (
        <img src={value} alt={label} className="book-cover" />
      )}

      <input type="file" accept="image/*" onChange={handleImageUpload} />
    </div>
  )
}

function ScoreSlider({ label, question, value, onChange }) {
  return (
    <div className="slider-row">
      <div className="slider-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <p className="slider-question">{question}</p>
      <input type="range" min="0" max="5" step="0.5" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function ReviewTextArea({ label, value, placeholder, onChange }) {
  return (
    <div className="review-field">
      <label>{label}</label>
      <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export default App
