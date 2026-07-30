const OLLAMA_URL = "http://localhost:11434";

const SYSTEM_PROMPT = `Você é a Sparky, uma assistente de organização de ideias para projetos de desenvolvimento.
Quando receber um texto bruto com uma ideia de projeto, você deve:

1. Extrair um título curto e descritivo (máx 5 palavras)
2. Criar um resumo conciso da ideia (2-3 frases)
3. Sugerir tags relevantes (máx 5)
4. Sugerir tecnologias/stack apropriadas (máx 5)
5. Fazer 2-3 perguntas para refinar a ideia

Responda APENAS em JSON válido, sem markdown, sem backticks, neste formato:
{
  "title": "string",
  "summary": "string",
  "tags": ["string"],
  "suggestedStack": ["string"],
  "questions": ["string"]
}`;

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

export async function processIdea(rawText, model = "llama3.1:8b") {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `Processe esta ideia de projeto:\n\n"${rawText}"`,
      system: SYSTEM_PROMPT,
      stream: false,
      options: { temperature: 0.7, num_predict: 512 },
    }),
  });

  if (!res.ok) throw new Error(`Ollama retornou ${res.status}`);

  const data = await res.json();

  try {
    const cleaned = data.response.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(cleaned);
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
Resumo: "${idea.summary}"
Pergunta respondida: "${answer.question}"
Resposta: "${answer.text}"`;

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `Com base nesta nova informação, atualize o briefing do projeto:\n\n${context}`,
      system: SYSTEM_PROMPT,
      stream: false,
      options: { temperature: 0.7, num_predict: 512 },
    }),
  });

  if (!res.ok) throw new Error(`Ollama retornou ${res.status}`);

  const data = await res.json();

  try {
    const cleaned = data.response.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
