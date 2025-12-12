import Homepage from "./components/homepage";
import Navbar from "./components/navbar";
import { BookmarksProvider } from "./hooks/BookmarksContext";
import { Toaster } from "sonner";
function App() {
  return (
    <>
     <BookmarksProvider>
      <Navbar />
      <Homepage />

      <Toaster position="top-right" />
      </BookmarksProvider>
    </>
  );
}

export default App;
