import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface OpenGraphProductProps {
  title: string;
  description?: string;
}

export async function OpenGraphText({ title, description }: OpenGraphProductProps) {
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: 'hsl(60, 4.8%, 95.9%)',
          height: '100%',
          width: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          flexWrap: 'nowrap',
        }}
      >
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            bottom: '72px',
            left: '72px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '48px',
              color: 'hsl(240, 3.8%, 46.1%)',
            }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
