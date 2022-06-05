const request = require('supertest');
const app = require('../../../app');

test('/ Request works', async () => {
    const response = await request(app.app.callback()).get('/');
    expect(response.status).toBe(200);
});

test('/ Request with params', async () => {
    const response = await request(app.app.callback()).get('/?date=2019-06-01,2020-06-06&lessonsPerPage=1&page=1&teacherIds=1');
    expect(response.status).toBe(200);
});

test('/ Request with invalid date', async () => {
    const response = await request(app.app.callback()).get('/?date=2019-06-01f,2020-06-06&lessonsPerPage=1280&page=1&teacherIds=1,2,88');
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({"error": 400,"message": "date param error!"});
});

test('/ Request with invalid lessonsPerPage', async () => {
    const response = await request(app.app.callback()).get('/?date=2019-06-01,2020-06-06&lessonsPerPage=a&page=1&teacherIds=1,2,88');
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({"error": 400,"message": "lessonsPerPage param error!"});
});

test('/lessons Request with empty post params', async () => {
    const response = await request(app.app.callback()).post('/lessons');
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({"error": 400,"message": "params teacherIds, title, days, firstDate are required!"});
});

test('/lessons Request with wrong params', async () => {
    const params = {
        teacherIds: "cool",
        title: "description",
        days: 'ggg',
        firstDate: 'jjj'
    };
    const response = await request(app.app.callback()).post('/lessons').send(params);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({"error": 400,"message": "one of the params is expected: lessonsCount or lastDate!"});
});

test('/lessons Request with wrong params 2', async () => {
    const params = {
        teacherIds: "cool",
        title: "description",
        days: 'ggg',
        firstDate: 'jjj',
        lessonsCount: 5
    };
    const response = await request(app.app.callback()).post('/lessons').send(params);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({"error": 400,"message": "teacherIds param format error!"});
});

test('/lessons Adding two lessons', async () => {
    const params = {
        "teacherIds": [1,2],
        "title": "Blue Ocean",
        "days": [0,1,2,3,4,5,6],
        "firstDate": "2019-09-10",
        "lessonsCount": 2,
        "lastDate": "2029-12-31"
    };
    const response = await request(app.app.callback()).post('/lessons').send(params);
    expect(response.status).toBe(200);
});