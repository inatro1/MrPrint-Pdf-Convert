import React, { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [file, setFile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [message, setMessage] = useState('')

  useEffect(()=>{ fetchJobs(); }, [token])

  async function fetchJobs(){
    if(!token) return
    try{
      const res = await fetch(API + '/api/jobs', { headers: { Authorization: 'Bearer ' + token }})
      if(!res.ok){ setMessage('Falha ao obter jobs'); return }
      const data = await res.json()
      setJobs(data)
    }catch(err){ console.error(err); setMessage('Erro ao obter jobs') }
  }

  async function upload(e){
    e.preventDefault()
    if(!file) return setMessage('Selecione um ficheiro PDF')
    const form = new FormData()
    form.append('file', file)
    try{
      const res = await fetch(API + '/api/jobs', { method:'POST', body: form, headers: { Authorization: 'Bearer ' + token }})
      if(!res.ok){ const err = await res.json().catch(()=>({})); setMessage(err.error || 'Erro no upload'); return }
      setMessage('Ficheiro enviado com sucesso')
      setFile(null)
      fetchJobs()
    }catch(err){ console.error(err); setMessage('Erro no upload') }
  }

  function download(job){
    fetch(API + '/api/jobs/' + job._id + '/download', { headers: { Authorization: 'Bearer ' + token }})
      .then(res => {
        if(!res.ok) throw new Error('Download falhou')
        return res.blob()
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = job.originalName.replace(/\.pdf$/i,'') + '.docx'
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      })
      .catch(err => { console.error(err); setMessage('Erro ao descarregar') })
  }

  async function doRegister(){
    const email = prompt('Email:'); const password = prompt('Password:'); if(!email||!password) return
    const res = await fetch(API + '/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })})
    const data = await res.json()
    if(data.token){ localStorage.setItem('token', data.token); setToken(data.token); setMessage('Registado'); fetchJobs() }
    else setMessage(data.error || 'Erro')
  }

  async function doLogin(){
    const email = prompt('Email:'); const password = prompt('Password:'); if(!email||!password) return
    const res = await fetch(API + '/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })})
    const data = await res.json()
    if(data.token){ localStorage.setItem('token', data.token); setToken(data.token); setMessage('Logado'); fetchJobs() }
    else setMessage(data.error || 'Erro')
  }

  return (
    <div style={{ padding:20, fontFamily:'Arial, sans-serif', maxWidth:900, margin:'0 auto' }}>
      <h1>TEO PRINT CONVERT</h1>
      {!token ? (
        <div>
          <button onClick={doRegister}>Registar</button>
          <button onClick={doLogin} style={{ marginLeft:8 }}>Login</button>
        </div>
      ) : (
        <div>
          <div style={{ marginTop:10 }}>
            <form onSubmit={upload}>
              <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
              <button type="submit" style={{ marginLeft:8 }}>Enviar PDF</button>
            </form>
            <button onClick={()=>{ localStorage.removeItem('token'); setToken(null); setJobs([]); }} style={{ marginLeft:8 }}>Logout</button>
          </div>

          <div style={{ marginTop:20 }}>
            <h3>Jobs</h3>
            <button onClick={fetchJobs}>Atualizar</button>
            <ul>
              {jobs.map(j => (
                <li key={j._id} style={{ marginTop:8 }}>
                  <strong>{j.originalName}</strong> — {j.status} — {j.progress}%
                  {j.status === 'done' && <button onClick={()=>download(j)} style={{ marginLeft:8 }}>Download</button>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div style={{ marginTop:10, color:'green' }}>{message}</div>
      <footer style={{ marginTop:24, fontSize:12, color:'#666' }}>
        <div>Frontend: Vite + React. Configure VITE_API_URL no Netlify para apontar ao backend.</div>
      </footer>
    </div>
  )
}
