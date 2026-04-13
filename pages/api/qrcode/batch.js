import QRCode from 'qrcode';

const QR_OPTIONS = {
  width: 300,
  margin: 2,
  color: { dark: '#1a1a2e', light: '#ffffff' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Envie um array de URLs.' });
  }

  const MAX_BATCH = 50;
  const list = urls.slice(0, MAX_BATCH).map(u => u.trim()).filter(Boolean);

  try {
    const results = await Promise.all(
      list.map(async (url) => {
        const [qrCode, svg] = await Promise.all([
          QRCode.toDataURL(url, QR_OPTIONS),
          QRCode.toString(url, { ...QR_OPTIONS, type: 'svg' }),
        ]);
        return { url, qrCode, svg };
      })
    );
    res.json({ results });
  } catch {
    res.status(500).json({ error: 'Erro ao gerar QR Codes.' });
  }
}
