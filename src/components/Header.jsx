import { useState } from 'react';
import { PenTool, LogOut, User, Home, Sun, Moon, Menu, X } from 'lucide-react';

export default function Header({ currentUser, onLogout, currentView, onNavigate, theme, toggleTheme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNav = (view) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
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
      <button 
        onClick={() => handleNav(currentView === 'home' ? 'profile' : 'home')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)' }}
        className="btn-primary desktop-only"
      >
        {currentView === 'home' ? <><User size={18} /> Profile</> : <><Home size={18} /> Home</>}
      </button>
      
      <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-color)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid var(--primary-color)', overflow: 'hidden' }}>
          {currentUser?.profilePic ? (
            <img src={currentUser.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : currentUser?.name ? (
            currentUser.name.charAt(0).toUpperCase()
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
