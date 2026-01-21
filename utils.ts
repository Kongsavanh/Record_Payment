
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('lo-LA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  return Number(value.replace(/[^0-9]/g, ''));
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getTodayStr = (): string => {
  return new Date().toISOString().split('T')[0];
};
