const OLLAMA_URL = "http://localhost:11434";

function buildSystemPrompt(userContext = "") {
  const contextBlock = userContext
    ? `\nContexto do usuário: ${userContext}\nUse essa informação para dar sugestões mais relevantes.\n`
    : "";

  return `Você é a Sparky, uma assistente de organização de ideias para projetos de desenvolvimento.
${contextBlock}
Quando receber um texto bruto com uma ideia de projeto, você deve:

1. Extrair um título curto e descritivo (máx 5 palavras)
2. Criar um resumo conciso da ideia (2-3 frases)
3. Sugerir tags relevantes (máx 5, cada tag deve ser UMA palavra ou termo curto)
4. Sugerir tecnologias/stack apropriadas (máx 5, cada item deve ser UMA tecnologia específica, ex: "React", "Node.js", "PostgreSQL" — nunca combine múltiplas em um item)
5. Fazer 2-3 perguntas para refinar a ideia

Responda APENAS em JSON válido, sem markdown, sem backticks, neste formato:
{
  "title": "string",
  "summary": "string",
  "tags": ["string"],
  "suggestedStack": ["string"],
  "questions": ["string"]
}`;
}

const REFINE_SYSTEM = `Você é a Sparky, uma assistente de organização de ideias para projetos de desenvolvimento.
Você está refinando uma ideia existente com base em novas informações do usuário.
Atualize o briefing do projeto mantendo o que já era bom e incorporando as novas informações.

Responda APENAS em JSON válido, sem markdown, sem backticks, neste formato:
{
  "title": "string",
  "summary": "string",
  "tags": ["string"],
  "suggestedStack": ["string"],
  "questions": ["string"]
}

Regras para tags e stack:
- Cada tag deve ser UMA palavra ou termo curto
- Cada item de stack deve ser UMA tecnologia específica (ex: "React", "Node.js", nunca combine várias)
- Gere novas perguntas relevantes considerando o que já foi respondido`;

export async function checkOllamaStatus() {
  try {
    const res = await fetch(OLLAMA_URL);
    return res.ok;
  } catch {
    return false;
  }
}

export async function listModels() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await res.json();
    return data.models || [];
  } catch {
    return [];
  }
}

function sanitizeStack(items) {
  if (!Array.isArray(items)) return [];
  const result = [];
  for (const item of items) {
    if (item.includes(";") || item.includes(",") || item.includes(":")) {
      const parts = item.split(/[;,]/).map((p) => p.replace(/^.*?:\s*/, "").trim()).filter(Boolean);
      for (const part of parts) {
        const subs = part.split(/\s+ou\s+|\s+or\s+|\s+e\s+/i).map((s) => s.trim()).filter(Boolean);
        result.push(...subs);
      }
    } else {
      result.push(item.trim());
    }
  }
  return [...new Set(result)].filter(Boolean);
}

export async function processIdea(rawText, model = "llama3.1:8b", userContext = "") {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `Processe esta ideia de projeto:\n\n"${rawText}"`,
      system: buildSystemPrompt(userContext),
      stream: false,
      options: { temperature: 0.7, num_predict: 512 },
    }),
  });

  if (!res.ok) throw new Error(`Ollama retornou ${res.status}`);

  const data = await res.json();

  try {
    const cleaned = data.response.replace(/```json\n?|```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    parsed.suggestedStack = sanitizeStack(parsed.suggestedStack);
    return parsed;
  } catch {
    return {
      title: "Ideia sem título",
      summary: data.response.slice(0, 200),
      tags: [],
      suggestedStack: [],
      questions: [],
    };
  }
}

export async function refineIdea(idea, answer, model = "llama3.1:8b") {
  const context = `Ideia original: "${idea.rawText}"
Título atual: "${idea.title}"
Resumo atual: "${idea.summary}"
Tags atuais: ${(idea.tags || []).join(", ")}
Stack atual: ${(idea.suggestedStack || []).join(", ")}
Perguntas anteriores: ${(idea.questions || []).join("; ")}

Nova informação do usuário: "${answer}"`;

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `Com base nesta nova informação, atualize o briefing do projeto:\n\n${context}`,
      system: REFINE_SYSTEM,
      stream: false,
      options: { temperature: 0.7, num_predict: 512 },
    }),
  });

  if (!res.ok) throw new Error(`Ollama retornou ${res.status}`);

  const data = await res.json();

  try {
    const cleaned = data.response.replace(/```json\n?|```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    parsed.suggestedStack = sanitizeStack(parsed.suggestedStack);
    return parsed;
  } catch {
    return null;
  }
}