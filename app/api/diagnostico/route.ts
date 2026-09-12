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
        error: errorData?.error?.message || `Error del servidor externo (Status: ${resp.status})` 
      }, { status: resp.status });
    }

    const data = await resp.json();
    
    // EXTRACCIÓN PLANA Y SEGURA REVISADA CARÁCTER POR CARÁCTER
    const textoFinal = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!textoFinal) {
      return NextResponse.json({ error: 'La IA devolvió una respuesta vacía' }, { status: 500 });
    }

    return NextResponse.json({ reporte: textoFinal });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error de conexión en el backend' }, { status: 500 });
  }
}
