import { useState } from 'react';
import { ArrowRight, PenTool, Shield, Users, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I start writing?",
      answer: "Simply click the 'Start Writing for Free' button to create your account using our secure login. Once logged in, you'll see a rich-text editor on your home feed to instantly draft and publish your first post."
    },
    {
      question: "Is it free to use?",
      answer: "Yes! DevBlog is 100% free to use. We believe in providing an open platform for developers and creators to share their knowledge without barriers."
    },
    {
      question: "Can I edit and delete my blog after publishing?",
      answer: "Absolutely. You maintain full control over your content. You can easily edit any of your own posts directly from your feed at any time, or delete them permanently if you choose."
    },
    {
      question: "Do I need to remember a password?",
      answer: "No! DevBlog utilizes a modern passwordless authentication system. Just enter your email, and we'll send you a secure One-Time Password (OTP) to log in instantly."
    }
  ];
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '5rem', marginTop: '3rem' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary-color)', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          Welcome to the Future of Technology Blogging
        </div>
        
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Where Great Ideas Find Their Voice
        </h1>
        
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6 }}>
          DevBlog is a premium platform engineered for developers, writers, and creators. Share your stories, showcase your expertise, and engage with a thriving community.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={onGetStarted} 
            className="btn-primary" 
            style={{ padding: '0.875rem 2rem', fontSize: '1.125rem', borderRadius: 'var(--radius-lg)' }}
          >
            Start Writing for Free <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="about-section" style={{ marginTop: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Everything You Need</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>A complete toolset crafted for modern web creators.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <div className="card hover-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s ease', cursor: 'default' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary-color)', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
              <PenTool size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Rich Text Editor</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Draft your masterpieces with our intuitive editor. Focus on what matters most — delivering quality content.
            </p>
          </div>

          <div className="card hover-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s ease', cursor: 'default' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
              <Shield size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Passwordless Security</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Secure, instant access using One-Time Passwords sent directly to your email. Say goodbye to forgotten passwords.
            </p>
          </div>

          <div className="card hover-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s ease', cursor: 'default' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
              <Users size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Custom Profiles</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Personalize your Author identity. Set your custom avatar, update your bio, and build a following.
            </p>
          </div>

          <div className="card hover-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s ease', cursor: 'default' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
              <Zap size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Lightning Fast</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Built with modern, bleeding-edge web technologies. Experience instant page loads and seamless interactions.
            </p>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq-section" style={{ marginTop: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Frequently Asked Questions</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Everything you need to know about devBlog.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="card" 
              style={{ cursor: 'pointer', transition: 'all 0.2s ease', padding: '1.5rem' }}
              onClick={() => toggleFaq(index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: openFaq === index ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                  {faq.question}
                </h3>
                <div>
                  {openFaq === index ? <ChevronUp size={20} color="var(--primary-color)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
                </div>
              </div>
              
              {openFaq === index && (
                <div className="animate-fade-in" style={{ marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" style={{ marginTop: '2rem', maxWidth: '600px', margin: '2rem auto', width: '100%' }}>
        <div className="card hover-glow responsive-p-lg">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Get In Touch</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Have questions? We'd love to hear from you.</p>
          </div>
          <form 
            onSubmit={async (e) => { 
              e.preventDefault(); 
              
              const form = e.target;
              const formData = new FormData(form);
              
              // Convert FormData to JSON
              const object = Object.fromEntries(formData);
              object.access_key = "c5bcd002-ea1a-40dd-bd6c-2aea70461281";
              object.subject = "New Contact from DevBlog";
              object.from_name = "DevBlog Notifications";
              const json = JSON.stringify(object);
              
              try {
                const response = await fetch("https://api.web3forms.com/submit", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                  },
                  body: json
                });
                
                const data = await response.json();
                
                if (response.status === 200) {
                  alert("Thanks for your message! Our team will get back to you soon.");
                  form.reset();
                } else {
                  console.error("Web3Forms error:", data);
                  alert("There was an error sending your message. Please try again later.");
                }
              } catch (error) {
                console.error("Submission failed:", error);
                alert("Failed to send the message. Please check your connection.");
              }
            }} 
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div>
              <label htmlFor="contact-name" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Name</label>
              <input id="contact-name" name="name" type="text" placeholder="Your Name" required />
            </div>
            <div>
              <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
              <input id="contact-email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Message</label>
              <textarea id="contact-message" name="message" placeholder="How can we help you?" required style={{ minHeight: '120px' }}></textarea>
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}>
              Send Message
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
