import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"; // Assuming you use shadcn/ui

export function TechnologiesAccordion({ title, categories }) {
    return (
        <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">{title}</h3>
            <Accordion type="multiple" className="w-full">
                {categories.map(category => (
                    <AccordionItem value={category.name} key={category.name}>
                        <AccordionTrigger className="text-sm font-semibold">{category.name}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {category.technologies.map(tech => (
                                    <span key={tech} className="bg-gray-200 dark:bg-gray-700 text-xs font-medium px-2 py-1 rounded">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}