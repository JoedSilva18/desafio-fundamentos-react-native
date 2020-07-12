import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem('@goMarket:products');
      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // AsyncStorage.getAllKeys().then(AsyncStorage.multiRemove);
      const productExists = products.find(
        (item: Product) => item.id === product.id,
      );

      if (!productExists) {
        product.quantity = 1;
        setProducts([...products, product]);
        await AsyncStorage.setItem(
          '@goMarket:products',
          JSON.stringify(products),
        );
      } else {
        increment(productExists.id);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProduct = products.map(product => {
        if (product.id === id) {
          const quantidade = product.quantity + 1;
          const newProduct = {
            ...product,
            quantity: quantidade,
          };

          return newProduct;
        }
        return product;
      });
      setProducts(newProduct);
      await AsyncStorage.setItem(
        '@goMarket:products',
        JSON.stringify(newProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProduct = products.map(product => {
        if (product.id === id) {
          const quantidade = product.quantity - 1;
          const newProduct = {
            ...product,
            quantity: quantidade,
          };

          return newProduct;
        }
        return product;
      });
      setProducts(newProduct);
      await AsyncStorage.setItem(
        '@goMarket:products',
        JSON.stringify(newProduct),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
