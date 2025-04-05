import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "firebase/auth";
import ThemeToggle from "./ThemeToggle"; 

type Props = {
  user: User;
};

export default function Meeting({ user }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(
      doc(db, "meetings", id),
      (docSnap) => {
        if (docSnap.exists()) {
          setMeeting(docSnap.data());
        } else {
          console.error("Meeting not found");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching meeting in real-time:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const handleLeave = async () => {
    if (!id || !meeting) return;

    try {
      const updatedParticipants = meeting.participants.filter(
        (p: any) => p.uid !== user.uid
      );

      await updateDoc(doc(db, "meetings", id), {
        participants: updatedParticipants,
      });

      navigate("/lobby");
    } catch (err) {
      console.error("Error leaving meeting:", err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-darkBg text-black dark:text-darkText">
        <p>Loading meeting...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black dark:bg-darkBg dark:text-darkText relative flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold">Meeting Room</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Meeting ID: {id}</p>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Created by: {meeting?.createdBy}
      </p>
      <p className="mt-4 font-medium">Welcome, {user.displayName}</p>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Participants:</h2>
        <ul className="mt-2">
          {meeting?.participants?.map((p: any, index: number) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              {p.displayName || p.name || p.uid}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 italic">
        (Here we’ll build the wheel spinner, PDF viewer, and live notes soon!)
      </div>

      <button
        onClick={handleLeave}
        className="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Leave Meeting
      </button>

      {/* Floating dark mode toggle in bottom right */}
      <div className="absolute bottom-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
