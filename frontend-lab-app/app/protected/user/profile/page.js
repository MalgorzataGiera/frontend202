'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/_lib/AuthContext'; // Aby uzyskać dane użytkownika
import { updateProfile } from 'firebase/auth'; // Funkcja do aktualizacji profilu
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { user } = useAuth(); // Uzyskanie aktualnego użytkownika z kontekstu
  const [displayName, setDisplayName] = useState(user?.displayName || ''); // Stan na nazwę wyświetlaną
  const [photoURL, setPhotoURL] = useState(user?.photoURL || ''); // Stan na URL zdjęcia profilowego
  const [error, setError] = useState(''); // Stan do obsługi błędów
  const [loading, setLoading] = useState(false); // Stan ładowania formularza
  const router = useRouter();
 

  useEffect(() => {
    if (!user) {
      // Jeśli użytkownik nie jest zalogowany, przekierowujemy go na stronę logowania
      router.push('/user/signin');
    }
  }, [user, router]);

  const onSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setError(''); // Resetowanie błędów przed próbą aktualizacji

    updateProfile(user, {
      displayName,
      photoURL,
    })
      .then(() => {
        console.log('Profile updated');
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  return (
    <div className="form-container">
      <h2>Profil użytkownika</h2>
      
      {/* Warunkowe renderowanie błędu */}
      {error && <p className="error">{error}</p>}

      <form onSubmit={onSubmit}>
        <div className="input-group">
          <label htmlFor="displayName">Nazwa użytkownika</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={user?.email} // E-mail tylko do odczytu
            readOnly
          />
        </div>

        <div className="input-group">
          <label htmlFor="photoURL">Zdjęcie profilowe - załącz plik</label>
          <input
            type="text"
            id="photoURL"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
          />
        </div>
        {photoURL && <img src={photoURL} alt="Profile" width="100" height="100" />}

        <button type="submit" disabled={loading}>
          {loading ? 'Aktualizowanie...' : 'Zaktualizuj profil'}
        </button>
      </form>
    </div>
  );
}
