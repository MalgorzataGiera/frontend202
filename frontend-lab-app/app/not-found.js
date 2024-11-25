'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="not-found-container">
      <h1>404 - NotFound</h1>
      <button onClick={handleGoHome}>Home page</button>
    </div>
  );
}
