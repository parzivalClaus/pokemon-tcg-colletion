import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Login from "@/pages/Login";
import List from "@/pages/List";
import FullScreenLoader from "@/components/FullScreenLoader";

import type { User } from "@supabase/supabase-js";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [ownedIds, setOwnedIds] = useState<number[]>([]);
  const MIN_LOADING_TIME = 1000;

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    const start = Date.now();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);

        if (!session) {
          setOwnedIds([]);
        }

        const elapsed = Date.now() - start;
        const remaining = Math.max(MIN_LOADING_TIME - elapsed, 0);

        setTimeout(() => {
          setAuthLoading(false);
        }, remaining);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (authLoading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Login onLogin={login} />;
  }

  return <List ownedIds={ownedIds} setOwnedIds={setOwnedIds} user={user} />;
}

export default App;
