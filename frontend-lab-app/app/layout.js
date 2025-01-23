'use client'
import { AuthProvider, useAuth } from '@/app/_lib/AuthContext';
import './globals.css';
import Link from 'next/link';
import { useState } from 'react';
import { RiShoppingCartLine } from "react-icons/ri";

export default function Layout({ children }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <AuthProvider>
      <html lang="pl">
        <body>
          <div className={`layout-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
              <button className="toggle-button" onClick={toggleSidebar}>
                  <span>{isSidebarCollapsed ? '➤' : '⬅'}</span>
                </button>
              <SidebarLinks />
            </nav>

            <header className="header">
                <div className="auth-links">
                <AuthLinks /> 
                </div>
              </header>

            <div className="main-content">             
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
  
  if (user) {
    // Użytkownik jest zalogowany
    return (
      <div id="top" className="auth-links-container">
        <Link href="/protected/user/chart" className="auth-link"> 
          <RiShoppingCartLine/> 
        </Link>
        <Link href="/protected/user/signout" className="auth-link">
          Wyloguj
        </Link>
      </div>
    );
  }

  // Użytkownik nie jest zalogowany
  return (
    <div id="top" className="auth-links-container">
      <Link href="/signin" className="auth-link">Logowanie</Link>
      <Link href="/register" className="auth-link">Rejestracja</Link>
    </div>
  );
}

function SidebarLinks() {
  const { user } = useAuth();

  return (
    <ul>
      <li>
        <Link href="/">
          <p className="icon">🏠</p> <span>Strona Główna</span>
        </Link>
      </li>
      <li>
        <Link href="/about">
          <p className="icon">ℹ️</p> <span>O nas</span>
        </Link>
      </li>
      <li>
        <Link href="/services">
          <p className="icon">🛠️</p> <span>Usługi</span>
        </Link>
      </li>
      <li>
        <Link href="/contact">
          <p className="icon">📞</p> <span>Kontakt</span>
        </Link>
      </li>
      {user && (
        <li>
          <Link href="/protected/user/profile">
            <p className="icon">👤</p> <span>Profil</span>
          </Link>
        </li>
      )}
    </ul>
  );
}
