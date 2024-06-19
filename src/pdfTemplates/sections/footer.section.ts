import { Content } from 'pdfmake/interfaces';

export const footerSection = (
  currentPage: number,
  pageCount: number,
): Content => {
  return {
    text: `Página ${currentPage} de ${pageCount}`,
    alignment: 'center',
    fontSize: 8,
    margin: [0, 0, 0, 10],
  };
};
