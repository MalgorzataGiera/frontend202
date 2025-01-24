"use client";
import Image from "next/image";
import { useAuth } from "@/app/_lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/_lib/firebase";
import { RiShoppingCartLine } from "react-icons/ri";
import "./products.css";
import "../globals.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [alertMessage, setAlertMessage] = useState(null);
  const [hideAlert, setHideAlert] = useState(false);

  // console.log(user.uid);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const showToast = (message) => {
    setAlertMessage(message);
    setHideAlert(false);
    setTimeout(() => setAlertMessage(null), 3000); // Remove alert after 3 seconds
  };

  const handleAddToCart = async (productID) => {
    if (!user) {
      showToast("You must be logged in to add items to the cart. ");
      return;
    }

    try {
      const cartRef = doc(db, "carts", user.uid);
      const userRef = doc(db, "users", user.uid);
      const productRef = doc(db, "products", productID);

      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        console.log('cartsnap exist');
        // Jeśli koszyk juz istnieje, zaktualizuj
      const cartData = cartSnap.data();
      const productIDList = Array.isArray(cartData.productIDList) ? cartData.productIDList : [];

      const existingProduct = productIDList.find(
        (item) => item.productID.id === productRef.id
      );

      if (existingProduct) {
        const updatedProducts = productIDList.map((item) => {
          if (item.productID.id === productRef.id) {
            return {
              ...item,
              quantity: item.quantity + 1,
            };
          }
          return item;
        });

        // Zaktualizuj koszyk w bazie danych
        await setDoc(cartRef, { productIDList: updatedProducts }, { merge: true });
      } else {
        // Jeśli produkt nie istnieje w koszyku
        const updatedProducts = [
          ...productIDList,
          {
            productID: productRef,
            quantity: 1,
          },
        ];

        await setDoc(cartRef, { productIDList: updatedProducts }, { merge: true });
      }
    } else {
      // Jeśli koszyk nie istnieje, stworzy nowy
      await setDoc(cartRef, {
        productIDList: [
          {
            productID: productRef,
            quantity: 1,
          },
        ],
        userID: userRef,
      });
    }
    showToast("Product has been added to your cart!");
    } catch (error) {
      console.error("Error adding to cart: ", error);
      showToast("Failed to add product to cart.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Available Products</h2>
      <div className="grid">
        {products.map((product) => (
          <div key={product.id} className="card">
            <img src={product.ImgLink} alt={product.Name} className="image" />
            <h3>{product.Name}</h3>
            <div className="card-description">
              <p>
                <strong>${product.Price}</strong>
              </p>
              <button className="cart-button" onClick={() => handleAddToCart(product.id)}>
                <RiShoppingCartLine className="cart-icon" />
              </button>
            </div>             
          </div>
        ))}
      </div>
      {alertMessage && (
        <div className={`custom-alert ${hideAlert ? 'hide' : ''}`}>
          {alertMessage}
        </div>
      )}
    </div>
  );
}
