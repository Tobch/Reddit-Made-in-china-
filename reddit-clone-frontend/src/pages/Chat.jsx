import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

export default function Chat() {
  const { username } = useParams(); // The user we are chatting with
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch chat partner's details and message history
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        // Get the other user's ID
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${username}`);
        const otherUser = userRes.data;
        setChatUser(otherUser);

        // Get past messages
        const historyRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/${otherUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(historyRes.data);
      } catch (err) {
        console.error("Error fetching chat data:", err);
      }
    };
    if (user && token) fetchChatData();
  }, [username, user, token]);

  // 2. Setup Socket Connection
  useEffect(() => {
    if (!user || !chatUser) return;

    // Connect to the backend socket
    socketRef.current = io(import.meta.env.VITE_API_URL);

    // Create a unique, consistent room ID
    const roomId = [String(user._id), String(chatUser._id)].sort().join('_');
    
    socketRef.current.emit('join_chat', roomId);

    // 👇 FIX 1: Filter out duplicate IDs before updating state
    socketRef.current.on('receive_message', (message) => {
      setMessages((prevMessages) => {
        // If our state already has a message with this MongoDB _id, ignore the duplicate
        const isDuplicate = prevMessages.some((msg) => msg._id === message._id);
        if (isDuplicate) return prevMessages;
        
        return [...prevMessages, message];
      });
    });

    // Cleanup when leaving the page or re-rendering
    return () => {
      // 👇 FIX 2: Explicitly remove the listener before disconnecting
      if (socketRef.current) {
        socketRef.current.off('receive_message');
        socketRef.current.disconnect();
      }
    };
  }, [user, chatUser]);

  // Auto-scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatUser) return;

    const roomId = [String(user._id), String(chatUser._id)].sort().join('_');
    
    const messageData = {
      senderId: user._id,
      receiverId: chatUser._id,
      text: newMessage,
      room: roomId
    };

    // Send through socket (the backend will save it and bounce it back to both users in the room)
    socketRef.current.emit('send_message', messageData);
    setNewMessage('');
  };

  if (!user) return <div className="main-content">Please log in to chat.</div>;
  if (!chatUser) return <div className="main-content">Loading chat...</div>;

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginRight: '15px' }}>← Back</button>
        <img 
          src={chatUser.avatar ? (chatUser.avatar.startsWith('http') ? chatUser.avatar : `${import.meta.env.VITE_API_URL}${chatUser.avatar}`) : 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png'}
          alt="avatar" 
          className="navbar-avatar"
        />
        <h3>Chatting with u/{chatUser.username}</h3>
      </div>

      {/* Messages Window */}
      <div className="chat-window">
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#878A8C', marginTop: '20px' }}>Say hi to {chatUser.username}!</p>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === user._id;
            return (
              <div key={index} className={`message-wrapper ${isMe ? 'message-right' : 'message-left'}`}>
                <div className={`message-bubble ${isMe ? 'my-message' : 'their-message'}`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="chat-input-area">
        <input 
          type="text" 
          placeholder="Message..." 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
        />
        <button type="submit" className="btn-primary">Send</button>
      </form>
    </div>
  );
}