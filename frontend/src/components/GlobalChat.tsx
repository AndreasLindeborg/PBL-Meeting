import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { User } from "firebase/auth";
import { format } from "date-fns";

type Props = {
  user?: User;
};

type Message = {
  text: string;
  sender: string;
  createdAt: any;
};

export default function GlobalChat({ user }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data() as Message));
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        sender: user?.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="w-full h-full px-4 flex flex-col justify-between">
      <h2 className="text-xl font-semibold mb-2">Basgrupp 1 - Global Chat</h2>

      <div className="border p-3 rounded flex-1 overflow-y-auto bg-white shadow-sm dark:bg-darkCard dark:border-darkBorder">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-md max-w-[80%] ${
              user?.displayName === msg.sender
                ? "bg-blue-100 dark:bg-blue-900 text-right ml-auto"
                : "bg-gray-100 dark:bg-gray-700 text-left"
            }`}
          >
            <div className="text-sm font-medium">{msg.sender}</div>
            <div>{msg.text}</div>
            <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
              {msg.createdAt?.toDate
                ? format(msg.createdAt.toDate(), "HH:mm dd/MM")
                : ""}
            </div>
          </div>
        ))}
      </div>

      {user && (
        <div className="mt-4 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-l dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 rounded-r"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
