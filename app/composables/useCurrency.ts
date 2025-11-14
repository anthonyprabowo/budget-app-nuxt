export function useCurrency(locale: string = 'en-US', currency: string = 'USD') {
  const formatCurrency = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '';

    const number = typeof value === 'string' ? Number(value) : value;
    if (isNaN(number)) return '';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(number);
  };

  return { formatCurrency };
}
