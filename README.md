# TEO PRINT CONVERT

Projeto completo: frontend React + backend Node/Express + worker Bull + MongoDB + Redis.
Converte PDFs para DOCX usando CloudConvert API.

## Passos rápidos (local usando Docker)

1. Copie `backend/.env.example` para `backend/.env` e preencha `CLOUDCONVERT_API_KEY` e `JWT_SECRET`.
2. Execute:
   ```bash
   docker-compose up --build
   ```
3. Abra o frontend (usar `npm` dev server) ou sirva a pasta `frontend` com Vite:
   - Entre em `frontend`, instale: `npm install`
   - Rode: `npm run dev`
   - Aplique `VITE_API_URL` se necessário para apontar para `http://localhost:4000`

## Notas
- Em produção proteja a API com HTTPS e armazene segredos num secrets manager.
- CloudConvert é um serviço pago — ver quotas e limites.
