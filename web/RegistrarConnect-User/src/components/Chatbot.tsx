import React, { useState } from "react";

const Chatbot: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError("Please enter a message!");
      return;
    }
    if (input.length > 100) {
      setError("Message too long! Keep it under 100 characters.");
      return;
    }

    setMessages([...messages, `You: ${input}`]);
    const response = input.includes("help") ? "How can I assist you today?" : input.includes("payment") ? "Check your transactions page for payment status." : "Thanks for your message!";
    setMessages((prev) => [...prev, `Bot: ${response}`]);
    setInput("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png") && file.size <= 5 * 1024 * 1024) {
      setReceiptFile(file);
      setMessages((prev) => [...prev, `You: Uploaded ${file.name}`]);
      setMessages((prev) => [...prev, `Bot: Receipt processed. Please wait for verification.`]);
    } else {
      setError("Please upload a JPG/PNG file under 5MB!");
      setReceiptFile(null);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">How can I help you?</h1>
      <div className="bg-white p-4 rounded-lg shadow-md h-96 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, index) => (
          <p key={index} className="text-gray-700">{msg}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="p-2 border border-gray-300 rounded-lg"
        />
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default Chatbot;