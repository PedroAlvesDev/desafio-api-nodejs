import { eq } from 'drizzle-orm'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi} from '@fastify/swagger-ui'
import fastify from 'fastify'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { db } from './src/database/client.ts'
import { courses } from './src/database/schema.ts'
import { z } from 'zod'
import { title } from 'process'


const server = fastify({
    logger: {
        transport: {
        target: 'pino-pretty',
        options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            },
        },
    },
}).withTypeProvider<ZodTypeProvider>()

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Desafio Node.js',
            version: '1.0.0',
        }
    },
    transform: jsonSchemaTransform,
})

server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

// const courses = [
//     { id: '1', title: 'Curso de Node.js' },
//     { id: '2', title: 'Curso de React' },
//     { id: '3', title: 'Curso de React Native' },
// ]

server.get('/courses', async (request, reply) => {
    const result = await db.select({
        id: courses.id,
        title: courses.title,
    }).from(courses)

    return reply.send({ courses: result })
})

server.get('/courses/:id', {
    schema:{
        params: z.object({
            id: z.uuid(),
        }),
    }
}, async (request, reply) => {
    const courseId = request.params.id

    const result = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))

    if (result.length > 0) {
        return { course: result[0] }
    }

    return reply.status(404).send()

})

server.post('/courses', {
    schema: {
        body: z.object({
            title: z.string().min(5, 'O título deve ter no mínimo 5 caracteres'),
        }),
   },
}, async (request, reply) => {
    const courseTitle = request.body.title

    const result = await db
    .insert(courses)
    .values({ title: courseTitle })
    .returning()

    return reply.status(201).send({ courseId: result[0].id })
})

server.listen({ port: 3333 }).then(() => {
    console.log('HTTP server running!')
})