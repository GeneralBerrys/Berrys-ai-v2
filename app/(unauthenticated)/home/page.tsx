import type { Metadata } from 'next';
import { Demo } from './components/demo';
import { Features } from './components/features';
import { Hero } from './components/hero';
import { Providers } from './components/providers';

export const metadata: Metadata = {
  title: 'A visual AI playground | Berrys',
  description:
    'Berrys is a creative canvas for building AI workflows. Drag, drop connect and run nodes to build your own workflows powered by various industry-leading AI models.',
};

const buttons = [
  {
    title: 'Get started for free',
    link: '/auth/sign-up',
  },
  {
    title: 'Login',
    link: '/auth/login',
  },
];

const Home = () => (
  <>
    <Hero
      announcement={{
        title: 'Berrys is coming soon!',
        link: 'https://www.instagram.com/berrys.ai/',
      }}
      buttons={buttons}
    />
    <Demo />
    <Providers />
    <Features />
  </>
);

export default Home;
