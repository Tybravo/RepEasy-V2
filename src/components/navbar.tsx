import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bookmark, LogIn,  BarChart3 } from "lucide-react";
import AnalyticsModal from "./analytics-modal";
import { useBookmarksContext, type BookmarkedTweet } from "../hooks/BookmarksContext";
import BookmarkDetailModal from "./bookmarkDetailModal";
import CommunityModal from "./community-modal";
import image from "../assets/Gemini_Generated_Image_x27hd3x27hd3x27h.png"

interface NavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
  analytics?: {
    views: number;
    clicks: number;
    bookmarks: number;
  };
}

export default function Navbar({
  isLoggedIn = false,
  analytics = { views: 1234, clicks: 456, bookmarks: 12 },
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] =
    useState<BookmarkedTweet | null>(null);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

//   const { bookmarks, removeBookmark } = useBookmarks();
  const { bookmarks, removeBookmark } = useBookmarksContext();

  const bookmarksRef = useRef<HTMLDivElement>(null);
const bookmarkBtnRef = useRef<HTMLButtonElement>(null);



  const menuItems = [
    { label: "Analytics", href: null, onClick: () => setIsAnalyticsOpen(true) },
    { label: "Community", href: null, onClick: () => setIsCommunityOpen(true) },
  ];

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleBookmarkClick = (bookmark: BookmarkedTweet) => {
    setSelectedBookmark(bookmark);
    setIsBookmarkModalOpen(true);
    setIsBookmarksOpen(false);
  };



  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      bookmarksRef.current &&
      !bookmarksRef.current.contains(event.target as Node) &&
      bookmarkBtnRef.current &&
      !bookmarkBtnRef.current.contains(event.target as Node)
    ) {
      setIsBookmarksOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);



  return (
    <>
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* Community Modal */}
      <CommunityModal
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
      />
      {/* Bookmark Detail Modal */}
      <BookmarkDetailModal
        isOpen={isBookmarkModalOpen}
        onClose={() => {
          setIsBookmarkModalOpen(false);
          setSelectedBookmark(null);
        }}
        bookmark={selectedBookmark}
        onRemove={removeBookmark}
      />

      <nav className="sticky top-0 z-40 bg-gradient-to-b from-[#020617] via-[#0b1e34] to-[#020617]/80 border-b border-white/10 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-lg shadow-cyan-400/50">
                <span className="text-white font-bold text-lg">R</span>
              </div> */}
              <img
                src={image}
                alt="RepEasy Logo"
                className="h-8 w-8 rounded-2xl"
              />
              <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-cyan-400 via-cyan-400 to-cyan-400 bg-clip-text text-transparent">
                RepEasy
                {/* text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-400 to-cyan-400" */}
              </span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <motion.div key={item.label}>
                  {item.href === null ? (
                    <motion.button
                      onClick={item.onClick}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1"
                    >
                      <BarChart3 className="w-4 h-4" />
                      {item.label}
                    </motion.button>
                  ) : (
                    <a
                      href={item.href}
                      className="px-3 py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1"
                    >
                      {item.label}
                    </a>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Right Side - Analytics, Bookmarks, Auth */}
            <div className="flex items-center gap-2 sm:gap-4">
              

              {/* Bookmarks Dropdown */}
              
              <div className="relative group">
                <motion.button
                 ref={bookmarkBtnRef}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}
                  className="relative p-2 text-gray-300 hover:text-cyan-400 transition-colors"
                  aria-label="Bookmarks"
                >
                  <Bookmark className="w-5 h-5" />
                  {bookmarks.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
                  )}
                </motion.button>

                {/* Bookmarks Menu */}
                <AnimatePresence>
                  {isBookmarksOpen && (
                    <motion.div
                    ref={bookmarksRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-72 bg-gradient-to-b from-[#0b1e34] to-[#020617] border border-white/10 rounded-lg shadow-xl backdrop-blur-lg overflow-hidden max-h-96 overflow-y-auto scrollbar-hide"

                    >
                      {bookmarks.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-400">
                          No bookmarked tweets yet
                        </div>
                      ) : (
                        bookmarks.map((bookmark) => (
                          <motion.button
                            key={bookmark.id}
                            onClick={() => handleBookmarkClick(bookmark)}
                            className="w-full text-left px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-cyan-400/10 transition-colors cursor-pointer"
                            whileHover={{ paddingLeft: 20 }}
                          >
                            <div className="flex gap-3">
                              <img
                                src={
                                  bookmark.project.icon || "/placeholder.svg"
                                }
                                alt={bookmark.project.name}
                                className="w-8 h-8 rounded object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-cyan-400 mb-1">
                                  {bookmark.project.name}
                                </p>
                                <p className="text-xs text-gray-300 line-clamp-2 mb-1">
                                  {bookmark.text}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatTime(bookmark.savedAt)}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>


              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-cyan-400 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-white/10 bg-gradient-to-b from-[#0b1e34]/50 to-transparent backdrop-blur-sm"
              >
                <div className="px-4 py-4 space-y-3">
                  {menuItems.map((item) => (
                    <motion.div key={item.label} whileHover={{ x: 8 }}>
                      {item.href === null ? (
                        <motion.button
                          onClick={item.onClick}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full text-left block px-4 py-2 rounded-lg text-gray-300 hover:bg-cyan-400/10 hover:text-cyan-400 transition-colors flex items-center gap-2"
                        >
                          <BarChart3 className="w-4 h-4" />
                          {item.label}
                        </motion.button>
                      ) : (
                        <a
                          href={item.href}
                          className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-cyan-400/10 hover:text-cyan-400 transition-colors"
                        >
                          {item.label}
                        </a>
                      )}
                    </motion.div>
                  ))}

                  {/* Mobile Analytics */}
                  {isLoggedIn && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-3 gap-2 px-4 py-3 bg-white/5 rounded-lg border border-cyan-400/20 mt-4"
                    >
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Views</p>
                        <p className="text-sm font-bold text-cyan-400">
                          {analytics.views}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Clicks</p>
                        <p className="text-sm font-bold text-cyan-400">
                          {analytics.clicks}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Bookmarks</p>
                        <p className="text-sm font-bold text-cyan-400">
                          {analytics.bookmarks}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Mobile Auth Button */}
                  {!isLoggedIn && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-cyan-400/50 transition-shadow mt-4"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
}
