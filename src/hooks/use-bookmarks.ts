import { useState, useEffect } from "react"
import { toast } from "sonner"

export interface BookmarkedTweet {
  id: string
  text: string
  tweetType: string
  project: {
    name: string
    twitterUsername: string
    banner: string | null
    icon: string
  }
  savedAt: string
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedTweet[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  
  useEffect(() => {
    const saved = localStorage.getItem("tweet-bookmarks")
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to load bookmarks:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("tweet-bookmarks", JSON.stringify(bookmarks))
    }
  }, [bookmarks, isLoaded])

  const addBookmark = (tweet: Omit<BookmarkedTweet, "id" | "savedAt">) => {
    const newBookmark: BookmarkedTweet = {
      ...tweet,
      id: `${Date.now()}-${Math.random()}`,
      savedAt: new Date().toISOString(),
    }
    setBookmarks((prev) => [newBookmark, ...prev])
    toast.success("Tweet bookmarked successfully!")
    return newBookmark
  }

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
    toast.success("Bookmark removed")
  }

  const isBookmarked = (text: string) => {
    return bookmarks.some((b) => b.text === text)
  }

const toggleBookmark = (
  tweet: Omit<BookmarkedTweet, "id" | "savedAt">,
) => {
  const existing = bookmarks.find((b) => b.text === tweet.text);

  if (existing) {
    removeBookmark(existing.id);
    return { removed: true };
  }

  const newBookmark = addBookmark(tweet);
  return { added: true, bookmark: newBookmark };
};


  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  }
}
