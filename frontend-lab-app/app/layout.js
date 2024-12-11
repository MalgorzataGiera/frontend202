'use client'
import { AuthProvider, useAuth } from '@/app/_lib/AuthContext';
import './styles/globals.css';

export default function Layout({ children }) {
  return (
    <AuthProvider>
      <html lang="pl">
        <body>
          <div className="layout-container">
            <nav className="sidebar">
              <ul>
                <li><a href="/"><i className="icon">🏠</i> Strona Główna</a></li>
                <li><a href="/about"><i className="icon">ℹ️</i> O nas</a></li>
                <li><a href="/services"><i className="icon">🛠️</i> Usługi</a></li>
                <li><a href="/contact"><i className="icon">📞</i> Kontakt</a></li>
              </ul>
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
  const { user, logout } = useAuth(); // Pobieranie stanu zalogowania i funkcji wylogowania

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
      <a href="/protected/user/signout" onClick={handleLogout}>
        Wyloguj
      </a>
    );
  }

  // Użytkownik nie jest zalogowany
  return (
    <>
      <a href="/signin">Logowanie</a>
      <a href="/register">Rejestracja</a>
    </>
  );
}
