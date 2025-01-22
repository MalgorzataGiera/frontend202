"use client";
import Link from "next/link";

export default function Home() {
 
  return (
    <div className="container">
      <h2>Welcome</h2>
      <p>Check out our available products:</p>
      <Link href="/products">
        <button className="products-button">View Products</button>
      </Link>
    </div>
  );
}
