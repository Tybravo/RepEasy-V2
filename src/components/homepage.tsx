
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Settings } from "lucide-react";
import ProjectCarousel from "./project-carousel";
import ProjectModal from "./project-modal";
import projects from "../data/giverep_projects.json";
import image from "../assets/Gemini_Generated_Image_x27hd3x27hd3x27h.png"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [filteredProjects, setFilteredProjects] = useState(projects);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (query === "") {
      setFilteredProjects(projects);
    } else {
      const results = projects.filter((p) =>
        p.name.toLowerCase().includes(query)
      );
      setFilteredProjects(results);
    }
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1e34] to-[#030712] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-4 py-12 sm:px-6 md:px-10 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_70%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.15),transparent_70%)]"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <a href="/" className="inline-flex items-center space-x-3 mb-6">
             <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
              
            > 
            
            <img src={image} alt="RepEasy Logo" className="h-14 w-14 rounded-2xl" />
           
          
            </motion.div> 
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-400 to-cyan-400">
              RepEasy
            </h1>
          </a>

          <p className="mx-auto mb-8 max-w-lg text-gray-300 leading-relaxed text-sm sm:text-base">
            A lightning-fast{" "}
            <span className="text-blue-400 font-semibold">
              AI-powered post generator
            </span>{" "}
            for all projects in the{" "}
            <span className="text-cyan-400 font-semibold">SUI ecosystem</span>.
          </p>

          {/* Search bar */}
          <div className="mx-auto max-w-md flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-lg px-5 py-3 border border-white/10 shadow-inner focus-within:ring-2 focus-within:ring-cyan-400">
            <Search className="h-5 w-5 text-gray-300" />
            <input
              type="text"
              placeholder=" Search for a SUI project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-400 text-sm sm:text-base"
            />
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.4 }}
            >
              <Settings className="h-5 w-5 text-gray-300 cursor-pointer" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Projects Section */}
      <section className="px-4 py-6 sm:px-6 md:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-lg sm:text-xl md:text-3xl font-semibold mb-10 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
        >
          Explore Trending SUI Projects
        </motion.h2>

        <ProjectCarousel
          projects={filteredProjects}
          onProjectClick={setSelectedProject}
        />
      </section>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      <footer className="text-center py-6 text-xs text-gray-500 border-t border-white/10">
        <h2 className="mb-4 text-center text-sm text-gray-800">S13</h2>
      </footer>
    </main>
  );
}
