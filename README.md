# ✦ Sparky Notes

App desktop de captura rápida e processamento de ideias com IA local.

## Stack

- **Frontend:** Svelte 4 + Vite
- **Desktop:** Tauri 2
- **IA local:** Ollama (Llama 3.1 8B)
- **Tipografia:** Satoshi (display) + Plus Jakarta Sans (UI) + JetBrains Mono (código)
- **Estética:** Noir glassmorphism, paleta roxa/rosa

## Setup

```bash
# instalar dependências
yarn install

# rodar em dev (browser)
yarn dev

# com tauri (desktop)
yarn tauri dev

# build (.exe)
yarn tauri build
```

## Ollama

```bash
ollama pull llama3.1:8b
# deixar rodando em segundo plano
```

Se o Ollama não estiver ativo, o app salva a ideia crua sem processamento.

## Atalho global

`Ctrl + Shift + S` — abre a janela (modo Tauri)
