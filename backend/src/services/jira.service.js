import axios from 'axios';
import config from '../config/index.js';

const JIRA_API_URL = `https://finkargo.atlassian.net/rest/api/3`;
const AUTH_TOKEN = Buffer.from(`${config.jiraEmail}:${config.jiraApiToken}`).toString('base64');

/**
 * Creates a link between two Jira issues.
 * @param {string} inwardIssueKey - The key of the issue the link is pointing to (e.g., the new bug).
 * @param {string} outwardIssueKey - The key of the issue the link is coming from (e.g., the story).
 */
async function linkIssues(inwardIssueKey, outwardIssueKey) {
  const linkData = {
    type: {
      name: 'Relates', // This is a common, default link type.
    },
    inwardIssue: { key: inwardIssueKey },
    outwardIssue: { key: outwardIssueKey },
  };

  await axios.post(`${JIRA_API_URL}/issueLink`, linkData, {
    headers: {
      'Authorization': `Basic ${AUTH_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

export async function createBugInJira({ projectKey, summary, description, parentKey }) {
  const issueData = {
    fields: {
      project: {
        key: projectKey,
      },
      summary,
      description, // Expecting ADF format from frontend
      issuetype: {
        name: 'Bug',
      },
      // The 'parent' field is removed to avoid the hierarchy error.
      // We will link the issues in a separate step.
    },
  };

  const response = await axios.post(`${JIRA_API_URL}/issue`, issueData, {
    headers: {
      'Authorization': `Basic ${AUTH_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const newBug = {
    id: response.data.id,
    key: response.data.key,
    self: response.data.self,
  };

  // After creating the bug, link it to the parent story.
  try {
    await linkIssues(newBug.key, parentKey);
  } catch (linkError) {
    // Log the linking error but don't fail the whole operation,
    // as the bug was still created successfully.
    console.error(`Bug ${newBug.key} created, but failed to link to story ${parentKey}:`, linkError.response?.data || linkError.message);
  }

  return newBug;
}