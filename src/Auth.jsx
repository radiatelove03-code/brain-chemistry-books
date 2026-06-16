import { useState } from "react"
import { supabase } from "./lib/supabase"

function Auth({ user, onAuthChange }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setMessage(error ? error.message : "Account created! Log in to Continue!")
    onAuthChange()
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setMessage(error ? error.message : "Logged in!")
    onAuthChange()
  }

  async function signOut() {
    await supabase.auth.signOut()
    setMessage("Logged out.")
    onAuthChange()
  }

  if (user) {
    return (
      <div className="score-card">
        <p>Logged in as:</p>
        <strong>{user.email}</strong>
        <br />
        <button onClick={signOut}>Log Out</button>
      </div>
    )
  }

  return (
    <div className="score-card">
      <h2>Account</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={signUp}>Create Account</button>
      <button onClick={signIn}>Log In</button>

      {message && <p>{message}</p>}
    </div>
  )
}

export default Auth