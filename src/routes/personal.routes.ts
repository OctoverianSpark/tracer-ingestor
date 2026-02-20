import { Router } from "express";
import { deleteEmployee, getDocTypes, getEmployee, getEmployees, saveEmployee } from "../controllers/personal.controller.js";

const personalRoutes = Router()

personalRoutes.get('/get',getEmployees)
personalRoutes.get('/find/:id',getEmployee)
personalRoutes.get('/document_types',getDocTypes)
personalRoutes.delete('/delete',deleteEmployee)

personalRoutes.post('/save',saveEmployee)


export default personalRoutes