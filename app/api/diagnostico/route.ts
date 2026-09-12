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

    // Configuración robusta y compatible con los servidores de Vercel
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
    
    // Extracción segura por desestructuración nativa tolerante a fallos
    const candidates = data?.candidates || [];
    if (candidates.length > 0) {
      const parts = candidates[0]?.content?.parts || [];
      if (parts.length > 0) {
        const textoFinal = parts[0]?.text || '';
        if (textoFinal) {
          return NextResponse.json({ reporte: textoFinal });
        }
      }
    }

    return NextResponse.json({ error: 'La IA no devolvió una respuesta válida' }, { status: 500 });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno en el backend' }, { status: 500 });
  }
}
