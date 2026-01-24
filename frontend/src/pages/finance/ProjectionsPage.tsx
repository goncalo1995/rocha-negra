import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ProjectionsChart } from '@/components/dashboard/ProjectionsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LineChart, Loader } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import api from '@/lib/api';
import { ProjectedMonth } from '@/types/finance';

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
            <header className="sticky top-0 z-40 border-b ...">
                <div className="container flex h-16 items-center gap-3">
                    <Link to="/finance">
                        <Button variant="ghost" size="icon" className="mr-2">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <LineChart className="h-6 w-6 text-primary" />
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Financial Projections</h1>
                        <p className="text-xs text-muted-foreground">Forecast your financial future</p>
                    </div>
                </div>
            </header>

            <main className="container py-6 animate-fade-in">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader />
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