/**
 * Extracts plain text from a Jira description object (Atlassian Document Format).
 * @param {object|string} desc - The description content from Jira.
 * @returns {string} The extracted plain text.
 */
export function extractJiraDescription(desc) {
  if (!desc) return '';
  if (typeof desc === 'string') return desc;

  function extractFromNode(node) {
    if (!node) return '';
    if (node.type === 'text') return node.text || '';
    if (node.type === 'paragraph') {
      return (node.content || []).map(extractFromNode).join('') + '\n';
    }
    if (node.type === 'heading') {
      return '\n' + (node.content || []).map(extractFromNode).join('') + '\n';
    }
    if (node.type === 'bulletList' || node.type === 'orderedList') {
      return '\n' + (node.content || []).map(extractFromNode).join('') + '\n';
    }
    if (node.type === 'listItem') {
      return '- ' + (node.content || []).map(extractFromNode).join('') + '\n';
    }
    if (node.type === 'media' || node.type === 'mediaSingle' || node.type === 'inlineCard') {
      return ''; // Ignore non-textual nodes
    }
    if (Array.isArray(node.content)) {
      return node.content.map(extractFromNode).join('');
    }
    return '';
  }

  try {
    return (desc.content || []).map(extractFromNode).join('').replace(/\n{2,}/g, '\n').trim();
  } catch (error) {
    console.error("Error extracting Jira description:", error);
    return ''; // Return empty string on error but log it
  }
}
