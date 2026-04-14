import { useState, useEffect } from 'react';
import { PenSquare, PlusCircle, Loader } from 'lucide-react';
import { supabase } from '../supabase';

export default function PostForm({ onSubmit, editingPost, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
      setImage(editingPost.image || null);
    } else {
      setTitle('');
      setContent('');
      setImage(null);
      setImageFile(null);
      setErrorMsg('');
    }
  }, [editingPost]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!title.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    let imageUrl = image; // Use existing image if not replacing

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(fileName, imageFile);
        
      if (error) {
        console.error("Upload error", error);
        alert("Error uploading image");
        setIsSubmitting(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);
        
      imageUrl = publicUrlData.publicUrl;
    }

    try {
      await onSubmit({ title, content, image: imageUrl });
      if (!editingPost) {
        setTitle('');
        setContent('');
        setImage(null);
        setImageFile(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while publishing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card animate-fade-in" style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
        {editingPost ? <><PenSquare size={20} color="var(--primary-color)" /> Edit Entry</> : <><PlusCircle size={20} color="var(--primary-color)" /> New Entry</>}
      </h2>
      
      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {errorMsg}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="title" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Title</label>
          <input 
            id="title"
            type="text" 
            placeholder="e.g. My First React Adventure..." 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            autoFocus={!!editingPost}
          />
        </div>
        <div>
          <label htmlFor="content" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Content</label>
          <textarea 
            id="content"
            placeholder="What's on your mind today?" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required
            style={{ minHeight: '150px' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Upload Photo</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}
          />
          {image && (
            <div style={{ position: 'relative', width: 'fit-content', marginTop: '0.5rem' }}>
              <img src={image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' }} />
              <button 
                type="button" 
                onClick={() => { setImage(null); setImageFile(null); e.target.value = ''; }} 
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          {editingPost && (
            <button type="button" onClick={onCancel} disabled={isSubmitting} style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-border)' }}>
             Cancel 
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 'bold', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isSubmitting && <Loader size={16} className="animate-spin" />}
            {editingPost ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
