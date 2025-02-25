'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/_lib/AuthContext'; 
import { useRouter } from 'next/navigation';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/_lib/firebase';
import { updateProfile } from 'firebase/auth';
import Link from 'next/link';
import '../profile.css'

export default function ProfileEdit() {
  const { user } = useAuth(); 
  const [displayName, setDisplayName] = useState(user?.displayName || ''); 
  const [photoURL, setPhotoURL] = useState(user?.photoURL || ''); 
  const [address, setAddress] = useState({
    city: '',
    street: '',
    zipCode: '',
  });
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      // return <div>Musisz być zalogowany, aby edytować profil.</div>;
    }  

    if (user) {
      // Pobieramy dane użytkownika z Firestore
      const fetchData = async () => {
        try {
          const snapshot = await getDoc(doc(db, 'users', user.uid));
          if (snapshot.exists()) {
            const userData = snapshot.data();
            setAddress(userData.address);
          } else {
            console.log('Brak danych użytkownika');
          }
        } catch (error) {
          console.error('Błąd podczas pobierania danych:', error);
          setError('Wystąpił błąd przy pobieraniu danych');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, router]);


  const onSubmit = (event) => {
    event.preventDefault();
    if (!address.city || !address.street || !address.zipCode) {
      setError('Wszystkie pola muszą być wypełnione');
      return;
    }
    setLoading(true);

    // Zapisanie danych w Firestore
    try {
      setDoc(doc(db, 'users', user.uid), {
        address: {
          city: address.city,
          street: address.street,
          zipCode: address.zipCode,
        },
      });

    // Aktualizacja w Firebase Authentication
    const profileUpdates = {};
    
    if (user) {
      // const updates = {};

      if (displayName && displayName !== user.displayName) {
        profileUpdates.displayName = displayName;
      }
  
      if (photoURL && photoURL !== user.photoURL) {
        profileUpdates.photoURL = photoURL;
      }
  
      if (Object.keys(profileUpdates).length > 0) {
        updateProfile(user, profileUpdates);
      }
    }
    setError('');
    setLoading(false);

     // Ustawienie komunikatu w localStorage
     localStorage.setItem('profileUpdated', 'Profil został zaktualizowany!');

    router.push('/protected/user/profile');
    } catch (error) {
      console.error('Błąd podczas zapisywania danych:', error);
      setError('Wystąpił błąd przy zapisywaniu danych');
    }
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  
  return (
    <div className="profile-container">
      <h2>Edytuj profil użytkownika</h2>

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
            value={user?.email}
            readOnly
          />
        </div>


        <div className="input-group">
          <label htmlFor="photoURL">
            {photoURL && 
            <div className="avatar-edit">
              <img src={user.photoURL} alt="Profile"/>
            </div>} Zdjęcie profilowe - załącz link</label>
          <input
            type="text"
            id="photoURL"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="city">Miasto:</label>
          <input
            type="text"
            id="city"
            value={address.city}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, city: e.target.value }))
            }
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="street">Ulica:</label>
          <input
            type="text"
            id="street"
            value={address.street}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, street: e.target.value }))
            }
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="zipCode">Kod pocztowy:</label>
          <input
            type="text"
            id="zipCode"
            value={address.zipCode}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, zipCode: e.target.value }))
            }
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Aktualizowanie...' : 'Zaktualizuj profil'}
        </button>      
      </form>
    </div>
    
  );
}
