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

interface ResetPasswordTemplateProps {
  url: string;
}

export const ResetPasswordTemplate: React.FC<ResetPasswordTemplateProps> = ({
  url,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for Berrys</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://your-vercel-domain.vercel.app/brand/logo.svg"
              width="120"
              height="40"
              alt="Berrys"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>Reset Your Password</Heading>
          
          <Text style={text}>
            We received a request to reset your password. Click the button below to create a new password.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={url}>
              Reset Password
            </Button>
          </Section>
          
          <Text style={text}>
            If the button doesn't work, you can copy and paste this link into your browser:
          </Text>
          
          <Link href={url} style={link}>
            {url}
          </Link>
          
          <Text style={footer}>
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
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

export default ResetPasswordTemplate;
