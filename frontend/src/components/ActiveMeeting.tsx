import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { User } from "firebase/auth";
import ThemeToggle from "./ThemeToggle";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";

const pickRoles = (participants: any[], creatorUid: string) => {
  const eligible = participants.filter((p: any) => p.uid !== creatorUid);
  if (eligible.length < 2) return { chairman: null, secretary: null };
  const shuffled = [...eligible].sort(() => 0.5 - Math.random());
  return {
    chairman: shuffled[0].displayName,
    secretary: shuffled[1].displayName,
  };
};

type Props = {
  user: User;
};

export default function ActiveMeeting({ user }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const isSecretary = user.uid === meeting?.participants?.find((p: any) => p.displayName === meeting?.secretary)?.uid;

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "meetings", id), (snap) => {
      const data = snap.data();
      if (data) {
        setMeeting(data);
        setNotes(data.notes || "");
        setLoading(false);
      }
    });

    return () => unsub();
  }, [id]);

  const handleNoteChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    if (id) {
      await updateDoc(doc(db, "meetings", id), {
        notes: newNotes,
      });
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
          <ThemeToggle />
        </div>
        <p className="text-sm text-gray-400 mb-2">Secretary: <span className="font-medium text-gray-200">{meeting.secretary}</span></p>
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