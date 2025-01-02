"use client";
import Image from "next/image";
import { useAuth } from "@/app/_lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/_lib/firebase";
import "./products.css";

// const products = [
//   { id: 1, name: "Product 1", price: "$10", image: "/images/product1.jpg" },
//   { id: 2, name: "Product 2", price: "$20", image: "/images/product2.jpg" },
//   { id: 3, name: "Product 3", price: "$30", image: "/images/product3.jpg" },
// ];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // const { user } = useAuth();

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Available Products</h2>
      <div className="grid">
        {products.map((product) => (
          <div key={product.productId} className="card">
            <img src={product.ImgLink} alt={product.Name} className="image" />
            <h3>{product.Name}</h3>
            <p>
              <strong>${product.Price}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
