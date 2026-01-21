import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { detailedProjects } from '@/data/cv/cvData';

// Group projects by a primary tag (e.g., AI/ML, E-commerce)
const projectTags = ['All', 'AI/ML', 'E-commerce', 'Enterprise', 'Cloud'];

export function PortfolioPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
                <div className="container mx-auto flex h-16 items-center gap-4">
                    <Link to="/cv">
                        <button className="p-2 rounded-md hover:bg-accent"><ArrowLeft className="h-5 w-5" /></button>
                    </Link>
                    <h1 className="text-xl font-bold">Project Portfolio</h1>
                </div>
            </header>

            <main className="container mx-auto py-8">
                <Tabs defaultValue="All" className="w-full">
                    <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                        {projectTags.map(tag => (
                            <TabsTrigger key={tag} value={tag}>{tag}</TabsTrigger>
                        ))}
                    </TabsList>

                    {projectTags.map(tag => (
                        <TabsContent key={tag} value={tag}>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {detailedProjects
                                    .filter(p => tag === 'All' || p.tags.includes(tag))
                                    .map(project => (
                                        <Card key={project.title} className="flex flex-col">
                                            <CardHeader>
                                                <CardTitle>{project.title}</CardTitle>
                                                <CardDescription>{project.client} | {project.period}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-sm text-muted-foreground mb-4">{project.summary}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.technologies.map(tech => (
                                                        <Badge key={tech} variant="secondary">{tech}</Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            {/* You can add a CardFooter with a "View Details" button later */}
                                        </Card>
                                    ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </main>
        </div>
    );
}