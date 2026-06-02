import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const comps = await prisma.computers.findMany({ select: { id: true, serial_number: true, hostname: true, ip_address: true, appuser_id: true } });

  console.log(`Total computers: ${comps.length}`);

  const byHostname = new Map();
  for (const c of comps) {
    const key = c.hostname ?? '<null>';
    const arr = byHostname.get(key) ?? [];
    arr.push(c);
    byHostname.set(key, arr);
  }

  let dupHostCount = 0;
  for (const [hostname, arr] of byHostname) {
    if (arr.length > 1) {
      dupHostCount++;
      console.log(`\nDUP hostname=${hostname} count=${arr.length}`);
      for (const a of arr) console.log(`  id=${a.id} serial=${a.serial_number} ip=${a.ip_address} appuser=${a.appuser_id}`);
    }
  }
  if (dupHostCount === 0) console.log('\nNo duplicate hostnames found.');

  const bySerial = new Map();
  for (const c of comps) {
    const key = c.serial_number ?? '<null>';
    const arr = bySerial.get(key) ?? [];
    arr.push(c);
    bySerial.set(key, arr);
  }

  let dupSerialCount = 0;
  for (const [serial, arr] of bySerial) {
    if (serial !== '<null>' && arr.length > 1) {
      dupSerialCount++;
      console.log(`\nDUP serial=${serial} count=${arr.length}`);
      for (const a of arr) console.log(`  id=${a.id} hostname=${a.hostname} ip=${a.ip_address} appuser=${a.appuser_id}`);
    }
  }
  if (dupSerialCount === 0) console.log('\nNo duplicate serial numbers found.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
