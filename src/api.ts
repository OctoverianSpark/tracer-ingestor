import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import tracerRoutes from "./routes/tracer.routes.js"
import { pingData } from "./controllers/tracer.controller.js"
import appuserRoutes from "./routes/appuser.routes.js"
import computerRoutes from "./routes/computer.routes.js"
import scheduleRoutes from "./routes/schedules.routes.js"
import programationRoutes from "./routes/programation.routes.js"
import rotationCycleRoutes from "./routes/rotation_cycles.routes.js"
import groupsRouter from "./routes/groups.routes.js"
import rolesRoutes from "./routes/roles.routes.js"
import categorizationAppsRoutes from "./routes/categorization_apps.routes.js"
import appUsageLogsRoutes from "./routes/app_usage_logs.routes.js"
import reportTypesRoutes from "./routes/report_types.routes.js"
import reportTypeAssignmentsRoutes from "./routes/report_type_assignments.routes.js"
import stateCategoriesRoutes from "./routes/state_categories.routes.js"
import statesRoutes from "./routes/states.routes.js"


export function startApi() {
  const app = express()

  app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  app.use(helmet())
  app.use(express.json({ limit: "128mb" }))
  app.use(express.urlencoded({ limit: "128mb", extended: true }))
  app.use(morgan("dev"))


  app.use('/tracer', tracerRoutes)
  app.use('/appuser', appuserRoutes)
  app.use('/machines', computerRoutes)
  app.use('/schedules', scheduleRoutes)
  app.use('/programations', programationRoutes)
  app.use('/rotation-cycles', rotationCycleRoutes)
  app.use('/groups', groupsRouter)
  app.use('/roles', rolesRoutes)
  app.use('/categorization-apps', categorizationAppsRoutes)
  app.use('/app-usage-logs', appUsageLogsRoutes)
  app.use('/report-types', reportTypesRoutes)
  app.use('/report-type-assignments', reportTypeAssignmentsRoutes)
  app.use('/state-categories', stateCategoriesRoutes)
  app.use('/states', statesRoutes)


  app.get("/", pingData)

  const PORT = process.env.PORT || 3000

  app.listen(PORT, () => {
    console.log(`Tracer ingest running on port ${PORT}`)
  })

}