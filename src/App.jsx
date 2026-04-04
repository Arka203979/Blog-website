import { useState, useEffect } from 'react';
import Header from './components/Header';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import LandingPage from './components/LandingPage';
import Footer from './components/Footer';
import { supabase } from './supabase';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('blogTheme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('blogTheme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('blogCurrentUser') ? 'home' : 'landing';
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionData(session);
    });

    // Listen for auth changes (like Google login redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSessionData(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSessionData = async (session) => {
    if (!session) {
      setCurrentUser(null);
      return;
    }
    
    const user = session.user;
    
    // Check if profile exists, otherwise create it from Google payload or email
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    let userObj;
    if (profile) {
      userObj = profile;
    } else {
      userObj = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0],
        age: '',
        bio: ''
      };
      await supabase.from('profiles').insert([userObj]);
    }
    
    setCurrentUser(userObj);
    setCurrentView('home');
  };

  const [posts, setPosts] = useState([]);
  
  // Fetch posts from Supabase
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);
  
  const [editingPost, setEditingPost] = useState(null);

  const handleLogin = (user) => {
    // Used by fallback password mock login (legacy)
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setEditingPost(null);
    setCurrentView('landing');
  };

  const handleSubmitPost = async ({ title, content, image }) => {
    if (editingPost) {
      // Update existing
      const { error } = await supabase
        .from('posts')
        .update({ title, content, image_url: image })
        .eq('id', editingPost.id);
        
      if (error) {
        console.error("Error updating post:", error);
        throw new Error(error.message || "Failed to update post");
      }
      
      setEditingPost(null);
    } else {
      // Create new
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);
        
      const newPost = {
        id: newId,
        title,
        content,
        image_url: image, // rename from image
        author_id: currentUser.id,
        author_email: currentUser.email,
        author_name: currentUser.name
      };
      
      const { error } = await supabase
        .from('posts')
        .insert([newPost]);
        
      if (error) {
        console.error("Error inserting post:", error);
        throw new Error(error.message || "Failed to publish post");
      }
    }
    
    // Refresh posts
    await fetchPosts();
  };


  const handleDeletePost = async (id) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting post:", error);
      return;
    }
      
    setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
    setEditingPost(prev => (prev && prev.id === id ? null : prev));
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    if (currentView === 'profile') {
      setCurrentView('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProfile = async (updatedData) => {
    const newUserObj = { ...currentUser, ...updatedData };
    
    setCurrentUser(newUserObj);

    
    // Update Supabase profile
    const { error } = await supabase
      .from('profiles')
      .update({ name: newUserObj.name, age: newUserObj.age?.toString(), bio: newUserObj.bio })
      .eq('id', currentUser.id);
      
    if (error) console.error("Error updating Supabase profile", error);
    
    // Update denormalized author name in posts Table
    if (updatedData.name) {
      await supabase
        .from('posts')
        .update({ author_name: updatedData.name })
        .or(`author_id.eq.${currentUser.id},author_email.eq.${currentUser.email}`);
        
      fetchPosts();
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (editingPost) setEditingPost(null);
        }}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main>
        {!currentUser ? (
          currentView === 'login' || currentView === 'signup' ? (
            <Auth 
              onLogin={handleLogin} 
              onBack={() => setCurrentView('landing')} 
              defaultIsLogin={currentView === 'login'}
            />
          ) : (
            <LandingPage onGetStarted={() => setCurrentView('signup')} />
          )
        ) : currentView === 'profile' ? (
          <UserProfile 
            currentUser={currentUser} 
            posts={posts} 
            onEdit={handleEditPost} 
            onDelete={handleDeletePost} 
            onUpdateProfile={handleUpdateProfile}
          />

        ) : (
          <>
            <PostForm 
              onSubmit={handleSubmitPost} 
              editingPost={editingPost} 
              onCancel={() => setEditingPost(null)}
            />
            <PostList 
              posts={posts} 
              currentUser={currentUser}
              onEdit={handleEditPost} 
              onDelete={handleDeletePost} 
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
