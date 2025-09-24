import { formatMonth } from './formatDateTime';

export interface Data {
  _count: number;
  createdAt: Date;
}

const months = [
  {
    month: 'Enero',
    value: 1,
  },
  {
    month: 'Febrero',
    value: 2,
  },
  {
    month: 'Marzo',
    value: 3,
  },
  {
    month: 'Abril',
    value: 4,
  },
  {
    month: 'Mayo',
    value: 5,
  },
  {
    month: 'Junio',
    value: 6,
  },
  {
    month: 'Julio',
    value: 7,
  },
  {
    month: 'Agosto',
    value: 8,
  },
  {
    month: 'Septiembre',
    value: 9,
  },
  {
    month: 'Octubre',
    value: 10,
  },
  {
    month: 'Noviembre',
    value: 11,
  },
  {
    month: 'Diciembre',
    value: 12,
  },
];

export const statisticMonths = (data: Data[]) => {
  const monthsData = months.map((month) => {
    return {
      month: month.month,
      value: data.filter((item) => +formatMonth(item.createdAt) === month.value)
        .length,
    };
  });

  return monthsData;
};
