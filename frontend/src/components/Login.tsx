import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import GlobalChat from "./GlobalChat";
import ThemeToggle from "./ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/lobby"); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-black dark:bg-darkBg dark:text-darkText relative">
      {/* Left side: Chat */}
      <div className="w-2/3 p-6 border-r border-gray-300 dark:border-darkBorder">
        <GlobalChat />
      </div>

      {/* Right side: Login */}
      <div className="w-1/3 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-6">PBL Meeting</h1>
        <button
          onClick={login}
          className="bg-blue-500 text-white px-6 py-3 rounded text-lg"
        >
          Sign in with Google
        </button>
      </div>

      {/* Floating dark mode toggle */}
      <div className="absolute bottom-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
