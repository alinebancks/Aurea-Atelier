import type { Category, Product } from '@/types/catalog';

const API_URL = 'http://localhost:8000/api';

export const listCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error('Falha ao buscar categorias');
  return response.json();
};

export const listProducts = async (categorySlug?: string): Promise<Product[]> => {
  const url = categorySlug 
    ? `${API_URL}/products?categorySlug=${categorySlug}`
    : `${API_URL}/products`;
    
  const response = await fetch(url);
  if (!response.ok) throw new Error('Falha ao buscar produtos');
  return response.json();
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const response = await fetch(`${API_URL}/products/${slug}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Falha ao buscar produto');
  }
  return response.json();
};