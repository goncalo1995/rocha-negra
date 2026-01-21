import React, { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { coreTechnologies } from '@/data/cv/coreTechnologies';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export function TechnologyBubbles() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const selectedCategory = selectedId ? coreTechnologies.categories.find(c => c.name === selectedId) : null;
    const Icon = selectedCategory?.icon;

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-inner min-h-[400px] relative flex flex-col justify-center items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-center text-gray-500 dark:text-gray-400 mb-6 absolute top-6">
                {coreTechnologies.title}
            </h3>

            {/* --- BUBBLE GRID VIEW --- */}
            <motion.div
                className="grid grid-cols-2 gap-1 mt-12 w-full max-w-sm"
                animate={{ opacity: selectedId ? 0.2 : 1, filter: selectedId ? 'blur(4px)' : 'blur(0px)' }}
                transition={{ duration: 0.3 }}
            >
                {coreTechnologies.categories.map((category) => {
                    const CategoryIcon = category.icon;
                    return (
                        <motion.div
                            key={category.name}
                            layoutId={category.name}
                            onClick={() => setSelectedId(category.name)}
                            onHoverStart={() => setHoveredId(category.name)} // <-- Set hovered ID
                            onHoverEnd={() => setHoveredId(null)} // <-- Clear hovered ID
                            className={`aspect-square rounded-full flex flex-col items-center justify-center text-center p-2 m-4 cursor-pointer text-white shadow-lg relative overflow-hidden ${category.color}`}
                        >
                            <AnimatePresence>
                                {/* Show icon and name if NOT hovered */}
                                {hoveredId !== category.name && (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center"
                                    >
                                        <CategoryIcon className="h-6 w-6 mb-1" />
                                        <span className="text-xs font-semibold">{category.name}</span>
                                    </motion.div>
                                )}

                                {/* Show "Click to Expand" text ON HOVER */}
                                {hoveredId === category.name && (
                                    <motion.div
                                        key="hover-text"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0 flex items-center justify-center font-bold text-sm"
                                    >
                                        See more
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* --- DETAILED VIEW (EXPANDED BUBBLE) --- */}
            <AnimatePresence>
                {selectedCategory && Icon && (
                    <motion.div
                        layoutId={selectedCategory.name}
                        className={`absolute inset-4 z-10 rounded-lg p-6 flex flex-col text-white shadow-2xl ${selectedCategory.color}`}
                    >
                        {/* Header with persistent icon */}
                        <motion.div layout="position" className="flex items-center gap-4 mb-4">
                            <Icon className="h-8 w-8" />
                            <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
                        </motion.div>

                        {/* Back Button */}
                        <motion.button
                            onClick={() => setSelectedId(null)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
                            exit={{ opacity: 0, scale: 0.5 }}
                        >
                            <X className="h-5 w-5" />
                        </motion.button>

                        {/* Collapsible Content */}
                        <motion.div
                            className="flex-grow overflow-y-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.3 } }}
                        >
                            <Accordion type="multiple" defaultValue={Object.keys(selectedCategory.details)} className="w-full">
                                {Object.entries(selectedCategory.details).map(([title, items]) => (
                                    <AccordionItem value={title} key={title} className="border-b-white/20">
                                        <AccordionTrigger className="text-white hover:no-underline">{title}</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {(items as string[]).map((item) => (
                                                    <span key={item} className="bg-white/10 text-white text-sm font-light px-3 py-1 rounded-full">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}