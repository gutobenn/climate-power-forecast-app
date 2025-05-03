'use client';

import Header from '@/components/Header';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction Video Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">About Climate Power Forecast</h2>
          <div className="aspect-w-16 aspect-h-9 w-full rounded-lg overflow-hidden shadow mb-4">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/U5kS1eaH7hI"
              title="Climate Power Forecast Introduction Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Watch this short video for an overview of Climate Power Forecast. The video demonstrates the platform&apos;s main functionalities, and provides a deeper look into the methodology behind our data processing and projections.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">          
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                Climate Power Forecast provides interactive maps showing renewable energy potential worldwide from the past to the year 2099. We aim to help researchers, planners, and the public make informed decisions about renewable energy development.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">What We Offer</h2>
              <p className="text-gray-600 leading-relaxed">
                Our platform currently maps global wind energy potential with historical data and future projections through an easy-to-use interactive interface.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Data Sources</h2>
              <p className="text-gray-600 leading-relaxed">
                Climate Power Forecast uses high-quality climate model data from the CORDEX project, specifically:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
                <li><strong>Historical Data:</strong> sfcWind_SAM-22_NCC-NorESM1-M_historical_r1i1p1_GERICS-REMO2015_v1_3hr</li>
                <li><strong>Future Projections:</strong> sfcWind_SAM-22_MOHC-HadGEM2-ES_rcp85_r1i1p1_GERICS-REMO2015_v1_3hr</li>
              </ul>
              <p className="text-gray-600 mt-2">
                These datasets provide surface wind measurements at 3-hour intervals with comprehensive regional coverage.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Team</h2>
              <p className="text-gray-600 leading-relaxed">
                Climate Power Forecast is developed by a small team consisting of Natália de Assis Brasil Weber and Augusto Bennemann.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Future Developments</h2>
              <p className="text-gray-600 leading-relaxed">
                We&apos;re expanding Climate Power Forecast to include:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
                <li>Solar energy potential maps</li>
                <li>Hydropower energy potential maps</li>
              </ul>
            </div>
          </section>
          {/* Project Repositories Section */}
          <div className="mt-10 border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Project Repositories</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                <a href="https://github.com/natiweber/ClimatePowerForecast" className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                  Data & Notebooks Repository
                </a> – Contains data, analysis notebooks, and supplementary materials related to Climate Power Forecast.
              </li>
              <li>
                <a href="https://github.com/gutobenn/climate-power-forecast-app/" className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                  Application Code Repository
                </a> – Contains the source code for this web application.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}