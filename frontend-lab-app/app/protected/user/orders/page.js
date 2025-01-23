'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/_lib/AuthContext';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { db } from '@/app/_lib/firebase';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(user);
    if (!user) {
      setLoading(false);
      setError('Musisz być zalogowany, aby zobaczyć swoje zamówienia.');
      console.log('nie zalogowany - orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('user', '==', `/users/${user.uid}`));
        const querySnapshot = await getDocs(q);

        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(ordersData);
        setError('');
      } catch (error) {
        console.error('Błąd podczas pobierania zamówień:', error);
        setError('Nie udało się pobrać zamówień. Spróbuj ponownie później.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);

      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('user', '==', userRef));
      console.log('zalogowany - orders');

      console.log('query', q);

      getDocs(q)
        .then((querySnapshot) => {
        if (querySnapshot.empty) {
            setError('Nie znaleziono zamówień dla tego użytkownika.');
          }
        
          else {
            // Mapowanie wyników zapytania do tablicy obiektów zamówień
            const ordersData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setOrders(ordersData);
          }
        })
        .catch((error) => {
          console.error('Błąd podczas pobierania zamówień:', error);
          setError('Nie udało się pobrać zamówień. Spróbuj ponownie później.');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div>Ładowanie zamówień...</div>;

  if (error) return <div className="error">{error}</div>;

  if (orders.length === 0) return <div>Nie masz żadnych zamówień.</div>;

  return (
    <div>
      <h1>Twoje zamówienia</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <p><strong>Koszt:</strong> {order.cost} PLN</p>
            <p><strong>Data:</strong> {order.date.toDate().toLocaleString()}</p>
            <p><strong>ID Zamówienia:</strong> {order.id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
