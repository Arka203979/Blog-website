import PostItem from './PostItem';

export default function PostList({ posts, currentUser, onEdit, onDelete, onLike, onComment, onRepost }) {
  if (!posts || posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '1.125rem' }}>No posts yet.</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Create one above to get started!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {posts.map(post => (
        <PostItem 
          key={post.id} 
          post={post} 
          currentUser={currentUser}
          onEdit={onEdit} 
          onDelete={onDelete} 
          onLike={onLike}
          onComment={onComment}
          onRepost={onRepost}
        />
      ))}
    </div>
  );
}
