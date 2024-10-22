import React from 'react';
import { Html } from '@react-email/html';
import { Head } from '@react-email/head';
import { Body } from '@react-email/body';
import { Container } from '@react-email/container';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import { Lead } from '@/types/lead';

interface EmailTemplateProps {
  lead: Lead;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ lead }) => {
  const {
    name,
    email,
    phone_number,
    company,
    role,
    use_case,
    call_length,
    summary,
    call_analyses,
  } = lead;

  const analysis = call_analyses && call_analyses.length > 0 ? call_analyses[0] : null;

  return (
    <Html>
      <Head>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .section {
            padding: 20px;
          }
          .section h2 {
            margin-top: 0;
          }
          .detail-item {
            margin-bottom: 10px;
          }
          .footer {
            background-color: #f1f1f1;
            color: #888;
            padding: 10px;
            text-align: center;
            font-size: 12px;
          }
          @media only screen and (max-width: 600px) {
            .container {
              padding: 10px;
            }
          }
        `}</style>
      </Head>
      <Body>
        <Container className="container">
          <Section className="header">
            <h1>Call Summary Report</h1>
          </Section>
          <Section className="section">
            <h2>Lead Details</h2>
            <p className="detail-item">
              <strong>Name:</strong> {name || 'N/A'}
            </p>
            <p className="detail-item">
              <strong>Email:</strong>{' '}
              {email ? (
                <a href={`mailto:${email}`} style={{ color: '#4CAF50', textDecoration: 'none' }}>
                  {email}
                </a>
              ) : (
                'N/A'
              )}
            </p>
            <p className="detail-item">
              <strong>Phone Number:</strong>{' '}
              {phone_number ? (
                <a href={`tel:${phone_number}`} style={{ color: '#4CAF50', textDecoration: 'none' }}>
                  {phone_number}
                </a>
              ) : (
                'N/A'
              )}
            </p>
            <p className="detail-item">
              <strong>Company:</strong> {company || 'N/A'}
            </p>
            <p className="detail-item">
              <strong>Role:</strong> {role || 'N/A'}
            </p>
            <p className="detail-item">
              <strong>Use Case:</strong> {use_case || 'N/A'}
            </p>
            <p className="detail-item">
              <strong>Call Length:</strong>{' '}
              {call_length ? `${call_length.toFixed(2)} minutes` : 'N/A'}
            </p>
          </Section>
          <Section className="section">
            <h2>Call Summary</h2>
            <p>{summary || 'No summary available.'}</p>
          </Section>
          {analysis && (
            <Section className="section">
              <h2>Call Analysis</h2>
              <p className="detail-item">
                <strong>Sentiment Score:</strong>{' '}
                {(analysis.sentiment_score * 100).toFixed(0)}%
              </p>
              <p className="detail-item">
                <strong>Customer Satisfaction:</strong> {analysis.customer_satisfaction}
              </p>
              <p className="detail-item">
                <strong>Appointment Details:</strong> {analysis.appointment_details}
              </p>
              {analysis.key_points && analysis.key_points.length > 0 && (
                <div className="detail-item">
                  <strong>Key Points:</strong>
                  <ul>
                    {analysis.key_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}
          <Section className="footer">
            <p>&copy; {new Date().getFullYear()} Your Company Name</p>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
