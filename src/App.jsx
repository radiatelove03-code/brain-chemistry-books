import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import Auth from "./Auth"
import "./App.css"

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

function App() {
  const [step, setStep] = useState("home")
  const [user, setUser] = useState(null)
  const [selectedReview, setSelectedReview] = useState(null)
  const [selectedReadingLogBookId, setSelectedReadingLogBookId] = useState(null)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [libraryFilter, setLibraryFilter] = useState("all")

  const [savedReviews, setSavedReviews] = useState(() => {
    const saved = localStorage.getItem("brainChemistryBooksReviews")
    return saved ? JSON.parse(saved) : []
  })

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
  const [progressInputs, setProgressInputs] = useState({})
  const [readingLogDrafts, setReadingLogDrafts] = useState({})
  const [readingLogDirty, setReadingLogDirty] = useState({})
  const [readingLogs, setReadingLogs] = useState([])
  const [readingLogMinutesInputs, setReadingLogMinutesInputs] = useState({})
  const [readingLogNoteInputs, setReadingLogNoteInputs] = useState({})

  const filteredReviews = savedReviews.filter((item) => {
    if (libraryFilter === "favorites") return item.isFavorite
    if (libraryFilter === "reading") return item.bookInfo.status === "Reading"
    if (libraryFilter === "finished") return item.bookInfo.status === "Finished"
    if (libraryFilter === "dnf") return item.bookInfo.status === "DNF"
    return true
  })

  const totalBooks = savedReviews.length
  const finishedReviews = savedReviews.filter(
    (item) => item.bookInfo.status === "Finished"
  )
  const dnfReviews = savedReviews.filter(
    (item) => item.bookInfo.status === "DNF"
  )
  const currentlyReadingReviews = savedReviews.filter(
    (item) => item.bookInfo.status === "Reading"
  )

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
            (sum, item) => sum + Number(item.metrics.spice),
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
    item.tropes.forEach((trope) => {
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

  function openSavedReview(reviewItem) {
    setSelectedReview(reviewItem)
    setStep("viewReview")
  }

  async function deleteReview(reviewId) {
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

    setBookInfo(reviewItem.bookInfo)

    setDnfInfo(
      reviewItem.dnfInfo || {
        percent: "",
        reason: "",
        wouldReadAuthorAgain: "Maybe",
      }
    )

    setScores(
      reviewItem.scores || {
        plot: 0,
        vibe: 0,
        characters: 0,
        writingStyle: 0,
        enjoyability: 0,
      }
    )

    setMetrics(
      reviewItem.metrics || {
        spice: 0,
        chemistry: 0,
        tension: 0,
        emotionalDamage: 0,
        bookHangover: 0,
        contentIntensity: 0,
      }
    )

    setReview(
      reviewItem.review || {
        oneSentenceReview: "",
        favoriteThing: "",
        biggestComplaint: "",
        vibeCheck: "",
      }
    )

    setTropes(reviewItem.tropes || [])
    setObsessionScore(reviewItem.obsessionScore || 5)
    setRecommendationLevel(reviewItem.recommendationLevel || "Recommend")
    setIsFavorite(reviewItem.isFavorite || false)
    setEditingReviewId(reviewItem.id)
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
    const diffMs = finished - started

    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
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
    if (user) {
      const cloudBookIds = new Set(readingLogs.map((log) => log.bookId))
      const embeddedLogsWithoutCloudCopies = savedReviews.flatMap((item) => {
        if (cloudBookIds.has(item.id)) return []

        return (item.readingLogs || []).map((log) => ({
          ...log,
          bookId: item.id,
          title: item.bookInfo?.title || "Untitled Book",
        }))
      })

      const cloudLogs = readingLogs.map((log) => {
        const book = savedReviews.find((item) => item.id === log.bookId)
        return {
          ...log,
          title: book?.bookInfo?.title || "Untitled Book",
        }
      })

      return [...cloudLogs, ...embeddedLogsWithoutCloudCopies]
    }

    return savedReviews.flatMap((item) =>
      (item.readingLogs || []).map((log) => ({
        ...log,
        bookId: item.id,
        title: item.bookInfo?.title || "Untitled Book",
      }))
    )
  }

  function getReadingStreakStats() {
    const logs = getAllReadingLogs()
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


  function getReadingAnalyticsStats() {
    const logs = getAllReadingLogs()
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
      averageDaysToFinish,
      fastestRead,
      slowestRead,
      totalSessions: logs.length,
    }
  }

  const readingStreakStats = getReadingStreakStats()
  const readingAnalyticsStats = getReadingAnalyticsStats()

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
    }

    if (!user) {
      localStorage.setItem(
        "brainChemistryBooksReviews",
        JSON.stringify(updatedReviews)
      )
    }

    return true
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

  async function loadCloudReviews(currentUser) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("updated_at", { ascending: false })

    if (error) {
      setSaveMessage(error.message)
      return
    }

    const cloudReviews = data.map((row) => ({
      ...row.review_data,
      id: row.id,
    }))

    setSavedReviews(cloudReviews)
  }

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)

    if (user) {
      await loadCloudReviews(user)
      await loadCloudReadingLogs(user)
    } else {
      const saved = localStorage.getItem("brainChemistryBooksReviews")
      setSavedReviews(saved ? JSON.parse(saved) : [])
      setReadingLogs([])
    }
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
      } else {
        const saved = localStorage.getItem("brainChemistryBooksReviews")
        setSavedReviews(saved ? JSON.parse(saved) : [])
        setReadingLogs([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <main>
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

          <p>Brain Chemistry Books</p>
          <h1>Reading scrapbook meets data analysis.</h1>
          <p>
            Track your ratings, spice, tropes, emotional damage, and the books
            that altered your brain chemistry.
          </p>

          <button onClick={startNewReview}>Start New Review</button>
          <button onClick={() => setStep("currentlyReading")}>Currently Reading</button>
          <button onClick={() => setStep("library")}>View Library</button>
          <button onClick={() => setStep("analytics")}>Reading Analytics</button>

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


      {step === "analytics" && (
        <section>
          <p>Reading Analytics</p>
          <h1>Your reading data dashboard.</h1>
          <p>Built from your reading log entries, finished dates, pages, minutes, and notes.</p>

          {saveMessage && <p>{saveMessage}</p>}

          {savedReviews.length > 0 && (
            <div className="score-card">
              <p>📚 Library Snapshot</p>
              <p>Books Saved: {totalBooks}</p>
              <p>Finished Reviews: {finishedReviews.length}</p>
              <p>Finished This Year: {yearToDateCount}</p>
              <p>Currently Reading: {currentlyReadingReviews.length}</p>
              <p>DNFs: {dnfReviews.length}</p>
              <p>Brain Chemistry Books: {brainChemistryCount}</p>
            </div>
          )}

          {finishedReviews.length > 0 && (
            <div className="score-card">
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

          <div className="score-card">
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

          <div className="score-card">
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

          <div className="score-card">
            <p>⏱️ Time</p>
            <p>Minutes Read This Month: {readingAnalyticsStats.minutesThisMonth}</p>
            <p>Minutes Read This Year: {readingAnalyticsStats.minutesThisYear}</p>
            <p>Total Hours Read: {readingAnalyticsStats.totalHours}</p>
            <p>Average Session Length: {readingAnalyticsStats.averageSessionLength} minutes</p>
            <p>Estimated Pace: {readingAnalyticsStats.pagesPerHour} pages/hour</p>
          </div>

          <div className="score-card">
            <p>✅ Finished Book Stats</p>
            <p>Books Finished This Month: {readingAnalyticsStats.finishedThisMonth}</p>
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

          {filteredReviews.length === 0 && (
            <p>No reviews found for this filter.</p>
          )}

          {filteredReviews.map((item) => (
            <div className="score-card" key={item.id}>
              {item.bookInfo.coverUrl && (
                <img
                  src={item.bookInfo.coverUrl}
                  alt="Book cover"
                  className="book-cover"
                />
              )}

              {item.bookInfo.status === "DNF" ? (
                <>
                  <p>🚫 DNF</p>
                  <h2>{item.bookInfo.title || "Untitled Book"}</h2>
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
                  <h2>{item.bookInfo.title || "Untitled Book"}</h2>
                  <p>{item.bookInfo.author || "Unknown Author"}</p>
                  <p>{item.bookInfo.format} • Reading</p>
                  {item.bookInfo.dateStarted && (
                    <p>📖 Started {formatDate(item.bookInfo.dateStarted)}</p>
                  )}
                  <p>
                    Page {item.bookInfo.currentPage || "0"} of {item.bookInfo.totalPages || "?"}
                  </p>
                  <ProgressBar percent={getProgressPercent(item.bookInfo)} />

                  <button onClick={() => finishBook(item)}>
                    ✅ Finish Book
                  </button>
                </>
              ) : (
                <>
                  {item.isFavorite && <p>🧠 Brain Chemistry Book</p>}

                  <h2>{item.bookInfo.title || "Untitled Book"}</h2>
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

              <button onClick={() => openSavedReview(item)}>View Review</button>
              <button onClick={() => editReview(item)}>Edit Review / Dates</button>
              <button onClick={() => deleteReview(item.id)}>Delete</button>
            </div>
          ))}

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

                <button onClick={() => finishBook(selectedReview)}>
                  ✅ Finish Book
                </button>
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
                <h2>{selectedReview.metrics.spice} / 5</h2>
              </div>

              <div className="score-card">
                <p>Recommendation</p>
                <h2>{selectedReview.recommendationLevel}</h2>
              </div>

              <p>
                <strong>Tropes:</strong>
                <br />
                {selectedReview.tropes.length > 0
                  ? selectedReview.tropes.join(" • ")
                  : "None selected"}
              </p>

              <p>
                <strong>One-Sentence Review:</strong>
                <br />
                {selectedReview.review.oneSentenceReview}
              </p>

              <p>
                <strong>Favorite Thing:</strong>
                <br />
                {selectedReview.review.favoriteThing}
              </p>

              <p>
                <strong>Biggest Complaint:</strong>
                <br />
                {selectedReview.review.biggestComplaint}
              </p>

              <p>
                <strong>Vibe Check:</strong>
                <br />
                {selectedReview.review.vibeCheck}
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

          <button onClick={() => setStep("library")}>Back to Library</button>
          <button onClick={() => editReview(selectedReview)}>Edit Review / Dates</button>
          <button onClick={() => deleteReview(selectedReview.id)}>
            Delete Review
          </button>
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

          <ScoreSlider label="Spice" question="How spicy was the book?" value={metrics.spice} onChange={(value) => updateMetric("spice", value)} />
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


function ProgressBar({ percent }) {
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${percent}%` }}></div>
      <span>{percent}%</span>
    </div>
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
