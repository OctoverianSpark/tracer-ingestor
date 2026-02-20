import dotenv from "dotenv"
dotenv.config();

import { startApi } from "./api.js";
import { startWs } from "./ws.js";


startApi()
startWs()
