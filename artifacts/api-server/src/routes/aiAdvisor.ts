import { Router, type Request, type Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

router.post("/ai-advisor/analyze", async (req: Request, res: Response) => {
  try {
    const { scenarioData, businessType, moduleName } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not configured
      return res.json({
        summary: `Analisis cerdas untuk ${businessType || "bisnis jasa"} pada modul ${moduleName || "finansial"}.`,
        strengths: [
          "Perhitungan struktur angka telah konsisten.",
          "Memiliki gambaran target operasional harian yang jelas.",
        ],
        risks: [
          "Perhatikan fluktuasi biaya bahan baku dan komisi staf.",
          "Pastikan batas utilisasi jam kerja karyawan tidak melebihi 85%.",
        ],
        recommendations: [
          "Lakukan evaluasi ulang harga jual secara berkala setiap 3-6 bulan.",
          "Dorong staf untuk melakukan upselling produk pendukung untuk menaikkan average ticket size.",
          "Pantau terus retensi pelanggan dengan memberikan program loyalitas.",
        ],
        isFallback: true,
      });
    }

    const prompt = `Anda adalah seorang Konsultan Bisnis Jasa (Barbershop, Salon, Spa, Klinik Estetika) berpengalaman di Indonesia.
Analisis data simulasi finansial berikut:
- Modul Simulasi: ${moduleName || "Target Finansial"}
- Jenis Bisnis: ${businessType || "Bisnis Jasa"}
- Detail Data Skenario: ${JSON.stringify(scenarioData || {})}

Berikan respon JSON murni dengan format tepat berikut:
{
  "summary": "Ringkasan analisis singkat (2-3 kalimat)",
  "strengths": ["Kekuatan 1", "Kekuatan 2"],
  "risks": ["Risiko 1", "Risiko 2"],
  "recommendations": ["Rekomendasi tindakan 1", "Rekomendasi tindakan 2", "Rekomendasi tindakan 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in AI Advisor analyze:", error);
    return res.status(500).json({
      error: "Gagal memproses analisis AI Advisor",
      message: error?.message,
    });
  }
});

router.post("/ai-advisor/announcement", async (req: Request, res: Response) => {
  try {
    const { title, details, targetAudience, tone } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        whatsappTemplate: `Halo Kak! ✨\n\nAda kabar gembira dari kami! Kami mempersembahkan *${title || "Promo Spesial"}* khusus untuk Anda.\n\n${details || "Dapatkan harga khusus & layanan terbaik!"}\n\nYuk reservasi sekarang sebelum kuota harian habis! Chat admin ya Kak 🙏`,
        instagramCaption: `✨ *${title || "PROMO SPESIAL"}* ✨\n\n${details || "Solusi perawatan terbaik untuk Anda!"}\n\n📍 Hubungi kami sekarang untuk booking tempat.\n#yastar #promobarbehop #salonkecantikan #spaindonesia`,
        posterHeadline: title || "Penawaran Spesial Hari Ini",
        isFallback: true,
      });
    }

    const prompt = `Buatkan draf pengumuman/pemasaran promo untuk pelanggan bisnis jasa (Salon/Barbershop/Spa/Klinik) dengan data berikut:
- Judul Promo/Penyesuaian: ${title}
- Detail / Keunggulan: ${details}
- Target Pelanggan: ${targetAudience || "Pelanggan Setia"}
- Gaya Bahasa (Tone): ${tone || "Ramah & Menarik"}

Kembalikan format JSON murni berikut:
{
  "whatsappTemplate": "Teks ramah lengkap emoji & format bold untuk WhatsApp",
  "instagramCaption": "Caption Instagram menarik lengkap dengan hashtag relevan",
  "posterHeadline": "Judul/Slogan singkat 3-6 kata untuk poster visual"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in AI Announcement generator:", error);
    return res.status(500).json({
      error: "Gagal membuat draf pengumuman AI",
      message: error?.message,
    });
  }
});

export default router;
