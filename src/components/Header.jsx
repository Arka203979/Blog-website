import { useState, useEffect, useRef } from 'react';
import { PenTool, LogOut, User, Home, Sun, Moon, Menu, X, Search } from 'lucide-react';
import { supabase } from '../supabase';

export default function Header({ currentUser, onLogout, currentView, onNavigate, theme, toggleTheme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // reset error if current user changes
  useEffect(() => { setImgError(false); }, [currentUser?.profilePic]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);
        
      if (error) {
        console.error("Search profiles error:", error);
      }
        
      if (!error && data) {
        setSearchResults(data);
      }
    };
    
    // Simple debounce
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleNav = (view, data = null) => {
    onNavigate(view, data);
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleScrollNav = (sectionId, fallbackOffset = 600) => {
    onNavigate('landing');
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: fallbackOffset, behavior: 'smooth' });
    }, 100);
  };

  const renderNavLinks = () => (
    <>
      <button 
        onClick={() => handleNav('landing')} 
        className="btn-icon" 
        style={{ fontWeight: 600, color: 'var(--text-primary)' }}
      >
        Home
      </button>
      <button 
        onClick={() => handleScrollNav('about-section', 600)} 
        className="btn-icon" 
        style={{ fontWeight: 600, color: 'var(--text-primary)' }}
      >
        About
      </button>
      <button 
        onClick={() => handleScrollNav('faq-section', 1200)} 
        className="btn-icon" 
        style={{ fontWeight: 600, color: 'var(--text-primary)' }}
      >
        FAQ
      </button>
      <button 
        onClick={() => handleScrollNav('contact-section', 1800)} 
        className="btn-icon" 
        style={{ fontWeight: 600, color: 'var(--text-primary)' }}
      >
        Contact
      </button>
      
      <div className="nav-divider" style={{ width: '1px', height: '24px', backgroundColor: 'var(--surface-border)', margin: '0 0.5rem' }}></div>
      
      <button 
        onClick={() => handleNav('login')} 
        style={{ fontWeight: 600, padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', backgroundColor: 'transparent' }} 
        className="btn-icon"
      >
        Log In
      </button>
      <button 
        onClick={() => handleNav('signup')} 
        className="btn-primary" 
        style={{ padding: '0.5rem 1.25rem', fontWeight: 600 }}
      >
        Sign Up
      </button>
    </>
  );

  const renderUserActions = () => (
    <>
      <div ref={searchRef} className="mobile-full-width" style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
        <div className="mobile-full-width" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && searchQuery.trim() !== '') {
                e.preventDefault();
                setShowDropdown(false);

                // Fetch directly to avoid race conditions with the debounced searchResults
                const { data, error } = await supabase
                  .from('profiles')
                  .select('*')
                  .ilike('name', `%${searchQuery.trim()}%`)
                  .limit(1);

                if (!error && data && data.length > 0) {
                  handleNav('publicProfile', data[0]);
                } else {
                  alert(`No user found for "${searchQuery}"`);
                }
              }
            }}
            onFocus={() => setShowDropdown(true)}
            style={{ paddingLeft: '32px', paddingRight: '12px', paddingBottom: '0.5rem', paddingTop: '0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--surface-border)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%', minWidth: '200px' }}
          />
        </div>
        
        {showDropdown && searchQuery.trim() && (
          <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, backgroundColor: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 1000 }}>
            {searchResults.length > 0 ? searchResults.map(user => (
              <div 
                key={user.id} 
                onClick={() => handleNav('publicProfile', user)}
                style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--surface-border)' }}
                className="search-result-item"
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden', fontSize: '0.75rem' }}>
                  {user.profilePic ? (
                    <img referrerPolicy="no-referrer" src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (user.name || user.email) ? (
                    (user.name || user.email).charAt(0).toUpperCase()
                  ) : (
                    <User size={14} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user.name || user.email?.split('@')[0]}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No users found.
              </div>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={() => handleNav(currentView === 'home' ? 'profile' : 'home')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)' }}
        className="btn-primary desktop-only"
      >
        {currentView === 'home' ? <><User size={18} /> Profile</> : <><Home size={18} /> Home</>}
      </button>
      
      <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-color)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
          {currentUser?.profilePic && !imgError ? (
            <img 
              referrerPolicy="no-referrer"
              src={currentUser.profilePic} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={() => setImgError(true)}
            />
          ) : (currentUser?.name || currentUser?.email) ? (
            (currentUser.name || currentUser.email).charAt(0).toUpperCase()
          ) : (
            <User size={18} />
          )}
        </div>
        <div className="user-details" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser?.name || currentUser?.email?.split('@')[0]}</span>
           <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Logged in</span>
        </div>
      </div>
      
      <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="btn-danger logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.75rem' }}>
        <LogOut size={16} /> Logout
      </button>
    </>
  );

  return (
    <header style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', zIndex: 110 }}
        onClick={() => { if (currentUser) handleNav('home'); else handleNav('landing'); }}
      >
        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem', color: 'var(--primary-color)' }}>
          <PenTool size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700, letterSpacing: '-0.025em' }}>DevBlog</h1>
          <p className="desktop-only" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Write, edit, and share your thoughts.</p>
        </div>
      </div>

      <div className="mobile-menu-btn" style={{ alignItems: 'center', gap: '0.5rem', zIndex: 110 }}>
        {currentUser && (
          <button 
            onClick={() => handleNav(currentView === 'home' ? 'profile' : 'home')} 
            className="btn-icon" 
            style={{ color: 'var(--text-primary)', padding: '0.5rem' }} 
            aria-label={currentView === 'home' ? 'Profile' : 'Home'}
          >
            {currentView === 'home' ? <User size={24} /> : <Home size={24} />}
          </button>
        )}
        {currentUser && (
          <button 
            onClick={() => {
              if (!isMobileMenuOpen) setIsMobileMenuOpen(true);
              setTimeout(() => { if (searchRef.current) searchRef.current.querySelector('input')?.focus(); }, 100);
            }}
            className="btn-icon" 
            style={{ color: 'var(--text-primary)', padding: '0.5rem' }} 
            aria-label="Search"
          >
            <Search size={22} />
          </button>
        )}
        <button 
          onClick={toggleTheme} 
          className="btn-icon" 
          style={{ color: 'var(--text-secondary)', padding: '0.5rem' }} 
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="btn-icon"
          style={{ color: 'var(--text-primary)', padding: '0.5rem' }}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <nav className="header-actions desktop-nav" style={{ zIndex: 110 }}>
        {!currentUser ? renderNavLinks() : renderUserActions()}
        <button 
          onClick={toggleTheme} 
          className="btn-icon desktop-only" 
          style={{ marginLeft: '1rem', color: 'var(--text-secondary)', padding: '0.5rem' }} 
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      <nav className={isMobileMenuOpen ? 'mobile-menu-open' : ''} style={{ display: isMobileMenuOpen ? 'flex' : 'none' }}>
        {!currentUser ? renderNavLinks() : renderUserActions()}
      </nav>
    </header>
  );
}
