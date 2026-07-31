import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: `ts-node --compiler-options {"module":"CommonJS","moduleResolution":"node","skipLibCheck":true} prisma/seed.ts`,
  },
})