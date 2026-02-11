import { useEffect, useState } from "react";
import axios from "../../../../api/axios";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

export default function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [replyOpen, setReplyOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);

  const [subject, setSubject] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [messageInfo, setMessageInfo] = useState("");

  // ================= LOAD MESSAGES =================
  const loadMessages = async () => {
    try {
      const res = await axios.get("/api/contact/admin");
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages", err);
      setMessageInfo("Failed to load messages");
    }
  };

  // ================= DELETE =================
  const deleteMessage = async (id) => {
    try {
      await axios.delete(`/api/contact/admin/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setMessageInfo("Message deleted successfully");
    } catch {
      setMessageInfo("Delete failed");
    }
  };

  // ================= OPEN REPLY =================
  const openReply = (msg) => {
    setActiveMessage(msg);
    setSubject("HairCraft Support");
    setReplyText("");
    setReplyOpen(true);
  };

  // ================= SEND REPLY =================
  const sendReply = async () => {
    if (!replyText.trim()) {
      setMessageInfo("Message cannot be empty");
      return;
    }

    try {
      setSending(true);

      await axios.post(
        "/api/contact/admin/reply",
        {
          email: activeMessage.email,
          subject,
          message: replyText,
        }
      );

      setMessageInfo("Reply sent successfully 📧");
      setReplyOpen(false);
    } catch (err) {
      console.error(err);
      setMessageInfo("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">📩 Contact Messages</h2>

      {/* MESSAGE */}
      {messageInfo && (
        <div className="bg-gray-100 text-gray-700 p-2 rounded mb-4">
          {messageInfo}
        </div>
      )}

      {messages.length === 0 && (
        <p className="text-gray-500">No messages yet</p>
      )}

      <div className="space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className="border rounded-xl p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {m.firstName} {m.lastName}
                </p>
                <p className="text-sm text-gray-500">{m.email}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => openReply(m)}
                  className="text-blue-600 text-sm font-medium"
                >
                  Reply
                </button>
                <button
                  onClick={() => deleteMessage(m.id)}
                  className="text-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="mt-3 text-gray-700">{m.message}</p>
          </div>
        ))}
      </div>

      {/* ================= REPLY MODAL ================= */}
      {replyOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-1">
              Reply to {activeMessage.firstName}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {activeMessage.email}
            </p>

            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full border rounded-lg px-4 py-2 mb-3"
            />

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              placeholder="Type your reply..."
              className="w-full border rounded-lg px-4 py-2 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReplyOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={sendReply}
                disabled={sending}
                className="px-6 py-2 rounded-lg bg-black text-white"
              >
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
