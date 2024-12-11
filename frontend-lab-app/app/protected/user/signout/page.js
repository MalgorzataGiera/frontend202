'use client';

import { signOut, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LogoutForm() {
    const router = useRouter();
    const auth = getAuth();

    const onSubmit = (event) => {
        console.log('logout');
        event.preventDefault();
        signOut(auth)
            .then(() => {
                router.push("/"); // Przekierowanie na strone glowna
            })
            .catch((error) => {
                console.error("Błąd podczas wylogowywania:", error.message);
            })        
    };

    return (
        <div className="logout-form-container">
            <form onSubmit={onSubmit}>
                <button
                    type="submit"
                    className="logout-button bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Wyloguj się
                </button>
            </form>
        </div>
    );
}
