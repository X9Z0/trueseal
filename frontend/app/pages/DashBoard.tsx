import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import Image from "next/image"; // Import Next.js Image component

interface Product {
  productId: string;
  productName: string;
  ipfsHash?: string;
  qrCodeIds: string[];
  createdAt: number;
  transactionHash: string;
}

function ProductsDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response: AxiosResponse<Product[]> = await axios.get(
          "http://localhost:5000/api/products",
        );
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <h2>Your Products</h2>
      <div className="products-grid">
        {products.length === 0 ? (
          <p>No products registered yet.</p>
        ) : (
          products.map((product) => (
            <div key={product.productId} className="product-card">
              <h3>{product.productName}</h3>
              {product.ipfsHash && (
                <Image
                  src={`https://ipfs.io/ipfs/${product.ipfsHash}`}
                  alt={product.productName}
                  width={150} // Adjust width as needed
                  height={150} // Adjust height as needed
                  className="product-thumbnail"
                />
              )}
              <p>
                <strong>Product ID:</strong> {product.productId}
              </p>
              <p>
                <strong>QR Codes:</strong> {product.qrCodeIds.length}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(product.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Transaction:</strong>{" "}
                {product.transactionHash.substring(0, 10)}...
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductsDashboard;
