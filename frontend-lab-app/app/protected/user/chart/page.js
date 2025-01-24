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
      router.push('/signin');
      return;
    }
    if(user) {
    const fetchCart = async () => {
      try {
        const cartSnapshot = await getDoc(doc(db, 'carts', user.uid)); 
        if (cartSnapshot.exists()) {
            const data = cartSnapshot.data();
            const products = data.productIDList;
      
            if (Array.isArray(products)) {
              setCartItems(products); 
            } else {
              console.error('Expected an array of products, but got:', products);
              setError('Brak danych w koszyku');
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
    // Ensure that quantity is a valid positive number
    if (newQuantity <= 0) {
      setError('Ilość musi być większa niż 0.');
      return;
    }
  
    // Update the local state to immediately reflect the change
    setCartItems(prevItems => prevItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  
    try {
      // Fetch the user's cart from Firebase
      const cartSnapshot = await getDoc(doc(db, 'carts', user.uid));
      const cartData = cartSnapshot.exists() ? cartSnapshot.data() : null;
      console.log(cartData);
  
      if (cartData) {
        // Check if the product already exists in the cart
        const productIndex = cartData.productIDList.findIndex(item => item.productID.id === productId);
  
        if (productIndex !== -1) {
          // If the product exists, update its quantity
          const updatedProductList = [...cartData.productIDList];
          updatedProductList[productIndex] = {
            ...updatedProductList[productIndex],
            quantity: newQuantity
          };
  
          // Ensure the product details are valid and not undefined
          if (!updatedProductList[productIndex].productID || updatedProductList[productIndex].quantity === undefined) {
            throw new Error('Niepoprawne dane produktu w koszyku');
          }
  
          // Update the cart in Firebase
          await updateDoc(doc(db, 'carts', user.uid), {
            productIDList: updatedProductList
          });
        } else {
          // If the product doesn't exist, add it to the cart
          const newProduct = {
            productID: { id: productId },
            quantity: newQuantity
          };
  
          // Ensure the new product data is valid
          if (!newProduct.productID || newProduct.quantity === undefined) {
            throw new Error('Niepoprawne dane produktu');
          }
  
          const updatedProductList = [...cartData.productIDList, newProduct];
  
          // Update the cart in Firebase
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
        {cartItems.map((item, index) => (
          <div key={item.id || index} className="cart-item">
            <div className="product-info">
              <img src={item.productID.ImgLink} alt={item.productID.Name} className="product-image" />
              <div className="product-details">
                <h3>{item.productID.Name}</h3>
                <p><strong>Cena:</strong> {item.productID.Price} PLN</p>
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