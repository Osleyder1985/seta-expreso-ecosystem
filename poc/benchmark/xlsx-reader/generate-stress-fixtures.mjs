import ExcelJS from 'exceljs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const out = new URL('./stress-fixtures/', import.meta.url);
await mkdir(out, { recursive: true });

async function save(name, build) {
  const wb = new ExcelJS.Workbook();
  await build(wb);
  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  await writeFile(new URL(name, out), buffer);
  return {
    name,
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex')
  };
}

const results = [];

results.push(await save('ST01-large-100k.xlsx', wb => {
  const s = wb.addWorksheet('Manifest');
  for (let i = 1; i <= 100000; i++) {
    if (i === 1) {
      s.addRow(['House', 'Peso', 'Cantidad', 'Código', 'Dirección']);
    } else {
      s.addRow([
        `HOUSE-${String(i).padStart(8, '0')}`,
        i % 17 === 0 ? 12.75 : 10,
        (i % 4) + 1,
        `DEST-${String(i % 1000).padStart(4, '0')}`,
        `ADDRESS TEST ${i % 5000}`
      ]);
    }
  }
}));

results.push(await save('ST02-header-row-50k.xlsx', wb => {
  const s = wb.addWorksheet('Manifest');
  s.addRows([
    ['MANIFIESTO TEST'],
    ['Metadata', 'NON_OPERATIONAL'],
    ['Generated', 'synthetic'],
    [],
    ['Control', 'stress'],
    ['House', 'Peso', 'Cantidad', 'Código', 'Dirección']
  ]);
  for (let i = 1; i <= 50000; i++) {
    s.addRow([
      `HOUSE-${String(i).padStart(8, '0')}`,
      7.25 + (i % 13) / 10,
      1 + (i % 5),
      `DEST-${String(i % 1000).padStart(4, '0')}`,
      `ADDRESS TEST ${i % 3000}`
    ]);
  }
}));

results.push(await save('ST03-multi-sheet-20k.xlsx', wb => {
  const main = wb.addWorksheet('Manifest');
  main.addRows([['House', 'Peso', 'Dirección']]);
  const aux = wb.addWorksheet('Auxiliar');
  aux.addRows([['House', 'Estado']]);
  for (let i = 1; i <= 20000; i++) {
    main.addRow([`HOUSE-${i}`, 5 + (i % 9), `ADDRESS TEST ${i % 1000}`]);
    aux.addRow([`HOUSE-${i}`, i % 2 ? 'OK' : 'PENDING']);
  }
}));

await writeFile(new URL('manifest.json', out), JSON.stringify({
  protocol: 'xlsx-reader-stress-fixtures-v0.1.0',
  fixtures: results
}, null, 2));

console.log(JSON.stringify({ fixtureCount: results.length, fixtures: results }, null, 2));
