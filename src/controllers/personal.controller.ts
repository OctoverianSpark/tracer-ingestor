import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";


export const getEmployee = async (req: Request, res: Response) => {
  const { id } = req.params

  if (!id || isNaN(Number(id))) return res.status(400).json({
    ok: false,
    err: 'Id must be a valid number'
  })

  try {
    const employee = await prisma.personal.findUnique({
      where: { id: BigInt(id as string) }
    })

    if (!employee) return res.status(404).json({ ok: false, err: 'Employee not found' })

    return res.json(employee)
  } catch (err) {
    return res.status(500).json({ ok: false, err: 'Internal server error' })
  }
}


export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.personal.findMany()
    return res.json(employees)
  } catch (err) {
    return res.status(500).json({ ok: false, err: 'Internal server error' })
  }
}

export const getDocTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.document_types.findMany()
    return res.json(types)
  } catch (err) {
    return res.status(500).json({ ok: false, err: 'Internal server error' })
  }
}


export const saveDocType = async (req: Request, res: Response) => {
  const { body } = req

  try {
    if (body.id) {
      if (isNaN(Number(body.id))) return res.status(400).json({
        ok: false,
        err: 'Id must be a number'
      })

      await prisma.document_types.update({
        where: { id: Number(body.id) },
        data: body
      })
    } else {
      await prisma.document_types.create({ data: body })
    }

    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ ok: false, err: 'Internal server error' })
  }
}

export const deleteDocType = async (req: Request, res: Response) => {
  const { id } = req.params

  if (!id) return res.status(400).json({ ok: false, err: 'Id does not exists' })
  if (isNaN(Number(id))) return res.status(400).json({ ok: false, err: 'Id must be a number' })

  try {
    await prisma.document_types.delete({ where: { id: Number(id) } })
    return res.json({ ok: true, msg: 'Delete succeded' })
  } catch (err) {
    return res.status(500).json({ ok: false, err: 'Internal server error' })
  }
}

export const saveMode = async (req: Request, res: Response) => {
  const { body } = req

  try {
    await prisma.modes.create({ data: body })
    return res.status(200).json({ ok: true, msg: 'Modo Creado' })
  } catch (err) {
    return res.status(500).json({ ok: false, err: 'Internal server error' })
  }
}


export const deleteMode = async (req: Request, res: Response) => {
  const { id } = req.params

  if (!id) return res.status(400).json({ ok: false, err: 'Id does not exists' })
  if (isNaN(Number(id))) return res.status(400).json({ ok: false, err: 'Id must be a number' })

  try {
    await prisma.modes.delete({ where: { id: Number(id) } })
    return res.json({ ok: true, msg: 'Delete succeded' })
  } catch (err) {
    return res.status(500).json({ ok: false, err: 'Internal server error' })
  }
}

export const getModes = async (req: Request, res: Response) => {
  try {
    const modes = await prisma.modes.findMany()
    return res.status(200).json({ ok: true, modes })
  } catch (err) {
    return res.status(500).json({ ok: false, err: 'Internal server error' })
  }
}


export const saveEmployee = async (req: Request, res: Response) => {
  const { body } = req

  try {
    if (body.id) {
      const { id, document_type, ...data } = body
      await prisma.personal.update({
        where: { id: BigInt(id) },
        data
      })
    } else {
      const { document_type, mode_type, ...data } = body
      await prisma.personal.create({
        data: {
          ...data,
          document_type: { connect: { id: Number(document_type) } },
          mode: { connect: { id: Number(mode_type) } },
        }
      })
    }

    return res.json({ ok: true })
  } catch (err) {

    console.log(err);

    return res.status(500).json({ ok: false, err: 'Internal server error' })
  }
}

export const deleteEmployee = async (req: Request, res: Response) => {
  const ids = req.body as number[]

  try {
    await Promise.all(
      ids.map((id) => prisma.personal.delete({ where: { id: BigInt(id) } }))
    )
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ ok: false, err: 'Internal server error' })
  }
}
