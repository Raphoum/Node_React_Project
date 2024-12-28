import React, { JSX, useState } from 'react';
import 'bulma/css/bulma.min.css';
import Login from './/components/Login';
import Signup from './/components/SignUp';
import AdminPanel from './/components/AdminPanel';
import UserPanel from './/components/UserPanel';

interface User {
    user_id: number;
    name: string;
    email: string;
    age: number;
    role: string;
}

function SqlQuery(): JSX.Element {
  const [page, setPage] = useState<'login' | 'signup' | 'admin' | 'user'>('login'); 
  const [user, setUser] = useState<User | null>(null); 

  const handleLogin = (userData: User): void => {
    setUser(userData); 
    setPage(userData.role === 'admin' ? 'admin' : 'user');
};

  // Gère la déconnexion
  const handleLogout = (): void => {
    setUser(null); // Réinitialise les informations utilisateur
    setPage('login'); // Retourne à la page de connexion
  };

  return (
    <div className="container">
      {/* Navigation entre les pages */}
      {page === 'login' && (
        <Login onLogin={handleLogin} onSignup={() => setPage('signup')}/>
      )}
      {page === 'signup' && (
        <Signup onLogin={() => setPage('login')} /> // Retourne à la connexion après l'inscription
      )}
      {page === 'admin' && (
        <AdminPanel user={user} onLogout={handleLogout} /> // Page admin avec bouton déconnexion
      )}
      {page === 'user' && user &&(
        <UserPanel user={user} onLogout={handleLogout} /> // Page user avec bouton déconnexion
      )}
    </div>
  );
}

export default SqlQuery;
