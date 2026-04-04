import { Edit2, Trash2, Calendar, User } from 'lucide-react';

export default function PostItem({ post, currentUser, onEdit, onDelete }) {
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
    </article>
  );
}
