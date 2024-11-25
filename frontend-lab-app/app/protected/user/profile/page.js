'use client';

import { useAuth } from "@/app/_lib/AuthContext";
import { useEffect } from "react";
import { redirect, usePathname } from 'next/navigation';

function Profilepage() {
    const { user } = useAuth();
    const returnUrl = usePathname();
  
    useEffect(() => {
      if (!user) {
        redirect(`/user/signin?returnUrl=${returnUrl}`);
      }
    }, [user, returnUrl]);
  
    if (!user) return null; // Wstrzymuje renderowanie jeśli użytkownik nie jest zalogowany
  
    return (
      <div>
        <h1>Protected user profile</h1>
      </div>
    );
  }
  
  export default Profilepage;