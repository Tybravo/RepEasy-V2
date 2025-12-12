import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Globe,
  Rocket,
  Camera,
  Users,
  Twitter,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FloatingOrb = ({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.4, 0.2],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const GlowCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className={`relative group ${className}`}
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
    <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      {children}
    </div>
  </motion.div>
);

export default function CommunityModal({
  isOpen,
  onClose,
}: CommunityModalProps) {
  const images = [
    "https://pbs.twimg.com/media/G7GdDS7XoAA3f02?format=jpg&name=4096x4096",
    "https://pbs.twimg.com/media/G7GdDS_XoAEIFxi?format=jpg&name=4096x4096",
    "https://pbs.twimg.com/media/G7GdDTBWoAECvVg?format=jpg&name=4096x4096",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.98 }}
            exit={{ opacity: 0 }}
          />

          {/* Floating orbs */}
          <FloatingOrb
            className="w-96 h-96 bg-cyan-500 -top-20 -left-20"
            delay={0}
          />
          <FloatingOrb
            className="w-80 h-80 bg-purple-500 top-1/2 -right-20"
            delay={1}
          />
          <FloatingOrb
            className="w-64 h-64 bg-blue-500 bottom-20 left-1/4"
            delay={2}
          />

          {/* Content */}
          <motion.div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
            initial={{ y: 60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              onClick={onClose}
              className="fixed top-4 right-4 sm:top-6 sm:right-6 p-2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm z-50 border border-white/10"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="space-y-6 p-2">
              {/* Hero Header */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center py-8"
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-6"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(16, 185, 129, 0.2)",
                      "0 0 40px rgba(16, 185, 129, 0.4)",
                      "0 0 20px rgba(16, 185, 129, 0.2)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-300">
                    Africa's Premier Sui Community
                  </span>
                </motion.div>

                <motion.h1
                  className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: "200% auto" }}
                >
                  SuiHub Africa
                </motion.h1>

                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  Empowering the next generation of blockchain innovators across
                  Africa
                </p>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-3 gap-4 mb-8"
              >
                {[
                  {
                    label: "Members",
                    value: "500+",
                    color: "from-cyan-400 to-blue-500",
                  },
                  {
                    label: "Events",
                    value: "10+",
                    color: "from-emerald-400 to-cyan-500",
                  },
                  {
                    label: "Projects",
                    value: "100+",
                    color: "from-purple-400 to-pink-500",
                  },
                ].map((stat,) => (
                  <motion.div
                    key={stat.label}
                    className="relative group"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity`}
                    />
                    <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                      <div
                        className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400 mt-1">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* About Section */}
              <GlowCard delay={0.3}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      About Sui Hub Africa
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                      Sui Hub Lagos is a vibrant and fast-growing blockchain
                      community in Nigeria, focused on empowering developers,
                      creators, and users within the Sui ecosystem. Through
                      meetups, workshops, hackathons, and community programs, we
                      help people learn, build, and innovate on Sui.
                    </p>
                  </div>
                </div>
              </GlowCard>

              {/* Repeasy Section */}
              <GlowCard delay={0.4}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
                    <Rocket className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      About RepEasy
                    </h2>
                    <p className="text-slate-300 leading-relaxed mb-4">
                      RepEasy is a Sui-powered tool designed to help the
                      community easily promote Sui projects on social media. It
                      auto-generates tweet content, allowing users to copy,
                      bookmark, or instantly tweet via prefilled Twitter
                      intents.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        "Auto-generated tweet suggestions",
                        "One-click Tweet Intent",
                        "Bookmark tweets for later",
                        "Clean, fast UI",
                      ].map((feature, i) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                          <span className="text-sm text-slate-400">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlowCard>

              {/* Gallery Section */}
              <GlowCard delay={0.5}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <Camera className="w-6 h-6 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Community Gallery
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <motion.div
                      key={i}
                      className="relative group overflow-hidden rounded-xl aspect-square"
                      whileHover={{ scale: 1.05, zIndex: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                      <img
                        src={img}
                        alt={`Community ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 border-2 border-white/0 group-hover:border-cyan-400/50 rounded-xl transition-colors z-20" />
                    </motion.div>
                  ))}
                </div>
              </GlowCard>

              {/* Join Section */}
              <GlowCard delay={0.6}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-3">
                      Join Our Community
                    </h2>
                    <p className="text-slate-300 mb-4">
                      Join our growing African Sui community and become part of
                      the movement.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <motion.a
                        href="https://twitter.com/SuiHubAfrica"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Twitter className="w-4 h-4" />
                        @SuiHubAfrica
                      </motion.a>
                      <motion.a
                        href="#"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all border border-white/10"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Join Telegram
                      </motion.a>
                    </div>
                  </div>
                </div>
              </GlowCard>

              {/* Footer */}
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center py-6"
              >
                <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-8 h-px bg-gradient-to-r from-transparent to-slate-600" />
                  Powered by Sui Community Nigeria — Built with pride in Lagos
                  <span className="w-8 h-px bg-gradient-to-l from-transparent to-slate-600" />
                </div>
              </motion.footer>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
