'use client'
import { AuthProvider, useAuth } from '@/app/_lib/AuthContext';
import './styles/globals.css';
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <AuthProvider>
      <html lang="pl">
        <body>
          <div className="layout-container">
            <nav className="sidebar">
            <SidebarLinks />
            </nav>

            <div className="main-content">
              <header className="header">
                <div className="auth-links">
                <AuthLinks /> 
                </div>
              </header>

              <main>{children}</main>
            </div>
          </div>

          <footer className="footer">
            <p>© 2024 Twoja Aplikacja</p>
          </footer>
        </body>
      </html>
    </AuthProvider>
  );
}

function AuthLinks() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout(); // Wywołanie funkcji wylogowania z AuthContext
      console.log('Wylogowano pomyślnie');
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
    }
  };

  if (user) {
    // Użytkownik jest zalogowany
    return (
      <Link href="/protected/user/signout">
        Wyloguj
      </Link>
    );
  }

  // Użytkownik nie jest zalogowany
  return (
    <>
      <Link href="/signin">Logowanie</Link>
      <Link href="/register">Rejestracja</Link>
    </>
  );
}

function SidebarLinks() {
  const { user } = useAuth();

  return (
    <ul>
      <li><Link href="/"><i className="icon">🏠</i> Strona Główna</Link></li>
      <li><Link href="/about"><i className="icon">ℹ️</i> O nas</Link></li>
      <li><Link href="/services"><i className="icon">🛠️</i> Usługi</Link></li>
      <li><Link href="/contact"><i className="icon">📞</i> Kontakt</Link></li>
      {user && ( // Jeśli użytkownik jest zalogowany, wyświetl link do profilu
        <li><Link href="/protected/user/profile"><i className="icon">👤</i> Profil</Link></li>
      )}
    </ul>
  );
}
