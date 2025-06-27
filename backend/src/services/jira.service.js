import config from '../config/index.js';
import axios from 'axios';

const jiraApi = axios.create({
  baseURL: config.jiraUrl,
  auth: {
    username: config.jiraEmail,
    password: config.jiraApiToken,
  },
  headers: {
    'Accept': 'application/json'
  }
});

export const getProjects = async () => {
  return Promise.resolve([
    { key: 'MKT', name: 'Innovation' },
    { key: 'FDM', name: 'Backbone' },
    { key: 'CST', name: 'Common Service' },
   
  ]);
};

export const getSprintsByProject = async (projectKey) => {
    const boardsResponse = await jiraApi.get(`/rest/agile/1.0/board`, {
        params: { projectKeyOrId: projectKey },
    });
    if (boardsResponse.data.values.length === 0) {
        throw new Error('No se encontraron tableros para este proyecto.');
    }

    let allSprints = [];

    for (const board of boardsResponse.data.values) {
        let sprints = [];
        let startAt = 0;
        let isLast = false;
        const maxResults = 50;

        while (!isLast) {
            const sprintsResponse = await jiraApi.get(
                `/rest/agile/1.0/board/${board.id}/sprint`,
                { params: { startAt, maxResults } }
            );
            sprints = sprints.concat(sprintsResponse.data.values);
            isLast = sprintsResponse.data.isLast;
            startAt += maxResults;
        }

        allSprints = allSprints.concat(sprints);
    }

    // Opcional: eliminar sprints duplicados por id
    const uniqueSprints = [];
    const seen = new Set();
    for (const sprint of allSprints) {
        if (!seen.has(sprint.id)) {
            uniqueSprints.push(sprint);
            seen.add(sprint.id);
        }
    }

    return uniqueSprints;
};

export const getStoriesBySprint = async (sprintId) => {
    const jql = `sprint = ${sprintId} AND issuetype = "Story" ORDER BY created DESC`;
    const response = await jiraApi.get(`/rest/api/3/search`, {
        params: { jql, fields: "summary,description,status" },
    });
    return response.data.issues;
};

export const addCommentToJira = async (issueKey, comment) => {
  await jiraApi.post(
    `/rest/api/3/issue/${issueKey}/comment`,
    { body: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: comment }]}] } },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};