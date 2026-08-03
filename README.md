# ✦ Sparky Notes

App desktop de captura rápida e processamento de ideias com IA local.

## Stack

- **Frontend:** Svelte 4 + Vite
- **Desktop:** Tauri 2
- **IA local:** Ollama (Llama 3.1 8B)
- **Backend:** Supabase (auth + PostgreSQL)
- **Tipografia:** Satoshi + Plus Jakarta Sans + JetBrains Mono

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e cole o conteúdo de `supabase-migration.sql`
3. Execute
4. Vá em **Settings → API** e copie a **URL** e a **anon key**
5. Crie um arquivo `.env` na raiz:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### 2. App

```bash
yarn install
yarn dev
```

### 3. Ollama (opcional)

```bash
ollama pull llama3.1:8b
```

Se não tiver Ollama rodando, o app salva as ideias sem processamento de IA.

### 4. Tauri (desktop)

```bash
yarn tauri dev    # dev
yarn tauri build  # .exe
```

## Fluxo

Splash → Login (email/senha ou magic link) → Home (captura estilo chat) → Biblioteca (cards/lista)

## Atalho

`Ctrl + Shift + S` — abre a janela (modo Tauri)
