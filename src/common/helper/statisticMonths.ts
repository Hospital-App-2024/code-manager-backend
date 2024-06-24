import { formatMonth } from './formatDateTime';

export interface Data {
  _count: number;
  createdAt: Date;
}

const months = [
  {
    month: 'Enero',
    value: 0,
  },
  {
    month: 'Febrero',
    value: 1,
  },
  {
    month: 'Marzo',
    value: 2,
  },
  {
    month: 'Abril',
    value: 3,
  },
  {
    month: 'Mayo',
    value: 4,
  },
  {
    month: 'Junio',
    value: 5,
  },
  {
    month: 'Julio',
    value: 6,
  },
  {
    month: 'Agosto',
    value: 7,
  },
  {
    month: 'Septiembre',
    value: 8,
  },
  {
    month: 'Octubre',
    value: 9,
  },
  {
    month: 'Noviembre',
    value: 10,
  },
  {
    month: 'Diciembre',
    value: 11,
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
