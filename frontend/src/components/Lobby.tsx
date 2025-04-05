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
        alert("Meeting not found!");
        return;
      }

      // Add current user to participants
      await updateDoc(meetingRef, {
        participants: arrayUnion({ uid: user.uid, displayName: user.displayName }),
      });

      navigate(`/meeting/${meetingId}`);
    } catch (error) {
      console.error("Error joining meeting:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side: Chat */}
      <div className="w-2/3 p-6 border-r">
        <GlobalChat user={user} />
      </div>
  
      {/* Right side: Controls */}
      <div className="w-1/3 flex flex-col p-6 relative">
        {/* Logout at top-right */}
        <button
          onClick={handleLogout}
          className="absolute top-6 right-6 bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
  
        <div className="flex flex-col mt-20 items-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
          <input
            type="text"
            placeholder="Enter meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className="border px-3 py-2 rounded w-60"
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
    </div>
  );
}