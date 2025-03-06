import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios, { AxiosResponse } from "axios";
import Image from "next/image"; // Import Next.js Image component

interface Verification {
  isAuthentic: boolean;
  productName: string;
  imageUrl?: string;
  productId: string;
  manufacturerAddress: string;
  creationTime: number;
  metadata?: { [key: string]: string };
}

function ProductVerification() {
  const router = useRouter();
  const { qrCodeId } = router.query;
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyProduct = async () => {
      if (!qrCodeId) return; // Ensure qrCodeId is defined

      try {
        const response: AxiosResponse<Verification> = await axios.get(
          `http://localhost:5000/api/verify/${qrCodeId}`,
        );
        setVerification(response.data);
        setLoading(false);
      } catch (err) {
        setError(
          "Unable to verify product. It may be counterfeit or the QR code is invalid.",
        );
        setLoading(false);
      }
    };

    if (qrCodeId) {
      verifyProduct();
    }
  }, [qrCodeId]);

  if (loading) return <div>Verifying product...</div>;
  if (error) return <div className="error">{error}</div>;

  if (!verification) return null; // Handle case where verification is null

  return (
    <div className="verification-container">
      <h2>Product Verification</h2>

      {verification.isAuthentic ? (
        <div className="authentic">
          <div className="verification-badge">Authentic Product ✓</div>
          <h3>{verification.productName}</h3>

          {verification.imageUrl && (
            <Image
              src={verification.imageUrl}
              alt={verification.productName}
              width={300} // Adjust as needed
              height={300} // Adjust as needed
              className="product-image"
            />
          )}

          <div className="product-details">
            <p>
              <strong>Product ID:</strong> {verification.productId}
            </p>
            <p>
              <strong>Manufacturer:</strong> {verification.manufacturerAddress}
            </p>
            <p>
              <strong>Registered on:</strong>{" "}
              {new Date(verification.creationTime).toLocaleString()}
            </p>

            {verification.metadata &&
              Object.keys(verification.metadata).length > 0 && (
                <div className="metadata">
                  <h4>Product Specifications:</h4>
                  <ul>
                    {Object.entries(verification.metadata).map(
                      ([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {value}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
          </div>
        </div>
      ) : (
        <div className="counterfeit">
          <div className="verification-badge">Counterfeit Product ✗</div>
          <p>This product could not be verified as authentic.</p>
        </div>
      )}
    </div>
  );
}

export default ProductVerification;
