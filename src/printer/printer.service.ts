import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { BufferOptions, TDocumentDefinitions } from 'pdfmake/interfaces';

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf',
  },
};

@Injectable()
export class PrinterService {
  private printer = new PdfPrinter(fonts);

  public createPdf({
    docDefinitions,
    options,
  }: {
    docDefinitions: TDocumentDefinitions;
    options?: BufferOptions;
  }): PDFKit.PDFDocument {
    return this.printer.createPdfKitDocument(docDefinitions, options);
  }
}
