'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/_lib/AuthContext'; 
import { useRouter } from 'next/navigation';
import { getDoc, doc} from 'firebase/firestore';
import { db } from '@/app/_lib/firebase';
import Link from 'next/link';
import './cart.css'; // Dodaj odpowiednie style CSS

export default function CartPage() {
  const { user } = useAuth(); 
  const [cartItems, setCartItems] = useState([]); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // if (!user) {
    //   router.push('/signin');
    //   return;
    // }

    if(user) {
    const fetchCart = async () => {
      try {
        const cartSnapshot = await getDoc(doc(db, 'carts', user.uid)); 

        if (cartSnapshot.exists()) {
            const cartData = cartSnapshot.data();
          
          // Check if productIDList exists and is an array
          if (Array.isArray(cartData.productIDList)) {
            const productPromises = cartData.productIDList.map(async (item) => {
              const productRef = doc(db, 'products', item.productID.id); // Resolving the DocumentReference to get product data
              const productSnapshot = await getDoc(productRef);
              const productData = productSnapshot.exists() ? productSnapshot.data() : null;
              return {
                ...item,
                productDetails: productData,
              };
            });

            const resolvedProducts = await Promise.all(productPromises);
            setCartItems(resolvedProducts);
            }
        } else {
            console.log('Brak danych użytkownika');
        }
      } catch (error) {
        console.error('Błąd podczas pobierania koszyka:', error);
        setError('Wystąpił błąd przy pobieraniu danych koszyka');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  } else{
    setLoading(false);
  }
 }, [user, router]);

  if (loading) {
    return <div>Ładowanie koszyka...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (cartItems.length === 0) {
    return <div>Twój koszyk jest pusty.</div>;
  }

  return (
    <div className="cart-container">
      <h2>Twój koszyk</h2>

      {error && <p className="error">{error}</p>}

      {<form>
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="product-info">
              <img src={item.productDetails?.ImgLink} alt={item.productDetails?.Name} className="product-image" />
              <div className="product-details">
                <h3>{item.productDetails?.Name}</h3>
                <p>Cena: {item.productDetails?.Price} PLN</p>
                <div className="cart-input-group">
                  <label htmlFor={`quantity-${item.id}`}>Ilość:</label>
                  <input
                    type="number"
                    id={`quantity-${item.id}`}
                    value={item.quantity}
                    min="1"
                    onChange={(e) => updateProductQuantity(item.id, parseInt(e.target.value))}
                  />
                </div>
                <p><strong>Łączny koszt: {item.productDetails?.Price * item.quantity} PLN </strong> </p>
              </div>
            </div>
          </div>
        ))}

        <div className="cart-actions">
          <Link href="/checkout">
            <button type="button">Podsumowanie</button>
          </Link>
        </div>
      </form> }
    </div>
  );
}
