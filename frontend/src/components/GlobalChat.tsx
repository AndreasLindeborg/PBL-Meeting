import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { User } from "firebase/auth";

type Props = {
  user?: User | null;
};

export default function GlobalChat({ user }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!user || input.trim() === "") return;

    await addDoc(collection(db, "messages"), {
      text: input,
      sender: user.displayName || "Anonymous",
      createdAt: serverTimestamp(),
    });

    setInput("");
  };

  return (
    <div className="border rounded p-4 mt-6 w-full max-w-md mx-auto bg-white shadow">
      <h2 className="text-lg font-bold mb-2">💬 Global Chat</h2>
      
      <div className="h-48 overflow-y-auto border p-2 mb-2 bg-gray-50 text-left">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {user ? (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message..."
            className="flex-grow px-2 py-1 border rounded"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Send
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center italic">
          Sign in to send messages
        </p>
      )}
    </div>
  );
}
