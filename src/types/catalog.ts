export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type Product = {
  id: string;
  category_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  stock: number;
  image_url: string | null;
  images: string[];
  active: boolean;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
  stock: number;
};