// Mueve las capturas de la estructura vieja <SCREENSHOTS_PATH>/<hostname>/ a la nueva
// <SCREENSHOTS_PATH>/<appuser_id>/ (ver saveScreenShot en src/config/multer.ts), usando el
// usuario asignado HOY a cada equipo. El hostname se conserva dentro del nombre del archivo:
//   2026-09-17T23-45-01-123Z_Monitor1.jpg  →  <id>/2026-09-17T23-45-01-123Z_<hostname>_Monitor1.jpg
//
// Por defecto solo muestra lo que haría. Para aplicar:
//   node scripts/migrate-screenshots-to-users.mjs --apply
// Dentro del contenedor (scripts/ no va en la imagen):
//   docker cp scripts/migrate-screenshots-to-users.mjs <contenedor>:/app/
//   docker exec <contenedor> node migrate-screenshots-to-users.mjs --apply
//
// Se puede correr varias veces: los equipos sin usuario quedan donde están y se mueven en una
// corrida posterior, cuando se les asigne uno.
import { PrismaClient } from '@prisma/client';
import { mkdir, readdir, rename, rmdir, access } from 'fs/promises';
import path from 'path';

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(process.env.SCREENSHOTS_PATH || './screenshots');
const TS_PREFIX = /^(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}(?:-\d{3})?Z)_(.+)$/;

const prisma = new PrismaClient();

const exists = p => access(p).then(() => true, () => false);

function newName(file, host) {
  const m = file.match(TS_PREFIX);
  if (!m) return null;
  const [, ts, rest] = m;
  return rest.startsWith(`${host}_`) ? file : `${ts}_${host}_${rest}`;
}

// Mueve los archivos de srcDir a dstDir renombrándolos. Devuelve contadores.
async function moveFiles(srcDir, dstDir, host) {
  const stats = { moved: 0, skipped: 0, conflicts: 0 };
  let entries;
  try { entries = await readdir(srcDir, { withFileTypes: true }); } catch { return stats; }
  if (APPLY) await mkdir(dstDir, { recursive: true });
  for (const e of entries) {
    if (!e.isFile()) continue;
    const target = newName(e.name, host);
    if (!target) { stats.skipped++; continue; }
    const dst = path.join(dstDir, target);
    if (await exists(dst)) { stats.conflicts++; continue; }
    if (APPLY) await rename(path.join(srcDir, e.name), dst);
    stats.moved++;
  }
  return stats;
}

async function main() {
  console.log(`${APPLY ? 'APLICANDO' : 'SIMULACIÓN (usar --apply para mover)'} — ${ROOT}`);

  const computers = await prisma.computers.findMany({ select: { hostname: true, appuser_id: true } });
  // Sin distinguir mayúsculas: la carpeta viene de Environment.MachineName y el hostname de la BD del WS.
  const ownerByHost = new Map(computers.map(c => [c.hostname.toLowerCase(), c.appuser_id]));

  const dirs = (await readdir(ROOT, { withFileTypes: true }))
    .filter(e => e.isDirectory() && !/^\d+$/.test(e.name)) // las numéricas ya son carpetas de usuario
    .map(e => e.name);

  let totalMoved = 0;
  for (const host of dirs) {
    const owner = ownerByHost.get(host.toLowerCase());
    if (owner == null) {
      console.log(`  ${host}: sin usuario asignado, se deja igual`);
      continue;
    }
    const src = path.join(ROOT, host);
    const dst = path.join(ROOT, String(owner));
    const files = await moveFiles(src, dst, host);
    const thumbs = await moveFiles(path.join(src, 'thumbs'), path.join(dst, 'thumbs'), host);
    totalMoved += files.moved;
    console.log(`  ${host} → ${owner}: ${files.moved} capturas, ${thumbs.moved} miniaturas` +
      (files.skipped ? `, ${files.skipped} con nombre no reconocido (se dejan)` : '') +
      (files.conflicts + thumbs.conflicts ? `, ${files.conflicts + thumbs.conflicts} ya existían en destino (se dejan)` : ''));

    // Borra las carpetas viejas solo si quedaron vacías.
    if (APPLY) {
      await rmdir(path.join(src, 'thumbs')).catch(() => {});
      await rmdir(src).catch(() => {});
    }
  }
  console.log(`Total: ${totalMoved} capturas${APPLY ? ' movidas' : ' por mover'}.`);
}

main()
  .catch(err => { console.error(err); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
