import { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import GlobalChat from "./GlobalChat";
import ThemeToggle from "./ThemeToggle"; 
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Props = {
  user: User;
};

export default function Lobby({ user }: Props) {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");

  const handleLogout = async () => {
    await signOut(auth);
  };

  const createMeeting = async () => {
    try {
      const docRef = await addDoc(collection(db, "meetings"), {
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        participants: [{ uid: user.uid, displayName: user.displayName }],
        status: "waiting", 
        chairman: null,
        secretary: null,
      });
      navigate(`/meeting/${docRef.id}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const joinMeeting = async () => {
    try {
      const meetingRef = doc(db, "meetings", meetingId);
      const meetingSnap = await getDoc(meetingRef);
  
      if (!meetingSnap.exists()) {
        toast.error("Meeting not found!");
        return;
      }
  
      const meetingData = meetingSnap.data();
  
      if (meetingData.status === "ended") {
        toast.info("This meeting has ended.");
        return;
      }
  
      // Add current user to participants
      await updateDoc(meetingRef, {
        participants: arrayUnion({ uid: user.uid, displayName: user.displayName }),
      });
  
      // Redirect based on meeting status
      if (meetingData.status === "started") {
        navigate(`/meeting/${meetingId}/active`);
      } else {
        navigate(`/meeting/${meetingId}`);
      }
    } catch (error) {
      console.error("Error joining meeting:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-black dark:bg-darkBg dark:text-darkText relative">
      {/* Left side: Chat */}
      <div className="w-2/3 p-6 border-r border-gray-300 dark:border-darkBorder">
        <GlobalChat user={user} />
      </div>

      {/* Right side: Controls */}
      <div className="w-1/3 flex flex-col p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">PBL Meeting</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{user.displayName}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col mt-12 items-center space-y-4">
          <input
            type="text"
            placeholder="Enter meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className="border px-3 py-2 rounded w-60 dark:bg-gray-800 dark:border-gray-600"
          />
          <button
            onClick={joinMeeting}
            className="bg-green-500 text-white px-4 py-2 rounded w-60"
          >
            Join Meeting
          </button>
          <button
            onClick={createMeeting}
            className="bg-blue-500 text-white px-4 py-2 rounded w-60"
          >
            Create New Meeting
          </button>
        </div>
      </div>

      {/* Floating dark mode toggle */}
      <div className="absolute bottom-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
