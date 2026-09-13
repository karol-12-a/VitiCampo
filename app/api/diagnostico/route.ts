import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      variedadUva?: string;
      faseFenologica?: string;
      sintomasDetectados?: string;
    };

    const variedadUva = body?.variedadUva?.trim();
    const faseFenologica = body?.faseFenologica?.trim();
    const sintomasDetectados = body?.sintomasDetectados?.trim();

    if (!variedadUva || !faseFenologica || !sintomasDetectados) {
      return NextResponse.json(
        { error: 'Los campos variedadUva, faseFenologica y sintomasDetectados son obligatorios.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Actúa como ingeniero agrónomo experto en viticultura. Analiza la situación del viñedo y entrega un informe técnico claro, preciso y profesional.

- Variedad de uva: ${variedadUva}
- Fase fenológica: ${faseFenologica}
- Síntomas detectados: ${sintomasDetectados}

Incluye:
1. Diagnóstico presuntivo y principales causas posibles.
2. Nivel de riesgo.
3. Plan de acción con exactamente 3 pasos concretos y priorizados.
4. Recomendaciones técnicas en español.

Responde solo con el texto del informe.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const text =
      (response as any)?.text ??
      (response as any)?.candidates
        ?.map((candidate: any) =>
          candidate?.content?.parts
            ?.map((part: any) => part?.text ?? '')
            .join('') ?? ''
        )
        .join('\n') ??
      '';

    const reporte = text.trim();

    if (!reporte) {
      return NextResponse.json({ error: 'Respuesta vacía de la IA' }, { status: 500 });
    }

    return NextResponse.json({ reporte });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor al generar el diagnóstico.' },
      { status: 500 }
    );
  }
}
