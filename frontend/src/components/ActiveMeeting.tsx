import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { User } from "firebase/auth";
import ThemeToggle from "./ThemeToggle";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
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
  const isSecretary =
    user.uid === meeting?.participants?.find((p: any) => p.displayName === meeting?.secretary)?.uid;
  const isSupervisor = user.uid === meeting?.createdBy;
  const isChairman = meeting?.chairman === user.displayName;
  const canEndMeeting = isSupervisor || isChairman;
  const isEnded = meeting?.status === "ended";

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "meetings", id), (snap) => {
      const data = snap.data();
      if (data) {
        setMeeting(data);
        setNotes(data.notes || "");
        setLoading(false);

        const alreadyIn = data.participants.find((p: any) => p.uid === user.uid);
        if (alreadyIn && !hasJoinedToastShown.current) {
          if (data.status === "ended") {
            toast.info("This meeting has ended.");
          } else {
            toast.info("You joined the meeting.");
          }
          hasJoinedToastShown.current = true;
        }
      } else {
        setLoading(false);
        toast.error("Meeting not found");
        navigate("/lobby");
      }
    });

    return () => unsub();
  }, [id, user.uid, navigate]);

  useEffect(() => {
    const checkStatusAndRedirect = async () => {
      if (!id) return;
      const docRef = doc(db, "meetings", id);
      const snap = await getDoc(docRef);
      const data = snap.data();
      if (data?.status !== "started" && data?.status !== "ended") {
        navigate(`/meeting/${id}`);
      }
    };
    checkStatusAndRedirect();
  }, [id, navigate]);

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
      const updatedParticipants = meeting.participants.filter((p: any) => p.uid !== user.uid);
      await updateDoc(doc(db, "meetings", id), {
        participants: updatedParticipants,
      });
      toast.success("You left the meeting.");
      navigate("/lobby");
    } catch (err) {
      console.error("Error exiting meeting:", err);
    }
  };

  const handleEndMeeting = async () => {
    if (!id) return;
    try {
      await updateDoc(doc(db, "meetings", id), {
        status: "ended",
        endedAt: serverTimestamp(),
      });
      toast.success("Meeting ended.");
    } catch (err) {
      console.error("Error ending meeting:", err);
      toast.error("Failed to end meeting.");
    }
  };

  const downloadNotes = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(notes, 180);
    doc.setFontSize(12);
    doc.text(lines, 10, 10);
    doc.save("meeting-notes.pdf");
  };

  const downloadVinjett = () => {
    if (!meeting.vinjettUrl) return;
  
    // Safely append override query parameter
    const separator = meeting.vinjettUrl.includes("?") ? "&" : "?";
    const url = `${meeting.vinjettUrl}${separator}alt=media&response-content-disposition=attachment`;
  
    const link = document.createElement("a");
    link.href = url;
    link.download = "vinjett.pdf";
    link.target = "_blank"; // ensure it works in all browsers
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <span>Vinjett</span>
            {isEnded && (
              <span className="text-xs font-semibold text-red-600 bg-red-100 dark:bg-red-800 dark:text-red-200 px-2 py-1 rounded">
                Meeting has ended
              </span>
            )}
          </h2>
          <div>
            <h3 className="text-sm font-semibold mb-1 text-right">Live Participants:</h3>
            <ul className="text-xs text-right">
              {meeting.participants?.map((p: any, i: number) => {
                const isSup = p.uid === meeting.createdBy;
                const isSec = p.displayName === meeting.secretary;
                const isChair = p.displayName === meeting.chairman;
                return (
                  <li key={i} className="text-gray-800 dark:text-gray-200">
                    {p.displayName}
                    {isSup && " (supervisor)"}
                    {!isSup && isChair && " 🧑‍🏫"}
                    {!isSup && isSec && " ✍️"}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {meeting.vinjettUrl ? (
          <iframe
            src={meeting.vinjettUrl}
            className="w-full h-[75vh] rounded shadow"
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
            {canEndMeeting && !isEnded && (
              <button
                onClick={handleEndMeeting}
                className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
              >
                End Meeting
              </button>
            )}
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
        {isEnded ? (
          <>
            <div className="flex flex-col space-y-2 mb-4">
              <button
                onClick={downloadNotes}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Download Notes
              </button>
              {meeting.vinjettUrl && (
                <button
                  onClick={downloadVinjett}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 text-center"
                >
                  View Vinjett
                </button>
              )}
            </div>
            <div className="w-full h-[75vh] p-4 bg-black bg-opacity-10 dark:bg-darkSurface border border-gray-300 dark:border-darkBorder rounded overflow-y-scroll whitespace-pre-wrap">
              {notes}
            </div>
          </>
        ) : (
          <textarea
            value={notes}
            onChange={handleNoteChange}
            placeholder="Type meeting notes here..."
            className="w-full h-[90vh] p-4 bg-black bg-opacity-10 dark:bg-darkSurface border border-gray-300 dark:border-darkBorder rounded resize-none focus:outline-none"
            disabled={!isSecretary}
          />
        )}
      </div>
    </div>
  );
}