import { useState, useEffect } from 'react';
import { ArrowLeft, LogIn, UserPlus, Key, MailCheck } from 'lucide-react';
import { supabase } from '../supabase';

export default function Auth({ onLogin, onBack, defaultIsLogin = true }) {
  const [authMode, setAuthMode] = useState('password'); // 'password' or 'otp'
  const [otpStep, setOtpStep] = useState('request'); // 'request', 'verify', 'signup'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  
  useEffect(() => {
    setIsLogin(defaultIsLogin);
  }, [defaultIsLogin]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Additional Profile Fields (only for Registration)
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  
  const [error, setError] = useState('');

  // Auto focus input when switching modes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setAge('');
    setBio('');
    setError('');
    setOtpStep('request');
    setEnteredOtp('');
  }, [isLogin, authMode]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError('Error logging in with Google: ' + error.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('blogUsers') || '[]');
    const existingUser = storedUsers.find(u => u.email === email);

    if (isLogin) {
      // Login mode
      if (!existingUser) {
        setError('No account found with this email.');
        return;
      }
      if (existingUser.password && existingUser.password !== password) {
        setError('Incorrect password.');
        return;
      }
      
      // Auto-heal: If the profile update bug wiped their password to undefined, save this new password
      if (!existingUser.password) {
        existingUser.password = password;
        const updatedUsers = storedUsers.map(u => u.id === existingUser.id ? existingUser : u);
        localStorage.setItem('blogUsers', JSON.stringify(updatedUsers));
      }

      // Upsert profile into Supabase
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert([{ id: existingUser.id, email: existingUser.email, name: existingUser.name, age: existingUser.age?.toString(), bio: existingUser.bio }]);
        
      if (dbError) console.error("Error upserting profile:", dbError);

      // Success
      setError('');
      onLogin(existingUser);
    } else {
      // Register mode
      if (existingUser) {
        setError('An account with this email already exists.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      
      if (!isLogin && (!name || !age)) {
        setError('Please provide your name and age to create a profile.');
        return;
      }
      
      const newUser = { 
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), 
        email, 
        password,
        name,
        age,
        bio
      };
      
      const { error: dbError } = await supabase
        .from('profiles')
        .insert([{ id: newUser.id, email, name, age: age?.toString(), bio }]);

      if (dbError) {
        setError('Database Error: ' + dbError.message);
        return;
      }
      
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('blogUsers', JSON.stringify(updatedUsers));
      
      // Auto login after sign up
      setError('');
      onLogin(newUser); // Pass Full User object so App.jsx knows the Profile info
    }
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email.'); return; }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpStep('verify');
    setError('');
    // Mock the email
    alert(`[Simulation: Email Sent to ${email}]\n\nYour Secure OTP is: ${code}`);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (enteredOtp !== generatedOtp) {
      setError('Invalid or incorrect OTP.');
      return;
    }
    setError('');
    
    const storedUsers = JSON.parse(localStorage.getItem('blogUsers') || '[]');
    const existingUser = storedUsers.find(u => u.email === email);
    
    if (existingUser) {
      // Upsert profile into Supabase
      await supabase
        .from('profiles')
        .upsert([{ id: existingUser.id, email: existingUser.email, name: existingUser.name, age: existingUser.age?.toString(), bio: existingUser.bio }]);
        
      // User exists! Passwordless secure login!
      onLogin(existingUser);
    } else {
      // User doesn't exist. Proceed to ask for Profile Details
      setOtpStep('signup');
    }
  };

  const handleOtpSignup = async (e) => {
    e.preventDefault();
    if (!name || !age) {
       setError('Please provide your name and age to create a profile.');
       return;
    }
    
    const newUser = { 
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), 
      email, 
      password: '', // Passwordless account
      name,
      age,
      bio
    };
    
    const { error: dbError } = await supabase
      .from('profiles')
      .insert([{ id: newUser.id, email, name, age: age?.toString(), bio }]);

    if (dbError) {
      setError('Database Error: ' + dbError.message);
      return;
    }
    
    const storedUsers = JSON.parse(localStorage.getItem('blogUsers') || '[]');
    const updatedUsers = [...storedUsers, newUser];
    localStorage.setItem('blogUsers', JSON.stringify(updatedUsers));
    
    setError('');
    onLogin(newUser);
  };


  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto', width: '100%' }}>
      <div className="card animate-fade-in" style={{ position: 'relative' }}>
        {onBack && (
          <button 
            type="button" 
            onClick={onBack} 
            className="btn-icon" 
            style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}
            title="Back to Home"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {isLogin ? 'Log in to manage your posts' : 'Sign up to start sharing your thoughts'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {isLogin && (
          <>
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              style={{ padding: '0.75rem', backgroundColor: '#fff', color: '#757575', border: '1px solid #ddd', width: '100%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 500, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f8f8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--surface-border)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>or</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--surface-border)' }} />
            </div>
          </>
        )}

        {authMode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name *</label>
                  <input 
                    id="name"
                    type="text" 
                    placeholder="John Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label htmlFor="age" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Age *</label>
                  <input 
                    id="age"
                    type="number" 
                    placeholder="25" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    required={!isLogin}
                    min="1"
                  />
                </div>
                <div>
                  <label htmlFor="bio" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Short Bio</label>
                  <textarea 
                    id="bio"
                    placeholder="Tell everyone a little about yourself..." 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address *</label>
              <input 
                id="email"
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password</label>
              <input 
                id="password"
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem', width: '100%' }}>
              {isLogin ? <><LogIn size={18} /> Log In</> : <><UserPlus size={18} /> Sign Up</>}
            </button>
            
            <button 
              type="button" 
              onClick={() => setAuthMode('otp')} 
              style={{ padding: '0.75rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', width: '100%', marginTop: '0.5rem' }} 
              className="btn-icon"
            >
              <Key size={18} /> Or Log In with OTP Code
            </button>
          </form>
        ) : (
          /* OTP MODE */
          <>
            {otpStep === 'request' && (
              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label htmlFor="emailOtp" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address *</label>
                  <input 
                    id="emailOtp"
                    type="email" 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem', width: '100%' }}>
                  <MailCheck size={18} /> Send OTP Code
                </button>
                <button type="button" onClick={() => setAuthMode('password')} style={{ color: 'var(--primary-color)', padding: 0, fontWeight: 600, marginTop: '1rem' }}>
                  Back to Password Login
                </button>
              </form>
            )}

            {otpStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label htmlFor="otpCode" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Enter 4-Digit OTP Code *</label>
                  <input 
                    id="otpCode"
                    type="text"
                    maxLength="4"
                    placeholder="1234" 
                    value={enteredOtp} 
                    onChange={(e) => setEnteredOtp(e.target.value)} 
                    required
                    style={{ fontSize: '1.25rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>We've sent a code to {email}</p>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem', width: '100%' }}>
                  Verify & Log In
                </button>
                <button type="button" onClick={() => setOtpStep('request')} style={{ color: 'var(--primary-color)', padding: 0, fontWeight: 600, marginTop: '1rem' }}>
                  Resend Code
                </button>
              </form>
            )}

            {otpStep === 'signup' && (
              <form onSubmit={handleOtpSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ color: 'var(--text-primary)', textAlign: 'center', margin: 0 }}>This is a new account! Let's set up your profile.</p>
                <div>
                  <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name *</label>
                  <input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="age" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Age *</label>
                  <input id="age" type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} required min="1" />
                </div>
                <div>
                  <label htmlFor="bio" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Short Bio</label>
                  <textarea id="bio" placeholder="Tell everyone..." value={bio} onChange={(e) => setBio(e.target.value)} style={{ minHeight: '80px' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem', width: '100%' }}>
                  Complete Sign Up
                </button>
              </form>
            )}
          </>
        )}

        {authMode === 'password' && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              style={{ color: 'var(--primary-color)', padding: 0, fontWeight: 600 }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
