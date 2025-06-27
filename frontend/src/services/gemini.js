export async function generateCasesWithGemini(stories) {
  // Aquí deberías llamar a tu backend, que a su vez llama a Gemini.
  // Ejemplo de llamada al backend:
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stories }),
  });
  if (!response.ok) throw new Error('Error generando casos con Gemini');
  return await response.json();
}