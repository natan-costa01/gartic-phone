import type { Metadata } from 'next';
import EnigmaGame from '@/components/EnigmaGame';
export const metadata: Metadata = {
  title: 'PhoneEnigma — um desenho, seis chances',
  description: 'Descubra o desenho aos poucos. Desafio diário e modo livre, sem sala ou cadastro.',
};
export default function EnigmaPage() { return <EnigmaGame />; }
