import PostItem from './PostItem';

export default function PostList({ posts, currentUser, onEdit, onDelete, onLike, onComment, onEditComment, onDeleteComment, onRepost }) {
  if (!posts || posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        No posts yet. Be the first to publish something!
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
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          onRepost={onRepost}
        />
      ))}
    </div>
  );
}
