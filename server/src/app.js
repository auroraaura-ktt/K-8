import cors from 'cors'
import express from 'express'

import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'

const app = express()

app.use(
  cors({
    origin: '*',
  })
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MiitVerse API. Use /api/auth or /api/users.' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

export default app