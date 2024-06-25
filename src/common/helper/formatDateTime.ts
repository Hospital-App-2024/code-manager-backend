import { format } from '@formkit/tempo';

export const formatDateTime = (date: Date) => {
  return format(date, 'DD/MM/YYYY, h:mm A');
};

export const formatTime = (date: Date) => {
  return format(date, {
    time: 'short',
  });
};

export const formatMonth = (date: Date) => {
  return format(date, 'M');
};
