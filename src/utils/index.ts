// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

// Get condition color classes
export function getConditionColor(condition: string): string {
  switch (condition) {
    case 'like-new': 
      return 'text-green-400 bg-green-400/20';
    case 'excellent': 
      return 'text-blue-400 bg-blue-400/20';
    case 'good': 
      return 'text-yellow-400 bg-yellow-400/20';
    case 'fair': 
      return 'text-orange-400 bg-orange-400/20';
    default: 
      return 'text-gray-400 bg-gray-400/20';
  }
}

// Calculate savings
export function calculateSavings(originalPrice: number, currentPrice: number): number {
  return originalPrice - currentPrice;
}

// Format savings percentage
export function formatSavingsPercentage(originalPrice: number, currentPrice: number): string {
  const percentage = ((originalPrice - currentPrice) / originalPrice) * 100;
  return `${percentage.toFixed(0)}% off`;
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

