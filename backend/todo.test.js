import request from 'supertest';
import { app, server, db } from './index';
import getKeycloakToken from './utils';

let token; // Speichert den abgerufenen JWT-Token

beforeAll(async () => {
    token = await getKeycloakToken();
});

// describe('GET /todos (unautorisiert)', () => {
//     it('sollte einen 401-Fehler zurückgeben, wenn kein Token bereitgestellt wird', async () => {
//         const response = await request(app).get('/todos'); // Kein Authorization-Header
//
//         expect(response.statusCode).toBe(401);
//         expect(response.body.error).toBe('Unauthorized');
//     });
// });

describe('GET /todos', () => {
    it('sollte alle Todos abrufen', async () => {
        const response = await request(app)
            .get('/todos')
            .set('Authorization', `Bearer ${token}`); // Fügen Sie den Authorization-Header hinzu

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });
});

describe('POST /todos', () => {
    it('sollte ein neues Todo erstellen', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newTodo.title);
        expect(response.body.due).toBe(newTodo.due);
    });

    it('sollte einen 400-Fehler zurückgeben, wenn das Todo unvollständig ist', async () => {
        const newTodo = {
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0,
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it('sollte einen 400-Fehler zurückgeben, wenn das Todo nicht valide ist', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0,
            "invalid": "invalid"
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it ('sollte einen 400-Fehler zurückgeben, wenn der Titel des Todos fehlt', async () => {
        const newTodo = {
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it('sollte einen 400-Fehler zurückgeben, wenn der Titel des Todos zu kurz ist', async () => {
        const newTodo = {
            "title": "Ü",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it('sollte einen 400-Fehler zurückgeben, wenn das Datum des Todos fehlt', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it('sollte einen 400-Fehler zurückgeben, wenn das Datum des Todos kein ISO8601-Datum ist', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "20240-02-28",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it ('sollte einen 400-Fehler zurückgeben, wenn der status des Todos kein int ist', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": "offen"
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it ('sollte einen 400-Fehler zurückgeben, wenn der status des Todos kleiner 0 ist', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": -1
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it ('sollte einen 400-Fehler zurückgeben, wenn der status des Todos größer 2 ist', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 3
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });
});

describe('GET /todos/:id', () => {
    it('sollte ein Todo abrufen', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        const id = response.body._id;

        const getResponse = await request(app)
            .get(`/todos/${id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.body.title).toBe(newTodo.title);
        expect(getResponse.body.due).toBe(newTodo.due);
    });

    it('sollte einen 404-Fehler zurückgeben, wenn das Todo nicht gefunden wurde', async () => {
        const id = '123456789012345678901234';

        const getResponse = await request(app)
            .get(`/todos/${id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getResponse.statusCode).toBe(404);
        expect(getResponse.body.error).toMatch(/Todo with id .+ not found/);
    });
});

describe('PUT /todos/:id', () => {
    it('sollte ein Todo aktualisieren', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        const updatedTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 1,
            "_id": response.body._id
        };

        const updateResponse = await request(app)
            .put(`/todos/${response.body._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedTodo);

        expect(updateResponse.statusCode).toBe(200);
        expect(updateResponse.body.status).toBe(updatedTodo.status);
    });

    it('sollte einen 400-Fehler zurückgeben, wenn id in body und path unterschiedlich sind', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        const updatedTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 1,
            "_id": response.body._id
        };

        const updateResponse = await request(app)
            .put(`/todos/123456789012345678901234`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedTodo);

        expect(updateResponse.statusCode).toBe(400);
    });
});

describe('DELETE /todos/:id', () => {
    it('sollte ein Todo löschen', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        const deleteResponse = await request(app)
            .delete(`/todos/${response.body._id}`)
            .set('Authorization', `Bearer ${token}`);


        expect(deleteResponse.statusCode).toBe(204);

        const getResponse = await request(app)
            .get(`/todos/${response.body._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getResponse.statusCode).toBe(404);
    });
    it('sollte einen 404-Fehler zurückgeben, wenn das Todo nicht gefunden wurde', async () => {
        const id = '123456789012345678901234';

        const deleteResponse = await request(app)
            .delete(`/todos/${id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteResponse.statusCode).toBe(404);
    });
});


afterAll(async () => {
    server.close()
    db.close()
})
