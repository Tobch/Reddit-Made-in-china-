import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function CreateCommunity() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/communities`, 
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || "Error creating community");
    }
  };

  return (
    <div className="auth-card" style={{ margin: 'auto' }}>
      <h2>Create a Community</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input placeholder="Community Name (e.g., programming)" value={name} onChange={e => setName(e.target.value)} required />
        <textarea 
          placeholder="Description" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          style={{ padding: '12px', borderRadius: '4px', border: '1px solid #edeff1', minHeight: '100px' }}
          required 
        />
        <button type="submit" className="btn-primary">Create</button>
      </form>
    </div>
  );
}