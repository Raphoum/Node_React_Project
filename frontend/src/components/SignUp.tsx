import React, { useState } from 'react';
import axios from 'axios';

interface SignupProps {
  onLogin: () => void; 
}

const Signup: React.FC<SignupProps> = ({ onLogin }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [age, setAge] = useState<string>(''); 
  const [role, setRole] = useState<string>('user');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSignup = async (): Promise<void> => {
    if (!name || !email || !age || !role) {
      setError('All fields are required');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await axios.post('http://localhost:5000/signup', {
        name,
        email,
        age: parseInt(age, 10), 
        role,
      });
      setSuccess('Account created successfully!');
    } catch (err: any) {
        console.log(err);
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="container">
      <h1 className="title has-text-centered">Create an Account</h1>
      <div className="box">
        <div className="field">
          <label className="label">Firstname Name</label>
          <div className="control">
            <input
              className="input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <input
              className="input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Age</label>
          <div className="control">
            <input
              className="input"
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input
              className="input"
              type="text"
              placeholder="Enter your password (e.g., admin, user)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>
        <button className="button is-primary" onClick={handleSignup}>
          Sign Up
        </button>
        {success && <p className="has-text-success">{success}</p>}
        {error && <p className="has-text-danger">{error}</p>}
      </div>
      <button className="button is-text" onClick={onLogin}>
        Back to Login
      </button>
    </div>
  );
};

export default Signup;
