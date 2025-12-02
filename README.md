# TEO PRINT CONVERT — Frontend (Vite + React)

### Instruções rápidas

1. Instalar dependências:
   npm install

2. Definir variável de ambiente (local):
   - Crie um ficheiro `.env` na raiz com:
     VITE_API_URL=http://localhost:4000
   - No Netlify, crie a variável `VITE_API_URL` apontando para o backend (ex: https://seu-backend.onrender.com)

3. Rodar em desenvolvimento:
   npm run dev

4. Build para produção:
   npm run build

5. Testar preview:
   npm run preview

Observações:
- O build do Vite gera a pasta `dist` por padrão.
- Em Netlify use Base directory = pasta do frontend e Publish directory = dist.
