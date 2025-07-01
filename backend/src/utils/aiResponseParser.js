export function parseGherkinScenarios(aiText) {
  if (!aiText) {
    return [];
  }

  // This regex splits the text by "Scenario" followed by an optional number and colon.
  // It's designed to handle various formatting from the AI.
  const scenariosRaw = aiText.split(/Scenario\s*(?:\d+\s*:)?:?/gi)
    .map(s => s.trim())
    .filter(Boolean);

  if (scenariosRaw.length > 1 && scenariosRaw[0].toUpperCase().startsWith("FEATURE:")) {
    // If the first part is a "Feature" description, skip it and re-add "Scenario" prefix.
    return scenariosRaw.slice(1).map((s, i) => `Scenario ${i + 1}: ${s}`);
  }
  if (scenariosRaw.length > 0) {
    // Handle cases where there's no "Feature" or only one scenario.
    return scenariosRaw.map((s, i) => (scenariosRaw.length > 1 ? `Scenario ${i + 1}: ${s}` : s));
  }

  return [];
}