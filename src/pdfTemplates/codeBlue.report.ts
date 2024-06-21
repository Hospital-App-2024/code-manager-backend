import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { footerSection } from './sections/footer.section';
import { headerSection } from './sections/header.section';
import { CodeBlueEntity } from 'src/code-blue/entities/code-blue.entity';

interface ReportOptions {
  codeBlue: CodeBlueEntity[];
}

export const CodeBlueReport = ({
  codeBlue,
}: ReportOptions): TDocumentDefinitions => {
  return {
    pageOrientation: 'landscape',
    header: headerSection({
      title: 'Reporte de Códigos Azul',
    }),
    footer: footerSection,
    pageMargins: [40, 60, 40, 60],
    content: [
      {
        layout: 'portrait',
        table: {
          headerRows: 1,
          widths: [120, 120, '*', 'auto', 'auto'],
          dontBreakRows: true,
          body: [
            ['Fecha/Hora', 'Equipo', 'Ubicación', 'Activado por', 'Operador'],
            ...codeBlue.map((codeBlue) => [
              codeBlue.createdAt,
              codeBlue.team,
              codeBlue.location,
              codeBlue.activeBy,
              codeBlue.operator,
            ]),
          ],
        },
      },
    ],
  };
};
