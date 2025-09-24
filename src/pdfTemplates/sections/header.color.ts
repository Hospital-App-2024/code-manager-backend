import { Content } from 'pdfmake/interfaces';

interface Props {
  text: string;
  color?: string;
}

export const headerColor = ({ text, color = '#ffffff' }: Props): Content => {
  return {
    text,
    color,
    bold: true,
  };
};
