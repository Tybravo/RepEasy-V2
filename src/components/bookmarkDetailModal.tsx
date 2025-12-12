import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import type { BookmarkedTweet } from "../hooks/use-bookmarks";

interface BookmarkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark: BookmarkedTweet | null;
  onRemove: (id: string) => void;
}

const ProjectHeader = ({
  onBack,
  project,
}: {
  onBack?: () => void;
  project?: {
    name: string;
    twitterUsername: string;
    banner: string | null;
    icon: string;
  };
}) => {
  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        onClick={onBack}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1 text-muted-foreground hover:text-foreground bg-muted rounded-full hover:bg-muted/80 z-50"
      >
        <X className="h-5 w-5" />
      </Button>

      <div
        className="flex gap-3 sm:gap-4 mb-4 sm:mb-4 rounded-lg border border-border p-3 sm:p-4"
        style={{
          backgroundImage: project?.banner
            ? `url(${project?.banner})`
            : "linear-gradient(to right, #3C83F6)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: project?.banner ? "rgba(0,0,0,0.4)" : "#3C83F6",
        }}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-lg overflow-hidden">
            <img
              src={project?.icon || "/placeholder.svg"}
              alt={project?.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const BookmarkDetailModal = ({
  isOpen,
  onClose,
  bookmark,
  onRemove,
}: BookmarkDetailModalProps) => {
  if (!bookmark) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmark.text);
    toast.success("Copied successfully!");
  };

  const handleTweet = () => {
    const tweetText = encodeURIComponent(bookmark.text);
    const twitterUrl = `https://x.com/intent/post?text=${tweetText}`;
    window.open(twitterUrl, "_blank");
    toast.success("Redirecting to X...");
  };

  const handleRemove = () => {
    onRemove(bookmark.id);
    onClose();
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 overflow-y-auto py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-3xl w-[85vh] max-h-[85vh] overflow-y-auto scrollbar-hide bg-background p-6 md:p-8 rounded-2xl shadow-2xl border"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ProjectHeader onBack={onClose} project={bookmark.project} />

            <div className="mt-1 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Bookmarked Tweet
                </h2>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Tweet Type:</span>
                    <span className="font-medium text-foreground capitalize">
                      {bookmark.tweetType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Saved:</span>
                    <span className="font-medium text-foreground">
                      {formatDate(bookmark.savedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-0">
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">
                    {bookmark.project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {bookmark.text}
                  </p>
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      variant="default"
                      size="icon"
                      onClick={handleRemove}
                      className="h-9 w-9 hover:bg-destructive/80 bg-destructive text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={handleCopy}
                      className="h-9 w-9 hover:bg-foreground/60"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={handleTweet}
                      className="bg-foreground text-background hover:bg-foreground/60"
                    >
                      Tweet
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookmarkDetailModal;
