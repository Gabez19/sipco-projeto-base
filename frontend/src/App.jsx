// Em um app real, isso seria dividido em vários arquivos
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient' // Nosso cliente Supabase

// --- Componente de Login (HU02) ---
// Este é o método base que o time usará
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      if (error) throw error
      console.log('Login com sucesso!', data)
      // O App.jsx vai detectar a mudança e mostrar o Dashboard
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>S.I.P.C.O. - Login (HU02)</h2>
      <p>Para testar, crie um usuário na aba "Authentication" do Supabase.</p>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        /><br/>
        <input 
          type="password" 
          placeholder="Senha" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        /><br/><br/>
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

// --- Componente do Dashboard (HU03) ---
// Este é o método base que o time usará
function Dashboard({ session }) {
  const [racks, setRacks] = useState([]) // Onde vamos guardar os racks
  const [loadingRacks, setLoadingRacks] = useState(true)

  useEffect(() => {
    // Busca dados do nosso backend FastAPI
    const apiUrl = import.meta.env.VITE_API_BASE_URL + "/racks"
    
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        setRacks(data.racks || [])
        setLoadingRacks(false)
      })
      .catch(err => {
        console.error("Erro ao buscar racks:", err)
        setLoadingRacks(false)
      })
  }, []) // O [] vazio significa que isso roda só 1 vez, quando o componente carrega

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard (HU03)</h2>
      <p>Bem-vindo, {session.user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Sair</button>
      
      <hr/>

      <h3>Racks (Buscados do FastAPI):</h3>
      {loadingRacks ? <p>Carregando racks...</p> : (
        <pre style={{ background: '#eee', padding: '10px' }}>
          {JSON.stringify(racks, null, 2)}
        </pre>
      )}
    </div>
  )
}


// --- Componente principal que controla tudo ---
export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 1. Verifica se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Escuta por mudanças na autenticação (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // Se não tem sessão, mostra Login. Se tem, mostra o Dashboard.
  return (
    <div>
      {!session ? <Login /> : <Dashboard session={session} />}
    </div>
  )
}