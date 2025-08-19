import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface MagicLinkEmailTemplateProps {
  url: string;
  appName?: string;
}

export const MagicLinkEmailTemplate: React.FC<MagicLinkEmailTemplateProps> = ({
  url,
  appName = 'Berrys',
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your magic link to login to {appName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://your-vercel-domain.vercel.app/brand/logo.svg"
              width="120"
              height="40"
              alt={appName}
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>Welcome to {appName}</Heading>
          
          <Text style={text}>
            Click the button below to securely login to your {appName} account. This link will expire in 24 hours.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={url}>
              Login to {appName}
            </Button>
          </Section>
          
          <Text style={text}>
            If the button doesn't work, you can copy and paste this link into your browser:
          </Text>
          
          <Link href={url} style={link}>
            {url}
          </Link>
          
          <Text style={footer}>
            If you didn't request this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#e4edf1',
  fontFamily: 'Satoshi Variable, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#f5fcff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '1em',
  boxShadow: '0px 2px 3px 0px hsl(0 0% 0% / 0.16)',
};

const header = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#22282a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#22282a',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4040b0',
  borderRadius: '1em',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  boxShadow: '0px 2px 3px 0px hsl(0 0% 0% / 0.16)',
};

const link = {
  color: '#4040b0',
  textDecoration: 'underline',
  textAlign: 'center' as const,
  display: 'block',
  margin: '16px 0',
  wordBreak: 'break-all' as const,
};

const footer = {
  color: '#5f6f77',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  margin: '32px 0 0 0',
};

export default MagicLinkEmailTemplate;
