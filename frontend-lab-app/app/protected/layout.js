'use client';

import { useAuth } from "../_lib/AuthContext";
import { useLayoutEffect } from "react";
import { redirect } from 'next/navigation';
import { usePathname } from 'next/navigation';

function Protected({ children }) {
    const { user } = useAuth();
    const returnUrl = usePathname(); // ścieżka do której użytkownik próbuje uzyskać dostęp

    useLayoutEffect(() => {
        // Jeśli użytkownik nie jest zalogowany
        if (!user) {
            redirect(`/user/signin?returnUrl=${returnUrl}`);
        }
    }, [user, returnUrl]);

    return (
        <>
            {children} {/* tylko jeśli użytkownik jest zalogowany */}
        </>
    );
}

export default Protected;
