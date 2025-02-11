import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000"); // Backend URL

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const currentUser = "current_user@example.com"; // Replace with logged-in user's email

  useEffect(() => {
    // Fetch all users
    axios.get("http://localhost:5000/users").then((response) => {
      setUsers(response.data);
    });

    // Listen for new messages
    socket.on("message", (message) => {
      if (
        (message.sender === currentUser && message.receiver === selectedUser) ||
        (message.sender === selectedUser && message.receiver === currentUser)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("message");
  }, [selectedUser]);

  const loadMessages = (user) => {
    setSelectedUser(user);
    axios.get("http://localhost:5000/api/users")
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
  
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const message = {
      sender: currentUser,
      receiver: selectedUser.email,
      content: newMessage,
    };
    axios.post("http://localhost:5000/messages", message).then(() => {
      setNewMessage("");
    });
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <ul>
          {users
            .filter((user) => user.email !== currentUser)
            .map((user) => (
              <li
                key={user._id}
                className={`p-2 cursor-pointer ${
                  selectedUser?.email === user.email ? "bg-gray-300" : ""
                }`}
                onClick={() => loadMessages(user)}
              >
                {user.name}
              </li>
            ))}
        </ul>
      </div>
      <div className="w-2/3 p-4">
        {selectedUser ? (
          <>
            <h2 className="text-xl font-bold mb-4">
              Chat with {selectedUser.name}
            </h2>
            <div className="h-4/5 overflow-y-scroll border p-4 mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    message.sender === currentUser ? "text-right" : "text-left"
                  }`}
                >
                  <p className="inline-block p-2 bg-blue-100 rounded">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                className="flex-grow p-2 border rounded"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="ml-2 p-2 bg-blue-500 text-white rounded"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <h2 className="text-xl font-bold">Select a user to chat</h2>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
