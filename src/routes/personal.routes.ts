import { Router } from "express";
import { deleteDocType, deleteEmployee, deleteMode, getDocTypes, getEmployee, getEmployees, getModes, saveDocType, saveEmployee, saveMode } from "../controllers/personal.controller.js";

const personalRoutes = Router()

personalRoutes.get('/get', getEmployees)
personalRoutes.get('/find/:id', getEmployee)
personalRoutes.delete('/delete', deleteEmployee)
personalRoutes.get('/document_types', getDocTypes)
personalRoutes.post('/document_types/save', saveDocType)
personalRoutes.post('/document_types/delete/:id', deleteDocType)
personalRoutes.get('/modes', getModes)
personalRoutes.post('/modes/save', saveMode)
personalRoutes.delete('/modes/delete/:id', deleteMode)
personalRoutes.post('/save', saveEmployee)


export default personalRoutes