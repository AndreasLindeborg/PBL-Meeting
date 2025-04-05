import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
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
    const fetchMeeting = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "meetings", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMeeting(docSnap.data());
        } else {
          console.error("Meeting not found");
        }
      } catch (err) {
        console.error("Error fetching meeting:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  const handleLeave = () => {
    navigate("/lobby");
  };

  if (loading) return <p className="text-center mt-10">Loading meeting...</p>;

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold">Meeting Room</h1>
      <p className="mt-2 text-gray-600">Meeting ID: {id}</p>
      <p className="mt-2 text-gray-600">Created by: {meeting?.createdBy}</p>
      <p className="mt-4 font-medium">Welcome, {user.displayName}</p>

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
