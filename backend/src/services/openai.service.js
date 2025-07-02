import axios from 'axios';
import config from '../config/index.js';
import { extractJiraDescription } from '../utils/descriptionExtractor.js'; // Importa la función centralizada
import { parseGherkinScenarios } from '../utils/aiResponseParser.js';

/**
 * Generates a detailed prompt for an AI to create exhaustive Gherkin test cases
 * from provided user stories, applying black-box testing techniques such as
 * Equivalence Partitioning, Boundary Value Analysis, Decision Tables, and State Transition Testing.
 *
 * The prompt instructs the AI to:
 * - Analyze each user story (HU) as a certified QA engineer.
 * - Identify input fields, valid/invalid ranges, and boundary values.
 * - Create decision tables for business rules with multiple conditions.
 * - Generate scenarios for all valid and invalid state transitions.
 * - Structure the output using Gherkin syntax with "Feature" and "Scenario"/"Scenario Outline" sections,
 *   covering normal, alternative, and exceptional flows.
 *
 * @param {string} storiesText - The user stories to be analyzed and converted into Gherkin test cases.
 * @returns {string} A formatted prompt instructing the AI to generate Gherkin scenarios for the given user stories.
 */
const getGherkinPrompt = (storiesText) => {
  return `
    Como un Ingeniero de QA experto y certificado en ISTQB, tu tarea es analizar las siguientes Historias de Usuario (HU) y generar casos de prueba exhaustivos en formato Gherkin.

    Para cada HU, aplica rigurosamente las siguientes técnicas de caja negra:
    1.  **Partición de Equivalencia y Análisis de Valores Límite:** Identifica todos los campos de entrada, sus rangos válidos, inválidos y los valores en los límites. Genera escenarios para cada caso.
    2.  **Tabla de Decisión:** Si la HU contiene reglas de negocio con múltiples condiciones, crea una tabla de decisión y deriva los casos de prueba a partir de ella.
    3.  **Pruebas de Transición de Estado:** Si la HU describe cómo un objeto cambia de estado (ej. un pedido de 'pendiente' a 'aprobado'), crea escenarios que prueben todas las transiciones válidas e inválidas.

    Estructura la respuesta de la siguiente manera:
    - Para cada HU, crea una sección "Feature".
    - Dentro de cada "Feature", genera múltiples "Scenario" o "Scenario Outline" que cubran flujos normales, flujos alternativos (errores de usuario, validaciones de campo) y casos excepcionales (fallos del sistema, timeouts).
    - Enumera cada "Scenario" generado (por ejemplo: Scenario 1, Scenario 2, ...).
    - Al inicio de cada "Scenario", menciona la técnica de prueba ISTQB utilizada.
    - Utiliza un lenguaje claro y preciso en los pasos Given, When, Then.

    Aquí están las Historias de Usuario a analizar:








    
    ---
    ${storiesText}
    ---
  `;
};

export const generateContent = async (stories) => {
  const generationPromises = stories.map(async (story) => {
    const descText = extractJiraDescription(story.fields.description);
    const singleStoryText = `HU ID: ${story.key}\nTítulo: ${story.fields.summary}\nDescripción: ${descText || 'Sin descripción'}`;
    const prompt = getGherkinPrompt(singleStoryText);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          // El modelo 'gpt-4.1-mini' no existe. Usamos un modelo válido y eficiente.
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Eres un asistente experto en QA y análisis de software.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.openaiApiKey}`,
          },
        }
      );

      const aiText = response.data.choices[0].message.content;
      console.log(`Texto generado por OpenAI para ${story.key}:`, aiText);
      const testCases = parseGherkinScenarios(aiText);
      return {
        storyKey: story.key,
        storySummary: story.fields.summary,
        testCases,
      };
    } catch (error) {
      console.error(`Error generando casos para la historia ${story.key}:`, error);
      return {
        storyKey: story.key,
        storySummary: story.fields.summary,
        testCases: [`Error al generar casos: ${error.message}`],
      };
    }
  });
  return Promise.all(generationPromises);
};

export async function generatePlanDePruebas(historias) {
  const prompt = `
Dado el siguiente listado de historias de usuario:
${historias.map(s => `- ${s.key}: ${s.fields.summary}`).join('\n')}

Genera un plan de pruebas estructurado con los siguientes apartados:
- Qué se va a probar (Alcance)
- Cómo se va a probar (Estrategia)
- Criterios de Inicio y Fin
- Qué se necesita (Recursos)
- Cuándo se realizarán las pruebas (Cronograma)
- Qué se entregará (Entregables)
- Qué riesgos existen (Riesgos)

Analiza el contenido de las historias y resalta los puntos importantes en cada sección.
El resultado debe estar en formato Markdown.
`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un asistente experto en QA y análisis de software.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    },
    {
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
      },
    }
  );

  return response.data.choices[0].message.content;
}