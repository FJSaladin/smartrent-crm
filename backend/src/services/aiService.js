async function analyzeTicketWithAI(description) {
  const prompt = `
Eres un asistente de mantenimiento para un sistema inmobiliario llamado SmartRent CRM.

Analiza la descripción del problema y responde SOLO en JSON válido con esta estructura:
{
  "title": "string",
  "category": "plumbing | electrical | hvac | structural | general",
  "priority": "low | medium | high",
  "suggestion": "string"
}

Reglas:
- "title" debe ser un resumen corto y claro del problema.
- "category" debe ser una sola de las categorías indicadas.
- "priority" debe ser decidida por ti según la gravedad aparente del problema.
- "suggestion" debe ser una recomendación breve y útil para uso interno del landlord.
`;

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      stream: false,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: description },
      ],
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();

  const content = data?.message?.content || "{}";
  let parsed = {};

  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {};
  }

  return {
    title: parsed.title || "Ticket de mantenimiento",
    category: parsed.category || "general",
    priority: parsed.priority || "medium",
    suggestion: parsed.suggestion || "",
  };
}

module.exports = { analyzeTicketWithAI };