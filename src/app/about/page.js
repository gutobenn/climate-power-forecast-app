'use client';

import Header from '@/components/Header';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About RenewableHorizon</h1>
          
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                RenewableHorizon provides interactive maps showing renewable energy potential worldwide from the past to the year 2099. We aim to help researchers, planners, and the public make informed decisions about renewable energy development.
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
                RenewableHorizon uses high-quality climate model data from the CORDEX project, specifically:
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
                RenewableHorizon is developed by a small team consisting of Natália de Assis Brasil Weber and Augusto Bennemann.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Future Developments</h2>
              <p className="text-gray-600 leading-relaxed">
                We&apos;re expanding RenewableHorizon to include:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
                <li>Solar energy potential maps</li>
                <li>Hydropower energy potential maps</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}