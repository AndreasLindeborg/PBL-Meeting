import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore"; 
import { db } from "../firebase";
import { User } from "firebase/auth";




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

    return () => unsubscribe(); // 👈 clean up listener on unmount
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
  
  

  if (loading) return <p className="text-center mt-10">Loading meeting...</p>;

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold">Meeting Room</h1>
      <p className="mt-2 text-gray-600">Meeting ID: {id}</p>
      <p className="mt-2 text-gray-600">Created by: {meeting?.createdBy}</p>
      <p className="mt-4 font-medium">Welcome, {user.displayName}</p>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Participants:</h2>
        <ul className="mt-2">
          {meeting?.participants?.map((p: any, index: number) => (
            <li key={index} className="text-gray-700">
              {p.displayName || p.name || p.uid}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 text-sm text-gray-500 italic">
        (Here we’ll build the wheel spinner, PDF viewer, and live notes soon!)
      </div>

      <button
        onClick={handleLeave}
        className="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Leave Meeting
      </button>
    </div>
  );
}
