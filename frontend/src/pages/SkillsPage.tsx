import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Cloud, BrainCircuit } from 'lucide-react';
import { skillsData } from '@/data/cv/skillsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Map icon names to actual Lucide components
const icons = { Server, Cloud, BrainCircuit };

export function SkillsPage() {
    const [selectedCategory, setSelectedCategory] = useState(skillsData.categories[0]);

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
                <div className="container mx-auto flex h-16 items-center gap-4">
                    <Link to="/cv"><button className="p-2 rounded-md hover:bg-accent"><ArrowLeft className="h-5 w-5" /></button></Link>
                    <div>
                        <h1 className="text-xl font-bold">Why Fullstack?</h1>
                        <p className="text-sm text-muted-foreground">A breakdown of my technical expertise</p>
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-8">
                <p className="text-lg text-center max-w-3xl mx-auto mb-12 text-muted-foreground">{skillsData.summary}</p>

                <div className="md:flex gap-8">
                    {/* Sidebar for categories */}
                    <aside className="md:w-1/3 lg:w-1/4 mb-8 md:mb-0">
                        <div className="space-y-2">
                            {skillsData.categories.map(category => {
                                const Icon = icons[category.icon];
                                const isActive = selectedCategory.name === category.name;
                                return (
                                    <button
                                        key={category.name}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                                            }`}
                                    >
                                        <Icon className="h-6 w-6" />
                                        <span className="font-semibold">{category.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Main content for selected category */}
                    <main className="md:w-2/3 lg:w-3/4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    {React.createElement(icons[selectedCategory.icon], { className: "h-8 w-8 text-primary" })}
                                    {selectedCategory.name}
                                </CardTitle>
                                <p className="text-muted-foreground pt-2">{selectedCategory.description}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {selectedCategory.skills.map(skill => (
                                        <div key={skill.name}>
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-semibold">{skill.name}</h4>
                                                <span className="text-sm text-muted-foreground">{skill.level}%</span>
                                            </div>
                                            <Progress value={skill.level} className="h-2" />
                                            <p className="text-sm text-muted-foreground mt-2">{skill.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </main>
        </div>
    );
}