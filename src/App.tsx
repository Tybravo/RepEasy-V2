import Homepage from "./components/homepage";
import Navbar from "./components/navbar";
import { BookmarksProvider } from "./hooks/BookmarksContext";
import { Toaster } from "sonner";
import { RegisterEnokiWallets } from "./components/register-enoki-wallets";
function App() {
  return (
    <>
     <BookmarksProvider>
      <Navbar />
      <RegisterEnokiWallets />
      <Homepage />

      <Toaster position="top-right" />
      </BookmarksProvider>
    </>
  );
}

export default App;
