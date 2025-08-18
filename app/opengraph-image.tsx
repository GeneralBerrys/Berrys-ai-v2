import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Berrys - A visual AI playground';
export const contentType = 'image/png';
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #e4edf1 0%, #f5fcff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'Satoshi Variable, sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          {/* Berry icon */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#4040b0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#ffffff',
                opacity: 0.8,
                position: 'absolute',
                top: '12px',
                left: '12px',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ffffff',
                opacity: 0.6,
                position: 'absolute',
                top: '16px',
                right: '16px',
              }}
            />
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ffffff',
                opacity: 0.7,
                position: 'absolute',
                bottom: '12px',
                left: '16px',
              }}
            />
          </div>
          
          {/* Text */}
          <span
            style={{
              fontSize: '48px',
              fontWeight: '600',
              color: '#22282a',
            }}
          >
            Berrys
          </span>
        </div>

        {/* Tagline */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: '700',
            color: '#22282a',
            textAlign: 'center',
            margin: '0 0 24px 0',
            lineHeight: '1.1',
          }}
        >
          A visual AI playground
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '28px',
            color: '#5f6f77',
            textAlign: 'center',
            margin: '0',
            maxWidth: '800px',
            lineHeight: '1.4',
          }}
        >
          Build AI workflows with drag, drop, and connect. Powered by industry-leading models.
        </p>

        {/* Accent elements */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#5ba3e0',
            opacity: 0.1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '40px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#4040b0',
            opacity: 0.1,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
