import { GoogleGenerativeAI } from "@google/generative-ai";
import config from '../config/index.js';
import { extractJiraDescription } from "../utils/descriptionExtractor.js"; // Importa la función centralizada
import { parseGherkinScenarios } from "../utils/aiResponseParser.js";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const getGeminiPrompt = (storiesText) => `
Eres un Ingeniero de QA certificado ISTQB. Analiza las siguientes Historias de Usuario (HU) y genera casos de prueba exhaustivos en formato Gherkin.

Para cada HU, aplica estas técnicas de caja negra:
1. Partición de Equivalencia y Análisis de Valores Límite: identifica campos de entrada, rangos válidos/invalidos y valores límite. Genera escenarios para cada caso.
2. Tabla de Decisión: si hay reglas de negocio con múltiples condiciones, crea una tabla de decisión y deriva los casos de prueba.
3. Pruebas de Transición de Estado: si la HU describe cambios de estado, crea escenarios para todas las transiciones válidas e inválidas.

Estructura la respuesta así:
- Para cada HU, crea una sección "Feature".
- Dentro de cada "Feature", genera varios "Scenario" o "Scenario Outline" que cubran flujos normales, alternativos (errores de usuario, validaciones) y casos excepcionales (fallos del sistema, timeouts).
- Enumera cada "Scenario" (por ejemplo: Scenario 1, Scenario 2, ...).
- Al inicio de cada "Scenario", menciona la técnica ISTQB utilizada.
- Usa lenguaje claro y preciso en los pasos Given, When, Then.

Aquí están las Historias de Usuario a analizar:
---
${storiesText}
---
`;

export async function generateCasesWithGemini(stories) {
  const generationPromises = stories.map(async (story) => {
    const descText = extractJiraDescription(story.fields.description) || 'Sin descripción';
    const singleStoryText = `HU ID: ${story.key}\nResumen: ${story.fields.summary}\nDescripción: ${descText}`;
    const prompt = getGeminiPrompt(singleStoryText);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const testCases = parseGherkinScenarios(text);

      return {
        storyKey: story.key,
        storySummary: story.fields.summary,
        testCases,
      };
    } catch (error) {
      console.error(`Error generando casos con Gemini para la historia ${story.key}:`, error);
      return {
        storyKey: story.key,
        storySummary: story.fields.summary,
        testCases: [`Error al generar casos con Gemini: ${error.message}`],
      };
    }
  });
  return Promise.all(generationPromises);
}