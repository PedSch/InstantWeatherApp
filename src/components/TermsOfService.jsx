import React from 'react'
import { useTranslation } from '../i18n.jsx'

export default function TermsOfService() {
  const { t } = useTranslation()
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <p className="text-sm text-slate-500 mb-6">Last Updated: November 21, 2025</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using InstantWeatherApp ("the App"), you accept and agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use the App.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Use of Service</h2>
        
        <h3 className="text-xl font-semibold mb-3 mt-4">License</h3>
        <p className="mb-4">
          We grant you a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes.
        </p>

        <h3 className="text-xl font-semibold mb-3 mt-4">Restrictions</h3>
        <p className="mb-4">You agree not to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Use the App for any illegal or unauthorized purpose</li>
          <li>Attempt to reverse engineer, decompile, or disassemble the App</li>
          <li>Remove or modify any proprietary notices</li>
          <li>Use automated systems or bots to access the App</li>
          <li>Overload or attempt to disable our servers</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Weather Data Disclaimer</h2>
        <p className="mb-4">
          Weather information is provided "as is" from third-party data sources. We make no warranties about:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>The accuracy, completeness, or timeliness of weather data</li>
          <li>The availability or reliability of the service</li>
          <li>Fitness for any particular purpose</li>
        </ul>
        <p className="mb-4">
          <strong>Important:</strong> Do not rely solely on this App for critical weather decisions. 
          Always consult official weather services for severe weather warnings and emergency situations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
        <p className="mb-4">
          The App uses third-party weather data providers and mapping services. 
          Your use of these services is subject to their respective terms and conditions:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Open-Meteo Weather API</li>
          <li>Yandex Maps</li>
          <li>Google Analytics</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
        <p className="mb-4">
          To the maximum extent permitted by law, InstantWeatherApp and its developers shall not be liable for:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Any indirect, incidental, special, or consequential damages</li>
          <li>Loss of data, profits, or business opportunities</li>
          <li>Damages resulting from reliance on weather information</li>
          <li>Service interruptions or errors</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Content</h2>
        <p className="mb-4">
          Any data you input (saved locations, preferences) is stored locally on your device. 
          You are responsible for maintaining backups of your data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Modifications to Service</h2>
        <p className="mb-4">
          We reserve the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Modify or discontinue the App at any time without notice</li>
          <li>Update these Terms of Service (effective upon posting)</li>
          <li>Change features, pricing, or access requirements</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
        <p className="mb-4">
          Your use of the App is also governed by our Privacy Policy. 
          Please review our <a href="/privacy" className="text-sky-600 hover:underline">Privacy Policy</a> to understand our practices.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your access to the App at any time, without notice, for any reason, 
          including violation of these Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
        <p className="mb-4">
          These Terms shall be governed by and construed in accordance with the laws of your jurisdiction, 
          without regard to conflict of law provisions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p className="mb-4">
          For questions about these Terms, contact us at:
        </p>
        <p className="mb-4">
          Email: legal@instantweatherapp.com
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Severability</h2>
        <p className="mb-4">
          If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
        </p>
      </section>
    </div>
  )
}
