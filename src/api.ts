import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import tracerRoutes from "./routes/tracer.routes.js"
import { pingData } from "./controllers/tracer.controller.js"
import personalRoutes from "./routes/personal.routes.js"
import computerRoutes from "./routes/computer.routes.js"


export function startApi() {
  const app = express()

  app.use(cors())
  app.use(helmet())
  app.use(express.json({ limit: "50mb" }))
  app.use(morgan("dev"))


  app.use('/tracer',tracerRoutes)
  app.use('/personal',personalRoutes)
  app.use('/machines',computerRoutes)
  
  app.get("/",pingData)

  const PORT = process.env.PORT || 3000

  app.listen(PORT, () => {
    console.log(`Tracer ingest running on port ${PORT}`)
  })

}