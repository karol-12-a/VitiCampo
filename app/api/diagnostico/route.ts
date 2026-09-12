import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

    const resp = await fetch('https://googleapis.com' + apiKey, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      return NextResponse.json({ 
        error: errorData?.error?.message || `Error externo (Status: ${resp.status})` 
      }, { status: resp.status });
    }

    const data = await resp.json();
    
    // EXTRACCIÓN PLANA ULTRA ROBUSTA MEDIANTE PROPIEDADES DIRECTAS DE JAVASCRIPT
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const textoFinal = data.candidates[0].content.parts[0].text || '';
      if (textoFinal) {
        return NextResponse.json({ reporte: textoFinal });
      }
    }

    return NextResponse.json({ error: 'La IA devolvió una respuesta vacía' }, { status: 500 });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error de red interno' }, { status: 500 });
  }
}
