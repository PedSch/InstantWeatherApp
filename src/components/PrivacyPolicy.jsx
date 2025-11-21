import React from 'react'
import { useTranslation } from '../i18n.jsx'

export default function PrivacyPolicy() {
  const { t } = useTranslation()
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <p className="text-sm text-slate-500 mb-6">Last Updated: November 21, 2025</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          InstantWeatherApp ("we", "our", or "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, and share information when you use our weather application.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
        
        <h3 className="text-xl font-semibold mb-3 mt-4">Location Data</h3>
        <p className="mb-4">
          With your permission, we access your device's location to provide local weather forecasts. 
          Location data is processed locally and used only to fetch weather information from our data providers.
        </p>

        <h3 className="text-xl font-semibold mb-3 mt-4">Saved Locations</h3>
        <p className="mb-4">
          When you save locations, this data is stored locally on your device using browser localStorage. 
          We do not transmit or store your saved locations on our servers.
        </p>

        <h3 className="text-xl font-semibold mb-3 mt-4">Analytics Data</h3>
        <p className="mb-4">
          We use Google Analytics 4 to collect anonymous usage statistics including:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Pages viewed</li>
          <li>Features used</li>
          <li>Device type and browser</li>
          <li>Approximate geographic region (anonymized IP)</li>
        </ul>
        <p className="mb-4">
          This data helps us improve the app. No personally identifiable information is collected.
        </p>

        <h3 className="text-xl font-semibold mb-3 mt-4">Error Monitoring</h3>
        <p className="mb-4">
          We use Sentry for error monitoring to identify and fix bugs. Sentry may collect:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Error messages and stack traces</li>
          <li>Browser and device information</li>
          <li>User interactions leading to errors (anonymized)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
        <p className="mb-4">We use the following third-party services:</p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Open-Meteo</strong>: Weather data provider (no account required, no personal data shared)</li>
          <li><strong>Google Analytics 4</strong>: Anonymous usage analytics</li>
          <li><strong>Sentry</strong>: Error monitoring and crash reporting</li>
          <li><strong>Yandex Maps</strong>: Static map images</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Storage</h2>
        <p className="mb-4">
          All personal preferences (saved locations, theme, language, units) are stored locally on your device. 
          You can clear this data at any time by clearing your browser's local storage or using the reset button in the app.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Opt out of analytics by using browser extensions like uBlock Origin or Privacy Badger</li>
          <li>Deny location permissions (app will still work with manual city search)</li>
          <li>Clear all locally stored data at any time</li>
          <li>Request information about data we've collected (contact us below)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
        <p className="mb-4">
          Our service is not directed to children under 13. We do not knowingly collect personal information from children.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify you of changes by updating the "Last Updated" date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <p className="mb-4">
          Email: privacy@instantweatherapp.com
        </p>
      </section>
    </div>
  )
}
