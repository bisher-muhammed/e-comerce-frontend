"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getCart } from "@/app/services/customer/cart.service";
import { getWishlist } from "@/app/services/customer/wishlist.service";
import { optionalAuthRequest } from "@/app/lib/api/apiPrivate";
import {
  useCurrentUser,
  type CurrentUser,
} from "@/app/hooks/useCurrentUser";

interface StoreDataApi {
  user: CurrentUser | null;
  isLoadingUser: boolean;

  cartCount: number;
  wishlistCount: number;
  wishlistProductIds: ReadonlySet<number>;

  isWishlisted: (productId: number) => boolean;
  setWishlisted: (productId: number, wishlisted: boolean) => void;

  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const StoreDataContext = createContext<StoreDataApi | null>(null);

const EMPTY_PRODUCT_IDS: ReadonlySet<number> = new Set<number>();

const fetchCartCount = async (): Promise<number> => {
  const response = await getCart(optionalAuthRequest);

  return response.data.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
};

const fetchWishlistProductIds = async (): Promise<
  ReadonlySet<number>
> => {
  const response = await getWishlist(optionalAuthRequest);

  return new Set(
    response.data?.items.map((item) => item.productId) ?? []
  );
};

export function useStoreData(): StoreDataApi {
  const context = useContext(StoreDataContext);

  if (!context) {
    throw new Error(
      "useStoreData must be used inside <StoreDataProvider>."
    );
  }

  return context;
}

export function StoreDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading: isLoadingUser } = useCurrentUser();

  const [storedCartCount, setStoredCartCount] = useState(0);
  const [storedWishlistProductIds, setStoredWishlistProductIds] =
    useState<ReadonlySet<number>>(EMPTY_PRODUCT_IDS);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const cartCount = user ? storedCartCount : 0;

  const wishlistProductIds = user
    ? storedWishlistProductIds
    : EMPTY_PRODUCT_IDS;

  useEffect(() => {
    if (isLoadingUser || !user) return;

    let cancelled = false;

    (async () => {
      try {
        const count = await fetchCartCount();

        if (!cancelled) setStoredCartCount(count);
      } catch {
        if (!cancelled) setStoredCartCount(0);
      }
    })();

    (async () => {
      try {
        const productIds = await fetchWishlistProductIds();

        if (!cancelled) setStoredWishlistProductIds(productIds);
      } catch {
        if (!cancelled) {
          setStoredWishlistProductIds(EMPTY_PRODUCT_IDS);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoadingUser, user]);

  const refreshCart = useCallback(async () => {
    if (!user) return;

    try {
      const count = await fetchCartCount();

      if (mountedRef.current) setStoredCartCount(count);
    } catch {
      if (mountedRef.current) setStoredCartCount(0);
    }
  }, [user]);

  const refreshWishlist = useCallback(async () => {
    if (!user) return;

    try {
      const productIds = await fetchWishlistProductIds();

      if (mountedRef.current) {
        setStoredWishlistProductIds(productIds);
      }
    } catch {
      if (mountedRef.current) {
        setStoredWishlistProductIds(EMPTY_PRODUCT_IDS);
      }
    }
  }, [user]);

  const isWishlisted = useCallback(
    (productId: number) => wishlistProductIds.has(productId),
    [wishlistProductIds]
  );

  const setWishlisted = useCallback(
    (productId: number, wishlisted: boolean) => {
      setStoredWishlistProductIds((previous) => {
        if (previous.has(productId) === wishlisted) {
          return previous;
        }

        const next = new Set(previous);

        if (wishlisted) {
          next.add(productId);
        } else {
          next.delete(productId);
        }

        return next;
      });
    },
    []
  );

  const value = useMemo<StoreDataApi>(
    () => ({
      user,
      isLoadingUser,
      cartCount,
      wishlistCount: wishlistProductIds.size,
      wishlistProductIds,
      isWishlisted,
      setWishlisted,
      refreshCart,
      refreshWishlist,
    }),
    [
      user,
      isLoadingUser,
      cartCount,
      wishlistProductIds,
      isWishlisted,
      setWishlisted,
      refreshCart,
      refreshWishlist,
    ]
  );

  return (
    <StoreDataContext.Provider value={value}>
      {children}
    </StoreDataContext.Provider>
  );
}
