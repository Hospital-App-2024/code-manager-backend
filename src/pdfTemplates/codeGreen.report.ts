import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { CodeGreenEntity } from 'src/code-green/entities/code-green.entity';
import { footerSection } from './sections/footer.section';
import { headerSection } from './sections/header.section';

interface ReportOptions {
  greenCodes: CodeGreenEntity[];
}

export const CodeGreenReport = ({
  greenCodes,
}: ReportOptions): TDocumentDefinitions => {
  return {
    pageOrientation: 'landscape',
    header: headerSection({
      title: 'Reporte de Códigos Verdes',
    }),
    footer: footerSection,
    pageMargins: [40, 60, 40, 60],
    content: [
      {
        layout: 'portrait',
        table: {
          headerRows: 1,
          widths: [120, 120, 120, 'auto', 'auto'],
          dontBreakRows: true,
          body: [
            ['Fecha/Hora', 'Operador', 'Activado por', 'Ubicación', 'Evento'],
            ...greenCodes.map(({ codeGreen }) => [
              codeGreen.createdAt,
              codeGreen.operator,
              codeGreen.activeBy,
              codeGreen.location,
              codeGreen.event,
            ]),
          ],
        },
      },
    ],
  };
};
