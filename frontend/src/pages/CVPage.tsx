import React from 'react';
import { cvData } from '@/data/cv/cvData';
import { Sidebar } from '@/components/cv/Sidebar';
import { MainContent } from '@/components/cv/MainContent';

export function CVPage() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <div className="container mx-auto p-4 lg:p-8">
                <div className="lg:flex lg:gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-1/3 xl:w-1/4 mb-8 lg:mb-0">
                        <div className="sticky top-8">
                            <Sidebar
                                imageUrl={cvData.personalInfo.imageUrl}
                                contacts={cvData.personalInfo.contacts}
                                education={cvData.sections.find(s => s.type === 'education')}
                                skills={cvData.sections.find(s => s.type === 'skills')}
                                languages={cvData.sections.find(s => s.type === 'languages')}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:w-2/3 xl:w-3/4">
                        <MainContent
                            name={cvData.personalInfo.name}
                            role={cvData.personalInfo.role}
                            profile={cvData.personalInfo.profile}
                            experience={cvData.sections.find(s => s.type === 'experience')}
                            achievements={cvData.sections.find(s => s.type === 'achievements')}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
}