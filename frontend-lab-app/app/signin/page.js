'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, getAuth } from 'firebase/auth';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/_lib/AuthContext';

function SignInForm() {
  const { user } = useAuth()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const auth = getAuth();
  const params = useSearchParams();
  const returnUrl = params.get('returnUrl') || '/';
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ustawia sesję
      await setPersistence(auth, browserSessionPersistence);

      await signInWithEmailAndPassword(auth, email, password);
      
      router.push(returnUrl);
    } catch (err) {
      setError('Błąd logowania. Sprawdź dane i spróbuj ponownie.');
    }
  };

  return (
    <div className="form-container">
      <h2>Logowanie</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Hasło</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zaloguj się</button>
        
      </form>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <SignInForm />
    </Suspense>
  );
}