import {
  classifyRow,
  columnLetter,
  toSourceCell,
} from './workbook-reader.port';

describe('WorkbookReaderPort primitives', () => {
  it('classifies header, data, empty, total and subtotal rows', () => {
    expect(classifyRow(['House', 'Peso'], true)).toBe('HEADER');
    expect(classifyRow(['CACC-001', 12.5])).toBe('DATA');
    expect(classifyRow(['', null])).toBe('EMPTY');
    expect(classifyRow(['TOTAL', 12.5])).toBe('TOTAL');
    expect(classifyRow(['SUBTOTAL Habana', 12.5])).toBe('SUBTOTAL');
  });

  it('generates deterministic Excel column addresses', () => {
    expect(columnLetter(1)).toBe('A');
    expect(columnLetter(26)).toBe('Z');
    expect(columnLetter(27)).toBe('AA');
    expect(columnLetter(52)).toBe('AZ');
    expect(columnLetter(53)).toBe('BA');
  });

  it('preserves provenance when converting a source cell', () => {
    const cell = toSourceCell(
      'Manifiesto',
      7,
      3,
      12.5,
      'Peso',
    );

    expect(cell.ref).toEqual({
      sheetName: 'Manifiesto',
      rowNumber: 7,
      columnIndex: 3,
      columnHeaderRaw: 'Peso',
      cellAddress: 'C7',
    });
    expect(cell.rawValue).toBe(12.5);
    expect(cell.displayedValue).toBe('12.5');
    expect(cell.detectedType).toBe('NUMBER');
  });

  it('fails closed for invalid column indexes', () => {
    expect(() => columnLetter(0)).toThrow(RangeError);
    expect(() => columnLetter(-1)).toThrow(RangeError);
    expect(() => columnLetter(1.5)).toThrow(RangeError);
  });
});
