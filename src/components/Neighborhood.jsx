import React from 'react';

const Neighborhood = ({ onNavigate }) => {
    const locations = [
        {
            id: 'gym',
            name: 'The Gym',
            description: 'Train your reflexes with falling words.',
            icon: '💪',
            route: 'fallingWords',
            color: 'from-orange-500 to-red-500',
            borderColor: 'border-orange-400'
        },
        {
            id: 'school',
            name: 'Language School',
            description: 'Master sentence structure and grammar.',
            icon: '🏫',
            route: 'sentenceBuilder',
            color: 'from-blue-500 to-indigo-500',
            borderColor: 'border-blue-400'
        },
        {
            id: 'cafe',
            name: 'Le Café',
            description: 'Chat with locals in realistic scenarios.',
            icon: '☕',
            route: 'conversation',
            color: 'from-amber-700 to-amber-500',
            borderColor: 'border-amber-400'
        },
        {
            id: 'library',
            name: 'Old Library',
            description: 'Read immersive stories in French.',
            icon: '📚',
            route: 'storyMode',
            color: 'from-emerald-600 to-teal-500',
            borderColor: 'border-emerald-400'
        },
        {
            id: 'park',
            name: 'Central Park',
            description: 'Relax with a daily mix of flashcards.',
            icon: '🌳',
            route: 'dailyMix',
            color: 'from-green-400 to-lime-500',
            borderColor: 'border-green-400'
        }
    ];

    return (
        <div className="min-h-screen p-8 animate-fade-in flex flex-col items-center">
            <header className="mb-12 text-center">
                <h1 className="text-5xl font-black mb-4 title-gradient drop-shadow-lg">
                    Ville de Lumière
                </h1>
                <p className="text-xl text-[var(--text-secondary)]">
                    Where would you like to go today?
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
                {locations.map((loc, index) => (
                    <button
                        key={loc.id}
                        onClick={() => onNavigate(loc.route)}
                        className={`
                            relative overflow-hidden group 
                            glass-panel p-6 text-left 
                            transition-all duration-300 transform hover:scale-105 hover:-translate-y-2
                            border-l-4 ${loc.borderColor}
                        `}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Background Glow Effect */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${loc.color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="text-4xl mb-4 bg-white/10 w-16 h-16 flex items-center justify-center rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                                {loc.icon}
                            </div>

                            <h3 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">
                                {loc.name}
                            </h3>

                            <p className="text-[var(--text-secondary)] text-sm mb-4 flex-grow">
                                {loc.description}
                            </p>

                            <div className="flex items-center text-xs font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                                <span className={`mr-2 w-2 h-2 rounded-full bg-gradient-to-r ${loc.color}`}></span>
                                Open Now
                            </div>
                        </div>
                    </button>
                ))}

                {/* Coming Soon Placeholder */}
                <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-50 border-dashed border-2 border-white/10">
                    <span className="text-4xl mb-4 grayscale">🏗️</span>
                    <h3 className="text-xl font-bold text-[var(--text-secondary)]">Under Construction</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-2">More locations soon...</p>
                </div>
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={() => onNavigate('menu')}
                    className="text-[var(--text-muted)] hover:text-white transition-colors text-sm underline"
                >
                    Return to Main Dashboard
                </button>
            </div>
        </div>
    );
};

export default Neighborhood;
