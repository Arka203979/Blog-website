import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Hash, Edit2, Save, X, Camera } from 'lucide-react';
import PostList from './PostList';

export default function UserProfile({ currentUser, displayedUser, posts, onEdit, onDelete, onUpdateProfile }) {
  const profileUser = displayedUser || currentUser;
  const isOwnProfile = currentUser && profileUser.id === currentUser.id;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editAge, setEditAge] = useState(profileUser.age || '');
  const [editBio, setEditBio] = useState(profileUser.bio || '');
  const [editProfilePic, setEditProfilePic] = useState(profileUser.profilePic || null);
  const [imgError, setImgError] = useState(false);
  
  useEffect(() => { setImgError(false); }, [profileUser.profilePic]);

  // Filter only posts belonging to the profileUser
  const userPosts = posts.filter(post => 
    post.author_id === profileUser.id || 
    (post.author_email && post.author_email === profileUser.email)
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200; // Limit size to strictly avoid filling 5MB localStorage
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress heavily as base64 jpeg
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setEditProfilePic(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (onUpdateProfile && isOwnProfile) {
      onUpdateProfile({
        name: profileUser.name, // Keep the same name
        age: editAge,
        bio: editBio,
        profilePic: editProfilePic
      });
    }
    setIsEditing(false);
  };


  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Profile Header Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--primary-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 min-content' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--surface-color)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', overflow: 'hidden' }}>
              {isEditing && editProfilePic ? (
                <img referrerPolicy="no-referrer" src={editProfilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : profileUser.profilePic && !imgError ? (
                <img 
                  referrerPolicy="no-referrer"
                  src={profileUser.profilePic} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={() => setImgError(true)}
                />
              ) : (profileUser.name || profileUser.email) ? (
                (profileUser.name || profileUser.email).charAt(0).toUpperCase()
              ) : (
                <User size={32} />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{profileUser.name || profileUser.email?.split('@')[0] || 'Anonymous User'}</h2>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {isOwnProfile && <><Mail size={14} /> {profileUser.email}</>}
              </p>
            </div>
          </div>
          {!isEditing && isOwnProfile && (
            <button onClick={() => setIsEditing(true)} className="btn-icon" title="Edit Profile">
              <Edit2 size={20} />
            </button>
          )}
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <label htmlFor="profilePicUpload" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <Camera size={16} /> Update Photo
              </label>
              <input 
                id="profilePicUpload" 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Auto-compressed for memory</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Age</label>
              <input type="number" value={editAge} onChange={e => setEditAge(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bio</label>
              <textarea value={editBio} onChange={e => setEditBio(e.target.value)} style={{ minHeight: '80px' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setIsEditing(false)} className="btn-icon">
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Age</span>
              <span style={{ fontSize: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar size={16} color="var(--primary-color)" /> {profileUser.age || 'Not specified'}
              </span>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Bio</span>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                {profileUser.bio || "This user hasn't written a bio yet."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User's Posts */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          <Hash size={20} color="var(--primary-color)" /> {isOwnProfile ? 'My Posts' : `${profileUser.name || 'User'}'s Posts`} ({userPosts.length})
        </h3>
        <PostList 
          posts={userPosts} 
          currentUser={currentUser}
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </div>

    </div>
  );
}
