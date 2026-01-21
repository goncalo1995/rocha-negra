import React, { useState } from 'react';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { Button } from '../ui/button';
import { detailedProjects, simpleExperience } from '@/data/cv/cvData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';

const Section = ({ title, children, id }) => (
    <section id={id} className="mb-8 scroll-mt-20">
        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 border-b-2 pb-2 border-gray-200 dark:border-gray-700">{title}</h2>
        <div className="space-y-6">
            {children}
        </div>
    </section>
);

export function MainContent({ name, role, profile, experience, achievements }) {

    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openProjectModal = (project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
            <header className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">{name}</h1>
                <p className="text-lg lg:text-xl font-medium text-blue-600 dark:text-blue-400 mt-1">{role}</p>
            </header>

            <Section title="Profile" id="profile">
                <p className="text-base leading-relaxed">{profile}</p>
            </Section>

            <Section title="Work Experience" id="experience">
                <Accordion type="multiple" className="w-full space-y-4">
                    {simpleExperience.map((item, index) => {
                        const detailedProject = detailedProjects.find(p => p.company === item.company && p.period === item.period);

                        return (
                            <AccordionItem value={`item-${index}`} key={item.company + item.period} className="border rounded-lg overflow-hidden">
                                <AccordionTrigger className="p-4 hover:no-underline">
                                    <div className="text-left">
                                        <h3 className="text-lg font-semibold">{item.role}</h3>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {item.company} | <span className="text-gray-500 dark:text-gray-400">{item.period}</span>
                                        </p>
                                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed italic">{item.summary}</p>


                                        {/* --- BADGES AT THE BOTTOM --- */}
                                        {item.technologies && (
                                            <div className="border-t pt-3 mt-4">
                                                <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Key Technologies</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.technologies.map(tech => <Badge key={tech}>{tech}</Badge>)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="px-4 pb-4 space-y-4 border-t pt-4">
                                        {/* --- NEW: FLEXIBLE CONTENT RENDERER --- */}
                                        {item.content ? (
                                            item.content.map((contentItem, idx) => {
                                                if (contentItem.type === 'intro') {
                                                    return <p key={idx} className="italic text-muted-foreground">{contentItem.text}</p>;
                                                }
                                                if (contentItem.type === 'project_highlight') {
                                                    return (
                                                        <div key={idx} className="pl-4 border-l-2">
                                                            <h4 className="font-semibold">{contentItem.title}</h4>
                                                            <p className="text-sm text-muted-foreground mt-1">{contentItem.description}</p>
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {contentItem.technologies.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })
                                        ) : (
                                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                                {item.achievements?.map(ach => <li key={ach}>{ach}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-4 py-4">
                                        {item.responsibilities && (
                                            <div className="space-y-3">
                                                {item.responsibilities.map(resp => (
                                                    <div key={resp.title}>
                                                        <div className="flex items-baseline gap-2">
                                                            <h4 className="font-semibold">{resp.title}</h4>
                                                            <span className="text-xs text-muted-foreground">({resp.timePercentage}%)</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{resp.description}</p>
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {resp.technologies.map(tech => (
                                                                <Badge key={tech} variant="secondary">{tech}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {detailedProject && !item.responsibilities && (
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto mt-2 text-blue-500"
                                                onClick={() => openProjectModal(detailedProject)}
                                            >
                                                View Project Details (STAR Method)
                                            </Button>
                                        )}

                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </Section>

            {/* <Section title={experience.title} id="experience">
                {experience.items.map(item => (
                    <div key={item.company + item.period} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                        <div className="absolute left-[-5.5px] top-2 h-3 w-3 rounded-full bg-blue-500"></div>
                        <h3 className="text-lg font-semibold">{item.role}</h3>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.company} | <span className="text-gray-500 dark:text-gray-400">{item.period}</span></p>
                        <p className="mt-2 text-base leading-relaxed">{item.description}</p>
                        {item.technologies && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {item.technologies.map(tech => (
                                    <span key={tech} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded">{tech}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </Section> */}

            <Section title={achievements.title} id="achievements">
                <ul className="list-disc list-inside space-y-2">
                    {achievements.items.map(item => (
                        <li key={item.name} className="text-base"><span className="font-semibold">{item.name}</span> - {item.date}</li>
                    ))}
                </ul>
            </Section>

            <ProjectDetailsModal
                project={selectedProject}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    );
}