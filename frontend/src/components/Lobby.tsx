import { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

type Props = {
  user: User;
};

export default function Lobby({ user }: Props) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const createMeeting = async () => {
    try {
      const docRef = await addDoc(collection(db, "meetings"), {
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        participants: [user.uid],
      });

      navigate(`/meeting/${docRef.id}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
      <p className="text-gray-600 mb-4">What would you like to do?</p>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Meeting ID"
          className="border px-3 py-2 rounded w-64"
        />
        <button className="ml-2 bg-green-500 text-white px-4 py-2 rounded">
          Join Meeting
        </button>
      </div>

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={createMeeting}
      >
        Create New Meeting
      </button>

      <div className="mt-6">
        <button
          className="text-sm text-red-500 underline"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
