module.exports = () => {
  'use strict';

  return {
    addEmptyRows: (sheet, number) => {
      for (let i = 0; i < number; i++) {
        sheet.addRow([]);
      }
    },

    addSigners: (sheet, rowIndex, inspector, accountant) => {
      if (inspector || accountant) {
        sheet.getRow(rowIndex).font = {bold: true};
        sheet.getRow(rowIndex).alignment = {horizontal: 'center'};
        sheet.getRow(rowIndex + 1).font = {bold: true};
        sheet.getRow(rowIndex + 1).alignment = {horizontal: 'center'};
      }
      if (inspector) {
        sheet.getCell('A' + rowIndex).value = inspector.position;
        sheet.getCell('A' + (rowIndex + 1)).value = inspector.person;
      }
      if (accountant) {
        sheet.mergeCells('D' + rowIndex + ':F' + rowIndex);
        sheet.mergeCells('D' + (rowIndex + 1) + ':F' + (rowIndex + 1));
        sheet.getCell('D' + rowIndex).value = accountant.position;
        sheet.getCell('D' + (rowIndex + 1)).value = accountant.person;
      }
    }
  };
};