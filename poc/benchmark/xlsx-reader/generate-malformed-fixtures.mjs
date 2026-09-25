import ExcelJS from 'exceljs';
import { writeFile } from 'node:fs/promises';

const out = new URL('./stress-fixtures/', import.meta.url);
const wb = new ExcelJS.Workbook();
const s = wb.addWorksheet('Manifest');
s.addRows([
  ['House', 'Peso', 'Código'],
  ['HOUSE-0001', 10.5, 'DEST-0001'],
  ['HOUSE-0002', 7.25, 'DEST-0002']
]);
const valid = Buffer.from(await wb.xlsx.writeBuffer());

await writeFile(new URL('ST04-truncated.xlsx', out), valid.subarray(0, Math.floor(valid.length * 0.45)));

const corrupted = Buffer.from(valid);
for (let i = 0; i < Math.min(32, corrupted.length); i++) {
  corrupted[i] ^= 0x5a;
}
await writeFile(new URL('ST05-corrupted-header.xlsx', out), corrupted);

await writeFile(new URL('ST06-not-xlsx.xlsx', out), Buffer.from('This is not an XLSX ZIP container.\n', 'utf8'));

console.log(JSON.stringify({
  protocol: 'xlsx-reader-malformed-fixtures-v0.1.0',
  fixtures: [
    'ST04-truncated.xlsx',
    'ST05-corrupted-header.xlsx',
    'ST06-not-xlsx.xlsx'
  ]
}, null, 2));
