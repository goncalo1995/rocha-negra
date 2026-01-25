import { useQuery } from '@tanstack/react-query';
import { ProjectionsChart } from '@/components/dashboard/ProjectionsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/hooks/useFinance';
import api from '@/lib/api';
import { ProjectedMonth } from '@/types/finance';
import { Spinner } from '@/components/ui/spinner';

export function ProjectionsPage() {
    // Fetch the net worth to know the starting point of the chart
    // This assumes your useFinance or a similar hook provides this metric.
    const { metrics, isLoadingMetrics } = useFinance();

    // Fetch the projection data from your new backend endpoint
    const { data: projections, isLoading: isLoadingProjections } = useQuery<ProjectedMonth[]>({
        queryKey: ['projections'],
        queryFn: async () => (await api.get('/projections?months=12')).data, // Fetch 24 months for this page
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const isLoading = isLoadingMetrics || isLoadingProjections;

    return (
        <div className="min-h-screen bg-background">
            <main className="container py-6 animate-fade-in">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner />
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>24-Month Net Worth Forecast</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {projections && metrics && (
                                <ProjectionsChart
                                    projections={projections}
                                    currentBalance={metrics.netWorth}
                                />
                            )}
                        </CardContent>
                    </Card>
                )}
                {/* In the future, you will add filter controls here */}
                <div className="mt-6">
                    {/* Placeholder for filters: by Asset, by Tag, etc. */}
                </div>
            </main>
        </div>
    );
}