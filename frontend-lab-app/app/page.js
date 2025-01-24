"use client";
import Link from "next/link";

export default function Home() {
 
  return (
    <div className="container">
      <h2>Sklep ogrodniczy online</h2>
      <p>Sprawdź nasze dostępne produkty</p>
      <Link href="/products">
        <button className="products-button">Zobacz produkty</button>
      </Link>
    </div>
  );
}
