'use client';

import { useAuth } from '@/app/_lib/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';

export default function VerifyEmail() {
  const { user } = useAuth();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
      // Wylogowuje użytkownika, aby musiał się ponownie zalogować po weryfikacji
      signOut(getAuth())
        .catch((error) => {
          console.error('Error signing out:', error);
        });
  }, [user, router, auth]);

  return (
    <div className="form-container">
      <h1>Email not verified</h1>
      <p>
        Please verify your email by clicking the link sent to your address {user?.email}.
      </p>
      <p>
        If you haven’t received the email, check your spam folder or request another verification link.
      </p>
    </div>
  );
}
