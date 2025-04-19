'use client';

import Header from '@/components/Header';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About Energy Atlas</h1>
          
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                Energy Atlas is a comprehensive visualization tool designed to track and display renewable energy installations across the globe. Our mission is to provide transparent, accessible data about the world's transition to sustainable energy sources.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Features</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Interactive global map visualization</li>
                <li>Historical data from 2020 to 2023</li>
                <li>Multiple renewable energy types: Wind, Solar, and Hydro</li>
                <li>Real-time data updates and filtering</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">How It Works</h2>
              <p className="text-gray-600 leading-relaxed">
                Our platform uses advanced mapping technology to visualize energy installation data. The heatmap overlay shows the density and distribution of renewable energy installations, while our filtering tools allow users to explore different time periods and energy types.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Data Sources</h2>
              <p className="text-gray-600 leading-relaxed">
                The data displayed in Energy Atlas comes from various reliable sources, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
                <li>International Renewable Energy Agency (IRENA)</li>
                <li>National Renewable Energy Laboratories</li>
                <li>Government Energy Departments</li>
                <li>Public Energy Databases</li>
              </ul>
            </div>

            <div className="pt-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                Have questions or suggestions? We'd love to hear from you. Reach out to us at{' '}
                <a href="mailto:contact@energyatlas.com" className="text-blue-600 hover:text-blue-800">
                  contact@energyatlas.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
} 