"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProducts, type ProductData } from "@/utils/api";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Shield, Package, QrCode, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">
              Product Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and track your authenticated products
            </p>
          </div>
          <Button
            onClick={() => router.push("/register")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Register Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total QR Codes
              </CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.reduce(
                  (acc, product) => acc + product.qrCodeIds.length,
                  0
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Protected Products
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Recent Products</h2>
            <div className="grid gap-6">
              {products.map((product) => (
                <Card key={product.productId}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {product.productName}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          ID: {product.productId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created: {format(new Date(product.createdAt), "PPP")}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">QR Codes:</span>{" "}
                          {product.qrCodeIds.length}
                        </p>
                        <p className="text-sm break-all">
                          <span className="font-medium">IPFS:</span>{" "}
                          {product.ipfsHash}
                        </p>
                        <p className="text-sm break-all">
                          <span className="font-medium">Manufacturer:</span>{" "}
                          {product.manufacturerAddress}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4"
                          onClick={() =>
                            setSelectedQR(`/verify/${product.qrCodeIds[0]}`)
                          }
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          View QR Code
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="relative aspect-square w-64">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${window.location.origin}${selectedQR}`}
                alt="QR Code"
                className="w-full h-full"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code to verify the product authenticity
            </p>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedQR) {
                  window.open(selectedQR, "_blank");
                }
              }}
            >
              Test Verification
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
