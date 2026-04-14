import { useState } from 'react';
import { Edit2, Trash2, Calendar, User, Heart, MessageCircle, Repeat } from 'lucide-react';

export default function PostItem({ post, currentUser, onEdit, onDelete, onLike, onComment, onRepost }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const formattedDate = new Date(post.created_at || post.date || new Date()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const isOwner = currentUser && (
    post.author_id === currentUser.id ||
    (post.author_email && post.author_email === currentUser.email)
  );

  const hasLiked = currentUser && post.likes?.some(like => like.user_id === currentUser.id);
  const hasReposted = currentUser && post.reposts?.some(repost => repost.user_id === currentUser.id);

  return (
    <article className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{post.title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isOwner && (
            <>
              <button onClick={() => onEdit(post)} className="btn-icon" aria-label="Edit post" title="Edit">
                <Edit2 size={18} />
              </button>
              <button onClick={() => onDelete(post.id)} className="btn-icon danger" aria-label="Delete post" title="Delete">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '-0.75rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Calendar size={14} /> {formattedDate}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <User size={14} /> {(isOwner && currentUser?.name) ? currentUser.name : (post.author_name || (post.author_email ? post.author_email.split('@')[0] : 'Anonymous'))}
        </span>
      </div>
      
      <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        <div style={{ marginBottom: post.image_url ? '1rem' : '0' }}>
          {post.content}
        </div>
        {post.image_url && (
          <div style={{ width: '100%' }}>
            <img 
              src={post.image_url} 
              alt={post.title} 
              style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'var(--surface-color)' }} 
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
        <button 
          onClick={(e) => { e.stopPropagation(); if (currentUser) onLike(post.id, hasLiked); }} 
          className="btn-icon" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasLiked ? 'var(--primary-color)' : 'var(--text-secondary)' }}
          title={currentUser ? "Like" : "Log in to like"}
        >
          <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} color={hasLiked ? 'var(--primary-color)' : 'currentColor'} />
          <span style={{ fontSize: '0.875rem' }}>{post.likes?.length || 0}</span>
        </button>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }} 
          className="btn-icon" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}
        >
          <MessageCircle size={20} fill={showComments ? 'currentColor' : 'none'} />
          <span style={{ fontSize: '0.875rem' }}>{post.comments?.length || 0}</span>
        </button>
        
        <button 
          onClick={(e) => { e.stopPropagation(); if (currentUser) onRepost(post.id, hasReposted); }} 
          className="btn-icon" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasReposted ? '#10b981' : 'var(--text-secondary)' }}
          title={currentUser ? "Repost" : "Log in to repost"}
        >
          <Repeat size={20} />
          <span style={{ fontSize: '0.875rem' }}>{post.reposts?.length || 0}</span>
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
          {post.comments?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {post.comments.map(comment => (
                <div key={comment.id} style={{ display: 'flex', gap: '0.75rem', backgroundColor: 'var(--surface-color)', padding: '0.75rem', borderRadius: '8px' }}>
                  {comment.profiles?.profilePic ? (
                    <img src={comment.profiles.profilePic} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                      {(comment.profiles?.name || 'A')[0]}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{comment.profiles?.name || 'Anonymous'}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-secondary)' }}>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>No comments yet. Be the first!</p>
          )}

          {currentUser && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onComment(post.id, commentText);
                setCommentText('');
              }}
              style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              <input 
                type="text" 
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..." 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={!commentText.trim()} style={{ padding: '0.5rem 1rem' }}>
                Post
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
