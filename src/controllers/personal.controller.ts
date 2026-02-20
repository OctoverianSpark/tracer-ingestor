import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";



export const getEmployee = (req:Request,res:Response) => {

  const {id} = req.params


  if(!id || isNaN(Number(id))) return


  console.log(id);
  


}




export const getEmployees = async (req:Request,res:Response) => {


  const employees = await prisma.personal.findMany();

  res.json(employees)
  

}

export const getDocTypes = async (req:Request, res:Response) => {





  const types =await prisma.document_types.findMany();
  return res.json(types)
 
  }

  


export const saveEmployee =async (req:Request, res:Response) => {


  const {body} = req

  if (body.id) {
    await prisma.personal.update({
      where:{
        id:Number(body.id)
      },
      data: body
    })

    res.json({ok:true})
  }else{

  await prisma.personal.create({
    data:body
  })
    res.json({ok:true})

  }


}

export const deleteEmployee = async (req:Request,res:Response) => {

  const {body} = req

  
  const ids = body as number[]


  ids.forEach(async (id)=>{
    
    await prisma.personal.delete({where:{
      id: id
    }})
    
  })
  
    res.json({ok:true})
  

}