import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useState } from "react";

export default function Login() {
  const [user, setUser] = useState<any>(null);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // Save the user info
      console.log("Logged in as:", result.user.displayName);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">PBL Meeting</h1>
      {!user ? (
        <button
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-5"
        >
          Sign in with Google
        </button>
      ) : (
        <p className="mt-4 text-xl">Welcome, {user.displayName}!</p>
      )}
    </div>
  );
}