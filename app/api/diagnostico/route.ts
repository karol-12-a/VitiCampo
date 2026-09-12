import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { variedadUva, faseFenologica, sintomasDetectados } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 });
    }

    const prompt = `Actua como un ingeniero experto en viticultura. Analiza la siguiente situacion en el vinedo y genera un reporte estructurado con diagnostico presuntivo, nivel de riesgo y un plan de accion con 3 recomendaciones tecnicas:
    - Variedad de Uva: ${variedadUva}
    - Fase Fenologica: ${faseFenologica}
    - Sintomas Detectados: ${sintomasDetectados}`;

    const resp = await fetch(`https://googleapis.com{apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const data = await resp.json();
    
    if (!resp.ok) {
      return NextResponse.json({ error: data?.error?.message || 'Error en Google' }, { status: 500 });
    }

    let textoFinal = '';
    
    // SINTAXIS DESTRUCTURADA INMUTABLE: Extrae el primer elemento de forma directa y nativa
    if (data && data.candidates && data.candidates.length > 0) {
      const [firstCandidate] = data.candidates;
      if (firstCandidate && firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
        const [firstPart] = firstCandidate.content.parts;
        if (firstPart) {
          textoFinal = firstPart.text || '';
        }
      }
    }

    if (!textoFinal) {
      return NextResponse.json({ error: 'Respuesta vacia de la IA' }, { status: 500 });
    }

    return NextResponse.json({ reporte: textoFinal });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno en el servidor de IA' }, { status: 500 });
  }
}
