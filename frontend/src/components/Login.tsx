import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import GlobalChat from "./GlobalChat";

export default function Login() {
  const navigate = useNavigate();

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/lobby"); // 👈 redirect to lobby after login
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side: Chat */}
      <div className="w-2/3 p-6 border-r">
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
    </div>
  );
}
