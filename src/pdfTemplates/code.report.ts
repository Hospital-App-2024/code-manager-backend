import type { TDocumentDefinitions, Table } from 'pdfmake/interfaces';
import { footerSection } from './sections/footer.section';
import { headerSection } from './sections/header.section';

interface ReportOptions {
  columnNames: string[];
  columnItems: string[][];
  title: string;
  widths?: Table['widths'];
}

export const CodeReport = ({
  columnItems,
  columnNames,
  title,
  widths = ['*', '*', '*', '*', '*'],
}: ReportOptions): TDocumentDefinitions => {
  return {
    pageOrientation: 'landscape',
    header: headerSection({
      title,
    }),
    footer: footerSection,
    pageMargins: [40, 60, 40, 60],
    content: [
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: widths,
          dontBreakRows: true, // Evita que se divida una fila en dos páginas
          body: [columnNames, ...columnItems],
        },
      },
    ],
  };
};
