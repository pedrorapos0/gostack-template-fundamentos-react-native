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

  console.log(products);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStoraged = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (productsStoraged) {
        setProducts(JSON.parse(productsStoraged));
      }
      // TODO LOAD ITEMS FROM ASYNC STORAGE
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productsInCart = [...products];
      const productIsAdded = productsInCart.find(
        item => item.id === product.id,
      );
      if (productIsAdded) {
        productIsAdded.quantity += 1;
        setProducts(productsInCart);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      } else {
        product.quantity = 1;
        setProducts([...products, product]);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
      // TODO ADD A NEW ITEM TO THE CART
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsInCart = [...products];
      const inclementProductSelected = productsInCart.find(
        item => item.id === id,
      );
      if (inclementProductSelected) {
        inclementProductSelected.quantity += 1;
        setProducts(productsInCart);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsInCart = [...products];
      const declementProductSelected = productsInCart.find(
        item => item.id === id,
      );
      if (declementProductSelected && declementProductSelected.quantity > 1) {
        declementProductSelected.quantity -= 1;
        setProducts(productsInCart);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      } else {
        const IndexProductToRemoving = productsInCart.findIndex(
          item => item.id === declementProductSelected?.id,
        );
        productsInCart.splice(IndexProductToRemoving, 1);
        setProducts(productsInCart);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
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
