import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import {
  BufferOptions,
  CustomTableLayout,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf',
  },
};

const customTableLayouts: Record<string, CustomTableLayout> = {
  blueHeaders: {
    hLineWidth: function (i, node) {
      if (i === 0 || i === node.table.body.length) {
        return 0;
      }
      return i === node.table.headerRows ? 0 : 1;
    },
    vLineWidth: function () {
      return 0;
    },
    hLineColor: function (i) {
      return i === 1 ? 'black' : '#aaa';
    },
    paddingLeft: function () {
      return 4;
    },
    paddingRight: function () {
      return 4;
    },
    paddingBottom: function () {
      return 4;
    },
    paddingTop: function () {
      return 4;
    },
    fillColor: function (i) {
      if (i === 0) {
        return '#2563EB';
      }
      return i % 2 ? null : '#f3f3f3';
    },
  },
};

@Injectable()
export class PrinterService {
  private printer = new PdfPrinter(fonts);

  public createPdf({
    docDefinitions,
    options = {
      tableLayouts: customTableLayouts,
    },
  }: {
    docDefinitions: TDocumentDefinitions;
    options?: BufferOptions;
  }): PDFKit.PDFDocument {
    return this.printer.createPdfKitDocument(docDefinitions, options);
  }
}
