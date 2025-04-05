import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">PBL Meeting</h1>
      <button
        onClick={login}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-5"
      >
        Sign in with Google
      </button>
    </div>
  );
}
