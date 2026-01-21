import { Mail, Phone, Linkedin, Github, Download, GraduationCap } from 'lucide-react';
import { TechnologyBubbles } from './TechnologyBubbles';

const contactIcons = {
    email: Mail,
    phone: Phone,
    linkedin: Linkedin,
    github: Github,
};

const Section = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">{title}</h3>
        {children}
    </div>
);

export function Sidebar({ imageUrl, contacts, education, skills, languages }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <img src={imageUrl} alt="Profile" className="rounded-full w-48 h-48 mx-auto mb-6 border-4 border-gray-200 dark:border-gray-700" />

            <Section title="Contact">
                <ul className="space-y-2 text-sm">
                    {contacts.map(contact => {
                        const Icon = contactIcons[contact.type];
                        return (
                            <li key={contact.type} className="flex items-center gap-3">
                                <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <a href={contact.href} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 break-all">{contact.value}</a>
                            </li>
                        );
                    })}
                </ul>
            </Section>

            <Section title={education.title}>
                <div className="relative pl-6 before:absolute before:left-1.5 before:top-2 before:h-full before:w-px before:bg-gray-200 dark:before:bg-gray-700">
                    {education.items.map(item => (
                        <div key={item.degree} className="mb-6">
                            <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-blue-500"></div>
                            <p className="font-semibold text-sm">{item.degree}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
                                <GraduationCap className="h-4 w-4" /> {/* You can use a custom SVG here */}
                                {item.institution}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.period}</p>
                            {item.grade && <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">Grade: {item.grade}</p>}

                            {item.thesis && (
                                <div className="mt-3 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                                    <p className="text-xs font-semibold">Thesis: {item.thesis.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{item.thesis.description}</p>
                                    <a href={item.thesis.fileUrl} download>
                                        <button className="mt-2 text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
                                            <Download className="h-3 w-3" />
                                            Download Thesis
                                        </button>
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Section>

            <Section title={skills.title}>
                <div className="flex flex-wrap gap-2">
                    {skills.items.map(skill => (
                        <span key={skill} className="bg-gray-200 dark:bg-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
                    ))}
                </div>
            </Section>

            <Section title={languages.title}>
                <ul className="space-y-1 text-sm">
                    {languages.items.map(lang => (
                        <li key={lang.name}><strong>{lang.name}:</strong> {lang.level}</li>
                    ))}
                </ul>
            </Section>

            <div className="mb-6">
                <TechnologyBubbles />
                {/* <TechnologiesAccordion
                    title={coreTechnologies.title}
                    categories={coreTechnologies.categories}
                /> */}
            </div>
        </div>
    );
}