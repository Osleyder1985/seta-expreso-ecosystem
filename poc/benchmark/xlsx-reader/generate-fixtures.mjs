import ExcelJS from 'exceljs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const out = new URL('./fixtures/', import.meta.url);
await mkdir(out, { recursive: true });

async function save(name, build) {
  const wb = new ExcelJS.Workbook();
  await build(wb);
  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  await writeFile(new URL(name, out), buffer);
  return { name, bytes: buffer.length, sha256 };
}

const results = [];
results.push(await save('F01-minimal.xlsx', async wb => {
  const s = wb.addWorksheet('Manifest');
  s.addRow(['House', 'Peso', 'Dirección']);
  s.addRow(['CACC-00000001', 12.5, 'CAMAGUEY TEST 1']);
}));
results.push(await save('F04-shared-address.xlsx', async wb => {
  const s = wb.addWorksheet('Manifest');
  s.addRow(['House', 'Peso', 'Dirección']);
  s.addRow(['CACC-00000001', 10, 'ADDRESS SHARED']);
  s.addRow(['CACC-00000002', 20, 'ADDRESS SHARED']);
}));
results.push(await save('F10-formula.xlsx', async wb => {
  const s = wb.addWorksheet('Manifest');
  s.addRow(['House', 'Peso', 'Total']);
  s.addRow(['CACC-00000001', 10, { formula: 'B2*2', result: 20 }]);
  s.getCell('C2').numFmt = '0.00';
}));
results.push(await save('F12-header-alias.xlsx', async wb => {
  const s = wb.addWorksheet('Manifest');
  s.addRow(['MANIFIESTO DE PAQUETERIA']);
  s.addRow(['Identificación', 'Fecha']);
  s.addRow(['House', 'Peso KG', 'Dirección del Destinatario']);
  s.addRow(['CACC-00000001', 12.5, 'ADDRESS TEST']);
}));
results.push(await save('F16-total.xlsx', async wb => {
  const s = wb.addWorksheet('Manifest');
  s.addRow(['House', 'Peso', 'Dirección']);
  s.addRow(['CACC-00000001', 10, 'ADDRESS 1']);
  s.addRow(['TOTAL', 10, '']);
}));

await writeFile(new URL('manifest.json', out), JSON.stringify({ generatedAt: new Date().toISOString(), fixtures: results }, null, 2));
console.log(JSON.stringify(results, null, 2));
