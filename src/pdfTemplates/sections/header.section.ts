import type { Content } from 'pdfmake/interfaces';

interface HeaderOptions {
  title?: string;
  subtitle?: string;
}

const contentTitle = (title: string): Content => {
  return {
    text: title,
    alignment: 'center',
    margin: [0, 15, 0, 0],
    style: {
      bold: true,
      fontSize: 22,
    },
  };
};

const contentSubtitle = (subtitle: string): Content => {
  return {
    text: subtitle,
    alignment: 'center',
    margin: [0, 2, 0, 0],
    style: {
      fontSize: 12,
      bold: true,
    },
  };
};

export const headerSection = (options: HeaderOptions): Content => {
  const { title, subtitle } = options;

  const headerTitle = title ? contentTitle(title) : null;
  const headerSubtitle = subtitle ? contentSubtitle(subtitle) : null;

  const headerStack: Content = {
    stack: [headerTitle, headerSubtitle],
  };

  return {
    columns: [headerStack],
  };
};
