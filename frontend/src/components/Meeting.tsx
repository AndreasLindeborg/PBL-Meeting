import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { User } from "firebase/auth";
import ThemeToggle from "./ThemeToggle";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

export default function Meeting({ user }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [justStarted, setJustStarted] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(
      doc(db, "meetings", id),
      (docSnap) => {
        if (docSnap.exists()) {
          const meetingData = docSnap.data();

          // Detect transition to "started" state for all users
          if (meeting?.status !== "started" && meetingData.status === "started") {
            setSpinning(true);
            setShowRoles(false);
            setJustStarted(true);
            setTimeout(() => {
              setSpinning(false);
              setShowRoles(true);
              setTimeout(() => {
                navigate(`/meeting/${id}/active`);
              }, 4000); // 4 more seconds after roles show = total 7 seconds
            }, 3000);
          }

          setMeeting(meetingData);
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
  }, [id, navigate, meeting?.status]);

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

  const handleUpload = async () => {
    if (!file || !id) {
      toast.error("Please select a file first.");
      return;
    }
    try {
      const fileRef = ref(storage, `meetings/${id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);
      await updateDoc(doc(db, "meetings", id), { vinjettUrl: fileUrl });
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
    }
  };

  const handleStartMeeting = async () => {
    if (!id || !meeting) return;
    const { chairman, secretary } = pickRoles(meeting.participants, meeting.createdBy);
    try {
      await updateDoc(doc(db, "meetings", id), {
        status: "started",
        chairman,
        secretary,
      });
      toast.success("Meeting started! Roles assigned.");
    } catch (err) {
      console.error("Error starting meeting:", err);
      toast.error("Failed to start meeting.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-darkBg text-black dark:text-darkText">
        <p>Loading meeting...</p>
      </div>
    );

  const creator = meeting?.participants?.find((p: any) => p.uid === meeting?.createdBy);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-darkBg dark:text-darkText relative flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold">Meeting Room</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Meeting ID: {id}</p>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Created by: {creator?.displayName || meeting?.createdBy}
      </p>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Participants:</h2>
        <ul className="mt-2">
          {meeting?.participants?.map((p: any, index: number) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              {p.displayName || p.name || p.uid}
              {p.uid === meeting.createdBy && " (supervisor)"}
            </li>
          ))}
        </ul>
      </div>

      {meeting?.status === "waiting" && user.uid === meeting.createdBy && (
        <>
          <div className="mt-6">
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-2"
            />
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Upload Vinjett
            </button>
          </div>

          <button
            onClick={handleStartMeeting}
            className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Start Meeting
          </button>
        </>
      )}

      {spinning && (
        <div className="mt-6 text-blue-400 text-lg font-medium animate-pulse">
          🎡 Spinning the wheel to assign roles...
        </div>
      )}

      {showRoles && (
        <div className="mt-6 text-center">
          <p className="font-semibold text-lg text-blue-500">Meeting started!</p>
          <p className="mt-2">Chairman: <strong>{meeting.chairman}</strong></p>
          <p>Secretary: <strong>{meeting.secretary}</strong></p>
        </div>
      )}

      <button
        onClick={handleLeave}
        className="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Leave Meeting
      </button>

      <div className="absolute bottom-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
