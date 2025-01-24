'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/_lib/AuthContext'; 
import { useRouter } from 'next/navigation';
import { getDoc, doc, updateDoc} from 'firebase/firestore';
import { db } from '@/app/_lib/firebase';
import Link from 'next/link';
import './cart.css'; // Dodaj odpowiednie style CSS
import '@/app/products/products.css';
import { RiShoppingCartLine } from "react-icons/ri";

  
export default function CartPage() {
  const { user } = useAuth(); 
  const [cartItems, setCartItems] = useState([]); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0); 
  const [totalCost, setTotalCost] = useState(0);
  const [alertMessage, setAlertMessage] = useState(null);
  const [hideAlert, setHideAlert] = useState(false);

  const showToast = (message) => {
    setAlertMessage(message);
    setHideAlert(false);
    setTimeout(() => setAlertMessage(null), 3000); // Remove alert after 3 seconds
  };

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
              const productData = productSnapshot.exists() ? productSnapshot.data() : null; // has array

            // Pobierz powiązane produkty
            const relatedProducts = await Promise.all(
            (productData.productID || []).map(async (relatedItem) => {
              const relatedProductRef = doc(db, 'products', relatedItem.id);
              const relatedProductSnapshot = await getDoc(relatedProductRef);
              return relatedProductSnapshot.exists() ? relatedProductSnapshot.data() : null;
            })

          );
              return {
                ...item,
                productDetails: productData,
                relatedProducts: relatedProducts.filter(Boolean)
              };
            });
            const resolvedProducts = await Promise.all(productPromises);
            setCartItems(resolvedProducts);
            calculateTotalCost(resolvedProducts);
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

  const clearCart = async () => {
    try {
      const cartSnapshot = await getDoc(doc(db, 'carts', user.uid));
      const cartData = cartSnapshot.exists() ? cartSnapshot.data() : null;

      if (cartData) {
        // Zaktualizuj quantity każdego produktu na 0
        const updatedProductList = cartData.productIDList.map(item => ({
          ...item,
          quantity: 0
        }));

        await updateDoc(doc(db, 'carts', user.uid), {
          productIDList: updatedProductList,
          promoCode: '0000promocode0000'
        });

        // Zaktualizuj stan w aplikacji
        setCartItems(updatedProductList);
      }
    } catch (error) {
      console.error('Błąd przy czyszczeniu koszyka:', error);
      setError('Wystąpił błąd przy czyszczeniu koszyka');
    }
  };

  const visibleCartItems = cartItems.filter(item => item.quantity > 0);

//   const totalCost = visibleCartItems.reduce((total, item) => {
//     return total + (item.productDetails?.Price * item.quantity);
//   }, 0);
const calculateTotalCost = (items) => {
    const total = items.reduce((sum, item) => sum + item.productDetails.Price * item.quantity, 0);
    setTotalCost(total);
  };

  const applyPromoCode = async () => {
    try {
        // Pobierz koszyk użytkownika
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnapshot = await getDoc(cartRef);
    
        if (cartSnapshot.exists()) {
          const cartData = cartSnapshot.data();
          console.log(cartData.promoCode);
    
          // Sprawdź, czy kod promocyjny już został użyty
          if (cartData.promoCode && cartData.promoCode!== '0000promocode0000') {
            // setError('Kod promocyjny został już zastosowany.');
            showToast("Kod promocyjny został już zastosowany");
            return;
          }
    
          // Sprawdź, czy kod promocyjny istnieje w kolekcji `promoCodes`
          const promoSnapshot = await getDoc(doc(db, 'promoCodes', promoCode));
          if (promoSnapshot.exists()) {
            // Zastosowanie zniżki
            setDiscount(0.1); // Zakładamy 10% rabatu
            setError(''); // Wyczyszczenie błędu
            const newTotalCost = totalCost * 0.9; // Obniżenie kosztu o 10%
            setTotalCost(newTotalCost);
    
            // Aktualizuj koszyk z użytym kodem promocyjnym
            await updateDoc(cartRef, {
              promoCode: promoCode,
            });
          } else {
            showToast('Niepoprawny kod promocyjny.');
          }
        } else {
          setError('Koszyk nie istnieje.');
        }
      } catch (error) {
        console.error('Błąd przy stosowaniu kodu promocyjnego:', error);
        showToast('Wystąpił błąd przy stosowaniu kodu promocyjnego.');
      }
    };

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
    <div className="main-cart">
        <form>
        {visibleCartItems.map((item, index) => (
            <div key={item.id || index} className="cart-item">
                <div className='product'>
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
                            onChange={(e) => updateProductQuantity(item.productID.id, e.target.value)}
                            />
                        </div>
                        <p><strong>Łączna kwota:</strong> {item.productDetails?.Price * item.quantity} PLN</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="remove-button"
                        onClick={() => removeProductFromCart(item.productID.id)}
                    > x </button>
                </div>

            <div className="related-products">
                <h4>Produkty powiązane:</h4>
                {item.relatedProducts?.map((relatedProduct) => (
                <div key={relatedProduct.id} className="related-product-item">
                    <img src={relatedProduct.ImgLink} alt={relatedProduct.Name} className="product-image small" />
                    {/* <p>{relatedProduct.Name} - {relatedProduct.Price} PLN</p> */}
                    <p>{relatedProduct.Name}</p>
                    <button className="cart-button" onClick={() => handleAddToCart(product.id)} >
                        <RiShoppingCartLine className="cart-icon small" />
                    </button>
                </div>
                ))}
            </div>
            </div>
        ))}
        </form>

        
        {/* <Link href="/checkout">
            <button type="button">Podsumowanie</button>
        </Link> */}

        <div className="cart-summary">
        <p><strong>Do zapłaty: </strong>{totalCost.toFixed(2)} PLN</p>

        <div className="promo-code-section">
          <p>Skorzystaj z kodu: </p> 
          <p><strong>KwvQqZltVDMkslYFrSj9</strong></p>
            <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Wpisz kod promocyjny"
            />
            <button onClick={applyPromoCode}>Zastosuj kod</button>

            {alertMessage && (
            <div className={`custom-alert ${hideAlert ? 'hide' : ''}`}>
                {alertMessage}
            </div>
            )}
        </div>
        </div>
    </div>
    <button type="button" onClick={clearCart}>Wyczyść koszyk</button>
    </div>
    );
}