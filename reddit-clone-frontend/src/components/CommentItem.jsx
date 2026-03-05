import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function CommentItem({ comment, postId, onReplySubmit }) {
  const { user } = useContext(AuthContext);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onReplySubmit(replyText, comment._id); // Send the text and the ID of the parent
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <div className="comment-thread">
      <div className="comment-content">
        <p className="comment-author">
          <img 
            src={comment.author?.avatar ? `${import.meta.env.VITE_API_URL}${comment.author.avatar}` : 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png'} 
            className="post-avatar" 
            alt="avatar" 
          />
          u/{comment.author?.username}
        </p>
        <p className="comment-text">{comment.text}</p>
        
        {user && (
          <button className="action-btn reply-btn" onClick={() => setShowReplyBox(!showReplyBox)}>
            💬 Reply
          </button>
        )}

        {/* The Mini Reply Form */}
        {showReplyBox && (
          <form onSubmit={handleSubmit} className="reply-form">
            <textarea 
              value={replyText} 
              onChange={(e) => setReplyText(e.target.value)} 
              placeholder="What are your thoughts?" 
              required
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
               <button type="submit" className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>Reply</button>
               <button type="button" className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setShowReplyBox(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* RECURSION: If this comment has children, render them using this exact same component! */}
      {comment.children && comment.children.length > 0 && (
        <div className="nested-comments">
          {comment.children.map(child => (
            <CommentItem 
              key={child._id} 
              comment={child} 
              postId={postId} 
              onReplySubmit={onReplySubmit} 
            />
          ))}
        </div>
      )}
    </div>
  );
}