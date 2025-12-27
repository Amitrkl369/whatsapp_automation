import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Home = () => {
  const navigate = useNavigate();

  const cards = [
    {
      path: '/dashboard',
      title: 'Dashboard',
      icon: '📊',
      description: 'View analytics and overview',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    },
    {
      path: '/messages',
      title: 'Messages',
      icon: '💬',
      description: 'Manage WhatsApp messages',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
    },
    {
      path: '/import',
      title: 'Import CSV',
      icon: '📤',
      description: 'Upload and import data',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    },
    {
      path: '/logs',
      title: 'Logs',
      icon: '📝',
      description: 'View system logs',
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
    },
    {
      path: '/scheduler',
      title: 'Scheduler',
      icon: '🗓️',
      description: 'Schedule and track meetings',
      color: 'from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700',
    },
    {
      path: '/settings',
      title: 'Settings',
      icon: '⚙️',
      description: 'Configure application',
      color: 'from-gray-500 to-gray-600',
      hoverColor: 'hover:from-gray-600 hover:to-gray-700',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Welcome to WhatsApp Automation</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose a section to get started
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-in">
          {cards.map((card, index) => (
            <div
              key={card.path}
              onClick={() => navigate(card.path)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-full">
                {/* Card */}
                <div className="glass rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  {/* Icon Container */}
                  <div
                    className={`w-24 h-24 mb-6 rounded-2xl bg-gradient-to-br ${card.color} ${card.hoverColor} flex items-center justify-center transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-lg`}
                  >
                    <span className="text-5xl">{card.icon}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white group-hover:gradient-text transition-all duration-300">
                    {card.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {card.description}
                  </p>

                  {/* Arrow Icon */}
                  <div className="mt-auto">
                    <div className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      <span className="mr-2">Open</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats Section (Optional) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">🚀</div>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              Fast
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Quick message delivery
            </div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              Secure
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Your data is protected
            </div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">📈</div>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              Reliable
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Automated scheduling
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
