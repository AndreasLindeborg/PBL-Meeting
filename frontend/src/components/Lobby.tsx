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
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
      <p className="text-gray-600 mb-4">What would you like to do?</p>
  
      <div className="space-x-2">
        <input
          type="text"
          placeholder="Enter meeting ID"
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={joinMeeting}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Join Meeting
        </button>
        <button
          onClick={createMeeting}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create New Meeting
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
  
      <GlobalChat user={user} />
    </div>
  );
}