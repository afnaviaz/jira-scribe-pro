const request = require('supertest');
const express = require('express');
const app = express();

app.get('/api/openai', (req, res) => {
	res.status(200).send('Hello OpenAI');
});

test('GET /api/openai', async () => {
	const response = await request(app).get('/api/openai');
	expect(response.statusCode).toBe(200);
	expect(response.text).toBe('Hello OpenAI');
});