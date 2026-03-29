import { useState } from 'react';
import API from '../api/axios'; 

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Added loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email format.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true); // Disable button while sending
      try {
        // This will now hit ...onrender.com/api/contact
        await API.post('/contact', formData); 
        
        alert(`Thank you for the recommendation, ${formData.name}!`);
        setFormData({ name: '', email: '', message: '' });
      } catch (err) {
        console.error("Contact Error:", err.response);
        alert(err.response?.data?.message || "Failed to send message. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <main className="content">
      {/* Contact form — from original contact.html */}
      <div className="container">
        <h1>Let's Connect</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <span className="error">{errors.name}</span>}

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <span className="error">{errors.email}</span>}

          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            rows="4"
            placeholder="Tell me about a cool local spot..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />

          <button type="submit" id="newcolor">Send Recommendation</button>
        </form>
      </div>

      {/* Travel Resources table — from original contact.html */}
      <div className="container" style={{ marginTop: '20px' }}>
        <h2>Travel Resources</h2>
        <table>
          <tbody>
            <tr>
              <td><a href="https://share.google/pYQxPRUL83I1mjklM" target="_blank" rel="noreferrer">Provincial Government of La Union</a></td>
              <td>Official site for Provincial Government of La Union.</td>
            </tr>
            <tr>
              <td><a href="https://share.google/0PSGVSMlD1DFuYsYE" target="_blank" rel="noreferrer">Trip.com</a></td>
              <td>Tubao Travel Guide</td>
            </tr>
            <tr>
              <td><a href="https://share.google/0IScQAdx9cT7CegmE" target="_blank" rel="noreferrer">Airbnb</a></td>
              <td>Top-rated vacation rentals in Tubao</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Embedded Google Map — from original contact.html */}
      <div className="container" style={{ marginTop: '20px' }}>
        <h2>My Location: Tubao, La Union</h2>
        <div className="map-container">
          <iframe
            title="Tubao Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30604.43734005118!2d120.39567438312526!3d16.345864147772652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x339199f16806e57b%3A0x7d6c6f600f73854!2sTubao%2C%20La%20Union!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
            width="100%"
            height="300"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </main>
  );
}

export default ContactPage;
