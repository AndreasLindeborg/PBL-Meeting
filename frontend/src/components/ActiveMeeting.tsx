import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { User } from "firebase/auth";
import ThemeToggle from "./ThemeToggle";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


type Props = {
  user: User;
};

export default function ActiveMeeting({ user }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const hasJoinedToastShown = useRef(false);

  const isSecretary = user.uid === meeting?.participants?.find((p: any) => p.displayName === meeting?.secretary)?.uid;

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "meetings", id), (snap) => {
      const data = snap.data();
      if (data) {
        setMeeting(data);
        setNotes(data.notes || "");
        setLoading(false);

        // Show toast only once on join
        const alreadyIn = data.participants.find((p: any) => p.uid === user.uid);
        if (alreadyIn && !hasJoinedToastShown.current) {
          toast.info("You joined the meeting.");
          hasJoinedToastShown.current = true;
        }
      }
    });

    return () => unsub();
  }, [id, user.uid]);

  const handleNoteChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    if (id) {
      await updateDoc(doc(db, "meetings", id), {
        notes: newNotes,
      });
    }
  };

  const handleExitMeeting = async () => {
    if (!id || !meeting) return;
    try {
      const updatedParticipants = meeting.participants.filter(
        (p: any) => p.uid !== user.uid
      );
      await updateDoc(doc(db, "meetings", id), {
        participants: updatedParticipants,
      });
      toast.success("You left the meeting.");
      navigate("/lobby");
    } catch (err) {
      console.error("Error exiting meeting:", err);
    }
  };

  if (loading || !meeting)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-darkBg text-black dark:text-darkText">
        <p>Loading meeting...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex bg-white text-black dark:bg-darkBg dark:text-darkText">
      {/* Vinjett viewer */}
      <div className="w-2/3 p-6 border-r border-gray-300 dark:border-darkBorder">
        <h2 className="text-xl font-bold mb-4">Vinjett</h2>
        {meeting.vinjettUrl ? (
          <iframe
            src={meeting.vinjettUrl}
            className="w-full h-[90vh] rounded shadow"
            title="Vinjett"
          ></iframe>
        ) : (
          <p className="italic text-gray-500">No vinjett uploaded.</p>
        )}
      </div>

      {/* Live Notes */}
      <div className="w-1/3 p-6 relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Live Notes</h2>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={handleExitMeeting}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Exit
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-2">
          Secretary: <span className="font-medium text-gray-200">{meeting.secretary}</span>
        </p>
        <textarea
          value={notes}
          onChange={handleNoteChange}
          placeholder="Type meeting notes here..."
          className="w-full h-[90vh] p-4 bg-black bg-opacity-10 dark:bg-darkSurface border border-gray-300 dark:border-darkBorder rounded resize-none focus:outline-none"
          disabled={!isSecretary}
        />
      </div>
    </div>
  );
}