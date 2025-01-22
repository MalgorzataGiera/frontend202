'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/_lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './profile.css'
import '@/app/globals.css'

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [alertMessage, setAlertMessage] = useState('');
  const [hideAlert, setHideAlert] = useState(false);

  useEffect(() => {
    // Odczytujemy komunikat o zaktualizowaniu profilu z localStorage
    const message = localStorage.getItem('profileUpdated');
    if (message) {
    setAlertMessage(message);

    setTimeout(() => {
        setHideAlert(true); // Zmieniamy stan na ukrycie alertu
        setTimeout(() => {
          setAlertMessage('');
          setHideAlert(false); // Resetujemy stan alertu po 1 sekundzie (czas animacji)
          localStorage.removeItem('profileUpdated');
        }, 2500); // Usuwamy alert po zakończeniu animacji
      }, 3000);
    }
  }, []);

  if (!user) {
    router.push('/signin');
    return <div>Musisz być zalogowany, aby zobaczyć swój profil.</div>;
  }

  return (
    <div className="profile-container">
      <h2>Profil użytkownika</h2>
      {user.photoURL && (
          <div className="avatar">
            <img src={user.photoURL} alt="Profile" className='avatar-photo'/>
          </div>
        )}
      <div className="profile-details">
        <p><strong>Nazwa użytkownika:</strong> {user.displayName || 'Brak nazwy'}</p>
        <p><strong>E-mail:</strong> {user.email}</p>
        
        {/* Dodaj inne dane użytkownika, jeśli są dostępne */}
      </div>
      
      <div className="order-link">
        <Link href="/protected/user/orders">Twoje zamówienia</Link>
      </div>
      <div>
        <button >
            <Link href="/protected/user/profile/edit">Edytuj profil</Link>
        </button>
      </div>
      
      {alertMessage && (
        <div className={`custom-alert ${hideAlert ? 'hide' : ''}`}>
          {alertMessage}
        </div>
      )}
    </div>
  );
}
