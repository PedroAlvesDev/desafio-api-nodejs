import { test, expect } from 'vitest'
import request from 'supertest'
import { server } from '../app.ts'
import { makeCourse } from '../tests/factories/make-course.ts'


test('get course by id', async () => {
    await server.ready()

    const course = await makeCourse()

    const response = await request(server.server)
    .get(`/courses/${course.id}`)

    expect(response.status).toEqual(200)
    expect(response.body).toEqual({
        course: {
            id: expect.any(String),
            title: expect.any(String),
            description: "",
        }
    })
})

test('return 404 for non existing courses', async () => {
    await server.ready()

    const response = await request(server.server)
    .get(`/courses/74032fad-0d7b-4da9-88a4-b3da8b05c65d`)

    expect(response.status).toEqual(404)
})