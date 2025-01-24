'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/_lib/AuthContext'; 
import { useRouter } from 'next/navigation';
import { getDoc, doc, updateDoc} from 'firebase/firestore';
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
    if (!user) {
    //   router.push('/signin');
      return;
    }

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

 const updateProductQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setError('Ilość musi być większa niż 0.');
      return;
    }
  
    // aktualizacjana ekranie
    setCartItems(prevItems => prevItems.map(item =>
      item.productID.id === productId ? { ...item, quantity: newQuantity } : item
    ));

    try {
      const cartSnapshot = await getDoc(doc(db, 'carts', user.uid));
      const cartData = cartSnapshot.exists() ? cartSnapshot.data() : null;
  
      if (cartData) {
        // czy produkt już istnieje w koszyku
        const productIndex = cartData.productIDList.findIndex(item => item.productID.id === productId);
  
        if (productIndex !== -1) {
          // zaktualizuj ilość
          const updatedProductList = [...cartData.productIDList];
          updatedProductList[productIndex] = {
            ...updatedProductList[productIndex],
            quantity: newQuantity
          };
  
          await updateDoc(doc(db, 'carts', user.uid), {
            productIDList: updatedProductList
          });
        } else {
          // Jeśli produkt nie istnieje, dodaj go do koszyka
          const newProduct = {
            productID: { id: productId },
            quantity: newQuantity
          };
  
          const updatedProductList = [...cartData.productIDList, newProduct];
  
          await updateDoc(doc(db, 'carts', user.uid), {
            productIDList: updatedProductList
          });
        }
      } else {
        console.error("Koszyk nie istnieje");
      }
    } catch (error) {
      console.error('Błąd przy aktualizacji ilości:', error);
      setError('Wystąpił błąd przy aktualizacji ilości produktu');
    }
  };

  const removeProductFromCart = async (productId) => {
    // Ustawiamy quantity na 0 zamiast usuwać rekord z bazy danych
    try {
      const cartSnapshot = await getDoc(doc(db, 'carts', user.uid));
      const cartData = cartSnapshot.exists() ? cartSnapshot.data() : null;

      if (cartData) {
        const productIndex = cartData.productIDList.findIndex(item => item.productID.id === productId);

        if (productIndex !== -1) {
          const updatedProductList = [...cartData.productIDList];
          updatedProductList[productIndex] = {
            ...updatedProductList[productIndex],
            quantity: 0
          };

          await updateDoc(doc(db, 'carts', user.uid), {
            productIDList: updatedProductList
          });

          // Zaktualizowanie lokalnego stanu (ukrywa produkt na ekranie)
          setCartItems(prevItems => prevItems.filter(item => item.productID.id !== productId));
        } else {
          console.log("Produkt nie istnieje w koszyku");
        }
      } else {
        console.error("Koszyk nie istnieje");
      }
    } catch (error) {
      console.error('Błąd przy usuwaniu produktu:', error);
      setError('Wystąpił błąd przy usuwaniu produktu z koszyka');
    }
  };

  const visibleCartItems = cartItems.filter(item => item.quantity > 0);

  if (loading) {
    return <div>Ładowanie koszyka...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (visibleCartItems.length === 0) {
    return <div>Twój koszyk jest pusty.</div>;
  }


  return (
    <div className="cart-container">
      <h2>Twój koszyk</h2>
      {error && <p className="error">{error}</p>}
      {<form>
        {visibleCartItems.map((item, index) => (
          <div key={item.id || index} className="cart-item">
            <div className="product-info">
              <img src={item.productDetails?.ImgLink} alt={item.productDetails?.Name} className="product-image" />
              <div className="product-details">
                <h3>{item.productDetails?.Name}</h3>
                <p><strong>Cena:</strong> {item.productDetails?.Price} PLN</p>
                <div className="cart-input-group">
                  <label htmlFor={`quantity-${item.id}`}>Ilość:</label>
                  <input
                    type="number"
                    id={`quantity-${item.id}`}
                    value={item.quantity}
                    min="1"
                    onChange={(e) => (updateProductQuantity(item.productID.id, e.target.value)/*console.log(item.productID.id, parseInt(e.target.value)*/)}
                  />
                </div>
                <p><strong>Łączna cena:</strong> {item.productID.Price * item.quantity} PLN</p>
              </div>
            </div>
            <button type="button" className='remove-button' onClick={() => removeProductFromCart(item.productID.id)}>x</button>
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