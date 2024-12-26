import React, { useState, useRef } from 'react';
import axios from 'axios';

interface LoginProps {
  onLogin: (userData: any) => void; // Fonction pour gérer la connexion
  onSignup: () => void; // Fonction pour basculer vers la page d'inscription
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignup }) => {
  // États pour les champs et erreurs
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Références pour les champs de saisie
  const emailRef = useRef<HTMLInputElement >(null);
  const passwordRef = useRef<HTMLInputElement >(null);

  // Fonction pour gérer la connexion
  const handleLogin = async (): Promise<void> => {
    try {
      setError('');
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });
      const userData = response.data;

      // Vérification si l'utilisateur est un admin (email spécifique)
      userData.isAdmin = email.toLowerCase().trim() === 'admin@exemple.com';

      onLogin(userData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  

  // Fonction pour gérer la touche "Enter"
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextFieldRef?: React.RefObject<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldRef?.current) {
        nextFieldRef.current.focus(); // Passe au champ suivant
      } else {
        handleLogin(); // Valide le formulaire
      }
    }
  };

  return (
    <div className="container">
      <div className="hero is-primary is-bold">
        <div className="hero-body">
          <h1 className="title has-text-centered">Login</h1>
        </div>
      </div>
      <div className="columns is-centered">
        <div className="column is-4">
          <div className="card">
            <div className="card-content">
              <div className="field">
                <label className="label">Email</label>
                <div className="control has-icons-left">
                  <input
                    ref={emailRef!}
                    className="input is-info"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, passwordRef)} // Passe au champ suivant
                  />
                  <span className="icon is-small is-left">
                    <i className="fas fa-envelope"></i>
                  </span>
                </div>
              </div>
              <div className="field">
                <label className="label">Password</label>
                <div className="control has-icons-left">
                  <input
                    ref={passwordRef}
                    className="input is-info"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)} // Valide la connexion
                  />
                  <span className="icon is-small is-left">
                    <i className="fas fa-lock"></i>
                  </span>
                </div>
              </div>
              <button
                className="button is-primary is-fullwidth"
                onClick={handleLogin}
              >
                Log in
              </button>
              {error && <p className="has-text-danger">{error}</p>}
            </div>
          </div>
          <button
            className="button is-link is-outlined is-fullwidth"
            onClick={onSignup}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
