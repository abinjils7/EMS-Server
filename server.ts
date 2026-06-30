import 'dotenv/config'
import app from './src/app.js'
import connectDB from './src/config/db.js'

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err: Error) => {
    console.error('DB connection failed:', err.message)
    process.exit(1)
  })
