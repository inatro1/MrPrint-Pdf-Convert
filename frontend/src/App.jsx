import React, { useState, useEffect } from 'react';

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [file, setFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  async function fetchJobs(){
    if(!token) return;
    try{
      const res = await fetch(apiUrl + '/api/jobs', { headers: { Authorization: 'Bearer ' + token }});
      const data = await res.json();
      setJobs(data);
    }catch(err){ console.error(err); }
  }

  useEffect(()=>{ fetchJobs(); }, [token]);

  async function upload(e){
    e.preventDefault();
    if(!file) return setMessage('Selecione um ficheiro');
    const form = new FormData();
    form.append('file', file);
    try{
      const res = await fetch(apiUrl + '/api/jobs', { method:'POST', body: form, headers: { Authorization: 'Bearer ' + token }});
      if(!res.ok) { const err = await res.json().catch(()=>({})); setMessage(err.error || 'Erro'); return; }
      setMessage('Ficheiro enviado. Atualize a lista para ver progresso.');
      fetchJobs();
    }catch(err){ console.error(err); setMessage('Erro no upload'); }
  }

  function download(job){
    window.location = apiUrl + '/api/jobs/' + job._id + '/download?token=' + token;
  }

  async function doRegister(){
    const email = prompt('Email:'); const password = prompt('Password:'); if(!email || !password) return;
    const res = await fetch(apiUrl + '/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })});
    const data = await res.json();
    if(data.token){ localStorage.setItem('token', data.token); setToken(data.token); setMessage('Registado e logado'); }
    else setMessage(data.error || 'Erro');
  }

  async function doLogin(){
    const email = prompt('Email:'); const password = prompt('Password:'); if(!email || !password) return;
    const res = await fetch(apiUrl + '/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })});
    const data = await res.json();
    if(data.token){ localStorage.setItem('token', data.token); setToken(data.token); setMessage('Logado'); fetchJobs(); }
    else setMessage(data.error || 'Erro');
  }

  return (
    <div style={{ padding:20, fontFamily:'Arial, sans-serif' }}>
      <h1>TEO PRINT CONVERT</h1>
      {!token ? (
        <div>
          <button onClick={doRegister}>Registar</button>
          <button onClick={doLogin}>Login</button>
        </div>
      ) : (
        <div>
          <div style={{ marginTop:10 }}>
            <form onSubmit={upload}>
              <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
              <button type="submit">Enviar PDF</button>
            </form>
            <button onClick={()=>{ localStorage.removeItem('token'); setToken(null); setJobs([]); }}>Logout</button>
          </div>

          <div style={{ marginTop:20 }}>
            <h3>Jobs</h3>
            <button onClick={fetchJobs}>Atualizar</button>
            <ul>
              {jobs.map(j => (
                <li key={j._id}>
                  {j.originalName} — {j.status} — {j.progress}%
                  {j.status === 'done' && <button onClick={()=>download(j)}>Download</button>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div style={{ marginTop:10, color:'green' }}>{message}</div>
    </div>
  );
}
