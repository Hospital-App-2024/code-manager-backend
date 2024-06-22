import { format } from '@formkit/tempo';

export const formatDateTime = (date: Date) => {
  return format(date, {
    date: 'short',
    time: 'short',
  });
};
