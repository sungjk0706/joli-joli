import { useState, useEffect, useRef } from 'react';
import { productService } from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const productsRef = useRef([]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching products...');
      const data = await productService.getAll();
      console.log('Fetched products:', data);
      setProducts(data || []);
      productsRef.current = data || [];
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const subscription = productService.subscribeToChanges(() => {
      fetchProducts();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { products, loading, error, refetch: fetchProducts, productsRef };
};
