import { useState } from "react"
import loginHeader from '@/assets/login-header.jpg';
import styles from './login.module.css';

type LoginProps = {
  onLogin: (params: { email: string; password: string }) => Promise<void>
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !password) return

    setLoading(true)
    try {
      await onLogin({ email, password })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <img src={loginHeader} alt="Trading Card Game Logo" />
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Login</h2>

        <div className={styles.input}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        </div>

 <div className={styles.input}>
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        </div>
      </form>
      </div>
    </div>
  )
}
