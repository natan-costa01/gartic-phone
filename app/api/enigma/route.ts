import { NextRequest, NextResponse } from 'next/server';
import { evaluateEnigma } from '@/lib/enigma-server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (raw.length > 4000) throw Error('Requisição muito grande.');
    const input: unknown = JSON.parse(raw);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Requisição inválida.');
    return NextResponse.json(evaluateEnigma(input as Record<string, unknown>), {headers:{'Cache-Control':'no-store'}});
  } catch (e) {
    return NextResponse.json({error:e instanceof Error ? e.message : 'Não foi possível carregar o desafio.'}, {status:400});
  }
}
