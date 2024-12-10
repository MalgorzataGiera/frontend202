'use client';

import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, fetchSignInMethodsForEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation'; 
import { useAuth } from '@/app/_lib/AuthContext'; 

export default function RegisterForm() {
  const { user } = useAuth();
  const router = useRouter();
  
  // if (user) {
  //   return null; // Jeśli użytkownik jest już zalogowany, nie pokazuje formularza rejestracji
  // }

  const auth = getAuth();

  const [registerError, setRegisterError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Sprawdzamy, czy hasła się zgadzają
    if (password !== confirmPassword) {
      setRegisterError("Hasła muszą się zgadzać.");
      return;
    }

    try {
      // tworzymy użytkownika
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log("Użytkownik zarejestrowany!");
          
          // Wysyłamy e-mail weryfikacyjny
          sendEmailVerification(auth.currentUser)
            .then(() => {
              console.log("Wysłano e-mail weryfikacyjny!");
              router.push("/verify");
            });
        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            setRegisterError('Konto z tym adresem e-mail już istnieje.');
          } else {
            setRegisterError(error.message);
          }
          console.dir(error);
        });
    } catch (error) {
      setRegisterError("Wystąpił problem.");
      console.dir(error);
    }
  };

  return (
    <div className="form-container">
      <h2>Rejestracja</h2>
      {registerError && <p className="error">{registerError}</p>}
      <form onSubmit={onSubmit}>
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
        <div className="input-group">
          <label htmlFor="confirmPassword">Potwierdź hasło</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zarejestruj się</button>
      </form>
    </div>
  );
}