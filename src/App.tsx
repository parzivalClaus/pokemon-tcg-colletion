import { useEffect, useState } from "react"
import { supabase } from '@/lib/supabase'
import Login from "@/pages/Login"
import List from "@/pages/List"

import type { User } from '@supabase/supabase-js'

function App() {
const [user, setUser] = useState<User | null>(null)
const [ownedIds, setOwnedIds] = useState<number[]>([])
  
const login = async ({ email, password }: { email: string, password: string}) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    alert(error.message)
  }
}

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)

        if (!session) {
          setOwnedIds([])
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!user) {
      return <Login onLogin={login} />
  }

  return <List ownedIds={ownedIds} setOwnedIds={setOwnedIds} user={user} />
}

export default App