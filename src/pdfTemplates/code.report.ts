import type {
  TDocumentDefinitions,
  Table,
  TableCell,
} from 'pdfmake/interfaces';
import { footerSection } from './sections/footer.section';
import { headerSection } from './sections/header.section';
import { headerColor } from './sections/header.color';

interface ReportOptions {
  columnNames: TableCell[];
  columnItems: TableCell[][];
  title: string;
  subtitle?: string;
  widths?: Table['widths'];
}

export const CodeReport = ({
  columnItems,
  columnNames,
  title,
  subtitle,
  widths = ['*', '*', '*', '*', '*'],
}: ReportOptions): TDocumentDefinitions => {
  return {
    pageOrientation: 'landscape',
    header: (currenPage) => {
      if (currenPage === 1) {
        return headerSection({ title, subtitle });
      }
    },
    footer: footerSection,
    pageMargins: [20, 70, 20, 60],
    content: [
      {
        layout: 'blueHeaders',
        style: {
          fontSize: 12,
        },
        table: {
          headerRows: 1,
          widths: widths,
          dontBreakRows: true, // Evita que se divida una fila en dos páginas
          body: [
            columnNames.map((column) =>
              headerColor({ text: column as string }),
            ),
            ...columnItems,
          ],
        },
      },
    ],
  };
};
