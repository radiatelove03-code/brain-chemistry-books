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
  const [calendarMonthKey, setCalendarMonthKey] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  })
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  })

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
    const logs = getAllReadingLogs()
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
    const logs = getAllReadingLogs()

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
  const readingCalendarStats = getReadingCalendarStats(calendarMonthKey)
  const readingGoalStats = getReadingGoalStats()

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


  useEffect(() => {
    localStorage.setItem(
      "brainChemistryBooksReadingGoals",
      JSON.stringify(readingGoals)
    )
  }, [readingGoals])

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

          <div className="score-card">
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

          <div className="score-card">
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

          {selectedReview.bookInfo.status === "Finished" && (
            <button onClick={() => setStep("reviewGraphic")}>
              🎨 Generate Review Graphic
            </button>
          )}

          <button onClick={() => setStep("library")}>Back to Library</button>
          <button onClick={() => editReview(selectedReview)}>Edit Review / Dates</button>
          <button onClick={() => deleteReview(selectedReview.id)}>
            Delete Review
          </button>
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
