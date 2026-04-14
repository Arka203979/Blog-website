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
  const [viewedUser, setViewedUser] = useState(null);

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        handleSessionData(session).finally(() => {
          if (mounted) setIsInitializing(false);
        });
      }
    });

    // Listen for auth changes (like Google login redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          handleSessionData(session).finally(() => {
            if (mounted) setIsInitializing(false);
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
      userObj = { ...profile, email: user.email };
      if (!userObj.name) {
        userObj.name = user.user_metadata?.full_name || user.email.split('@')[0];
      }
      if (!userObj.profilePic && (user.user_metadata?.avatar_url || user.user_metadata?.picture)) {
        userObj.profilePic = user.user_metadata.avatar_url || user.user_metadata.picture;
      }
    } else {
      userObj = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0],
        age: '',
        bio: '',
        profilePic: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
      };
      await supabase.from('profiles').insert([{
        id: userObj.id,
        email: userObj.email,
        name: userObj.name,
        age: userObj.age,
        bio: userObj.bio
      }]);
    }
    
    setCurrentUser(userObj);
    // If new user (profile was null), route to profile so they can complete it. Otherwise go to home.
    setCurrentView(!profile ? 'profile' : 'home');
  };

  const [posts, setPosts] = useState([]);
  
  // Fetch posts from Supabase
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        likes(user_id),
        comments(*, profiles(name)),
        reposts(user_id)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      const formattedPosts = (data || []).map(post => ({
        ...post,
        likes: post.likes || [],
        comments: (post.comments || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
        reposts: post.reposts || []
      }));
      setPosts(formattedPosts);
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
    if (currentView === 'profile' || currentView === 'publicProfile') {
      setCurrentView('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLike = async (postId, hasLiked) => {
    if (!currentUser) return;
    
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const newLikes = hasLiked 
          ? post.likes.filter(lk => lk.user_id !== currentUser.id)
          : [...post.likes, { user_id: currentUser.id }];
        return { ...post, likes: newLikes };
      }
      return post;
    }));

    if (hasLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
      if (error) console.error("Error unlike post", error);
    } else {
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: currentUser.id }]);
      if (error) console.error("Error liking post", error);
    }
  };

  const handleAddComment = async (postId, content) => {
    if (!currentUser || !content.trim()) return;

    const newComment = {
      post_id: postId,
      user_id: currentUser.id,
      content: content.trim()
    };

    const { data, error } = await supabase
      .from('comments')
      .insert([newComment])
      .select('*, profiles(name)')
      .single();

    if (error) {
      console.error("Error adding comment", error);
      return;
    }

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...(post.comments || []), data] };
      }
      return post;
    }));
  };

  const handleEditComment = async (postId, commentId, newContent) => {
    const { data, error } = await supabase
      .from('comments')
      .update({ content: newContent })
      .eq('id', commentId)
      .select();

    if (error) {
      console.error("Error editing comment:", error);
      alert("Error editing comment: " + error.message);
      return;
    }
    
    // Supabase RLS silently blocks updates by returning empty arrays if unauthorized
    if (!data || data.length === 0) {
      console.error("RLS blocked editing comment.");
      alert("Access Denied: The database blocked your edit. If you are using a mock/legacy login, you must update your Supabase Row-Level Security Rules.");
      return;
    }

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(c => c.id === commentId ? { ...c, content: newContent } : c)
        };
      }
      return post;
    }));
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .select();

    if (error) {
      console.error("Error deleting comment:", error);
      alert("Error deleting comment: " + error.message);
      return;
    }
    
    // Supabase RLS silently blocks deletions by returning empty arrays if unauthorized
    if (!data || data.length === 0) {
      console.error("RLS blocked deleting comment.");
      alert("Access Denied: The database blocked your deletion. If you are using a mock/legacy login, you must update your Supabase Row-Level Security Rules.");
      return;
    }

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.filter(c => c.id !== commentId)
        };
      }
      return post;
    }));
  };

  const handleToggleRepost = async (postId, hasReposted) => {
    if (!currentUser) return;

    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const newReposts = hasReposted 
          ? post.reposts.filter(rp => rp.user_id !== currentUser.id)
          : [...post.reposts, { user_id: currentUser.id }];
        return { ...post, reposts: newReposts };
      }
      return post;
    }));

    if (hasReposted) {
      const { error } = await supabase
        .from('reposts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
      if (error) console.error("Error unreposting post", error);
    } else {
      const { error } = await supabase
        .from('reposts')
        .insert([{ post_id: postId, user_id: currentUser.id }]);
      if (error) console.error("Error reposting post", error);
    }
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

  if (isInitializing) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--surface-border)', borderTopColor: 'var(--primary-color)', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: 500 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        currentView={currentView}
        onNavigate={(view, data) => {
          setCurrentView(view);
          if (view === 'publicProfile' && data) {
            setViewedUser(data);
          } else if (view !== 'publicProfile') {
            setViewedUser(null);
          }
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
        ) : currentView === 'profile' || currentView === 'publicProfile' ? (
          <UserProfile 
            currentUser={currentUser} 
            displayedUser={currentView === 'publicProfile' ? viewedUser : null}
            posts={posts} 
            onEdit={handleEditPost} 
            onDelete={handleDeletePost} 
            onLike={handleToggleLike}
            onComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onRepost={handleToggleRepost}
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
              onLike={handleToggleLike}
              onComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onRepost={handleToggleRepost}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
