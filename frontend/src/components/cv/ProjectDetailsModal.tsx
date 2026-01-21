import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

const StarSection = ({ title, content }) => (
    <div>
        <h4 className="font-semibold text-md text-gray-800 dark:text-gray-200 mb-1">{title}</h4>
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{content}</p>
    </div>
);

export function ProjectDetailsModal({ project, isOpen, onOpenChange }) {
    if (!project) return null;

    return (
        <Dialog open={isOpen} onOpen-change={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{project.title}</DialogTitle>
                    <DialogDescription>{project.client} | {project.period}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {project.technologies.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                    </div>
                    <div className="space-y-4">
                        <StarSection title="Situation" content={project.star.situation} />
                        <StarSection title="Task" content={project.star.task} />
                        <StarSection title="Action" content={project.star.action} />
                        <StarSection title="Result" content={project.star.result} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}