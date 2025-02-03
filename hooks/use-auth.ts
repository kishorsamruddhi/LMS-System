import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/auth-store';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);

      if (requireAuth && !user) {
        router.push('/auth');
      }
    });

    return () => unsubscribe();
  }, [requireAuth, router, setUser, setLoading]);

  return { user, isLoading };
}