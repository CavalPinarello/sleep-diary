import { AnalyticsRequest, AnalyticsResponse } from '@/types/analytics';

export class AnalyticsService {
  private static readonly BASE_URL = '/api/analytics';

  /**
   * Fetch comprehensive analytics for sleep data
   */
  static async getAnalytics(params: AnalyticsRequest = {}): Promise<AnalyticsResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeCorrelations: true,
          includeTrends: true,
          includeRecommendations: true,
          ...params,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics for a specific program
   */
  static async getProgramAnalytics(
    programId: string,
    params: Omit<AnalyticsRequest, 'programId'> = {}
  ): Promise<AnalyticsResponse> {
    return this.getAnalytics({ ...params, programId });
  }

  /**
   * Get analytics for a date range
   */
  static async getAnalyticsForDateRange(
    dateFrom: string,
    dateTo: string,
    params: Omit<AnalyticsRequest, 'dateFrom' | 'dateTo'> = {}
  ): Promise<AnalyticsResponse> {
    return this.getAnalytics({ ...params, dateFrom, dateTo });
  }

  /**
   * Get recent analytics (last 30 days)
   */
  static async getRecentAnalytics(
    params: Omit<AnalyticsRequest, 'dateFrom' | 'dateTo'> = {}
  ): Promise<AnalyticsResponse> {
    const dateTo = new Date().toISOString().split('T')[0];
    const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    return this.getAnalytics({ ...params, dateFrom, dateTo });
  }

  /**
   * Get basic metrics only (no correlations or trends)
   */
  static async getBasicMetrics(
    params: Omit<AnalyticsRequest, 'includeCorrelations' | 'includeTrends'> = {}
  ): Promise<AnalyticsResponse> {
    return this.getAnalytics({
      ...params,
      includeCorrelations: false,
      includeTrends: false,
    });
  }

  /**
   * Get analytics with full correlation analysis
   */
  static async getAnalyticsWithCorrelations(
    params: Omit<AnalyticsRequest, 'includeCorrelations'> = {}
  ): Promise<AnalyticsResponse> {
    return this.getAnalytics({
      ...params,
      includeCorrelations: true,
    });
  }
}

// Utility functions for processing analytics data
export class AnalyticsUtils {
  /**
   * Format sleep duration in minutes to hours and minutes string
   */
  static formatSleepDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  /**
   * Get color class for clinical risk level
   */
  static getRiskLevelColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'MINIMAL':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'LOW':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'MEDIUM':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Get trend icon and color
   */
  static getTrendDisplay(trend: 'improving' | 'declining' | 'stable'): {
    icon: string;
    color: string;
    text: string;
  } {
    switch (trend) {
      case 'improving':
        return {
          icon: '↗',
          color: 'text-green-600',
          text: 'Improving',
        };
      case 'declining':
        return {
          icon: '↘',
          color: 'text-red-600',
          text: 'Declining',
        };
      case 'stable':
        return {
          icon: '→',
          color: 'text-blue-600',
          text: 'Stable',
        };
    }
  }

  /**
   * Get clinical category color
   */
  static getClinicalCategoryColor(category: string): string {
    switch (category.toLowerCase()) {
      case 'excellent':
        return 'text-green-700 bg-green-100';
      case 'good':
        return 'text-green-600 bg-green-50';
      case 'fair':
        return 'text-yellow-600 bg-yellow-50';
      case 'poor':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  /**
   * Format correlation coefficient to readable string
   */
  static formatCorrelation(correlation: number): string {
    const abs = Math.abs(correlation);
    let strength = '';
    
    if (abs >= 0.7) strength = 'Strong';
    else if (abs >= 0.4) strength = 'Moderate';
    else if (abs >= 0.2) strength = 'Weak';
    else strength = 'Very Weak';

    const direction = correlation >= 0 ? 'Positive' : 'Negative';
    return `${strength} ${direction} (${correlation.toFixed(2)})`;
  }

  /**
   * Format percentage with appropriate precision
   */
  static formatPercentage(value: number, precision: number = 1): string {
    return `${value.toFixed(precision)}%`;
  }

  /**
   * Get recommendation priority color
   */
  static getRecommendationColor(type: 'immediate' | 'lifestyle' | 'clinical'): string {
    switch (type) {
      case 'immediate':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'lifestyle':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'clinical':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  /**
   * Calculate sleep efficiency percentage from hours
   */
  static calculateEfficiencyPercentage(
    timeInBedHours: number,
    totalSleepHours: number
  ): number {
    if (timeInBedHours === 0) return 0;
    return (totalSleepHours / timeInBedHours) * 100;
  }

  /**
   * Get day of week abbreviation
   */
  static getDayAbbreviation(dayName: string): string {
    const abbreviations: { [key: string]: string } = {
      Sunday: 'Sun',
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat',
    };
    return abbreviations[dayName] || dayName.slice(0, 3);
  }

  /**
   * Sort days of week in correct order
   */
  static sortDaysOfWeek<T extends { day: string }>(days: T[]): T[] {
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
  }
}