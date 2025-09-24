import type { Content } from 'pdfmake/interfaces';

interface Props {
  createdAt?: string;
  activeBy?: string;
  closedAt?: string;
  closedBy?: string;
}

const firstText = (text: string): Content => {
  return {
    text: text,
    marginBottom: 2,
  };
};

const lastText = (text: string): Content => {
  return {
    text: text,
    marginBottom: 6,
  };
};

export const tableBody = (options: Props): Content => {
  const { activeBy, closedAt, closedBy, createdAt } = options;

  const headerTitle = createdAt ? firstText(createdAt) : null;
  const headerSubtitle = activeBy ? lastText(activeBy) : null;

  const cellClosedAt = closedAt ? firstText(closedAt) : null;
  const cellClosedBy = closedBy ? lastText(closedBy) : null;

  const headerStack: Content = {
    stack: [headerTitle, headerSubtitle, cellClosedAt, cellClosedBy],
  };

  return {
    columns: [headerStack],
  };
};
