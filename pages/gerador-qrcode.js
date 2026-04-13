import { useState, useEffect } from 'react';
import Head from 'next/head';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import ThemeToggle from '../components/roleta/ThemeToggle';

const HISTORY_KEY = 'qrcode_history';
const THEME_KEY = 'qrcode_theme';
const MAX_HISTORY = 20;

function parseUrls(input) {
  return [...new Set(
    input
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  )];
}

function getDefaultName(url, index) {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return `qrcode-${index + 1}`;
  }
}

function sanitizeName(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'qrcode';
}

export default function GeradorQrCode() {
  const [theme, setTheme] = useState('dark');
  const [urlInput, setUrlInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(null);
  const [bulkFormats, setBulkFormats] = useState({ png: true, svg: false, pdf: false });
  const [zipping, setZipping] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) setHistory(JSON.parse(saved));
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const urls = parseUrls(urlInput);
    setPendingItems(prev => {
      const prevMap = Object.fromEntries(prev.map(p => [p.url, p.name]));
      return urls.map((url, i) => ({
        url,
        name: prevMap[url] ?? getDefaultName(url, i),
      }));
    });
  }, [urlInput]);

  const saveToHistory = (items) => {
    const entries = items.map(item => ({
      id: item.id,
      url: item.url,
      name: item.name,
      qrCode: item.qrCode,
      svg: item.svg,
      createdAt: new Date().toLocaleString('pt-BR'),
    }));
    const updated = [...entries, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const updatePendingName = (url, name) => {
    setPendingItems(prev => prev.map(p => p.url === url ? { ...p, name } : p));
  };

  const handleGenerate = async () => {
    if (pendingItems.length === 0) {
      setError('Digite ao menos uma URL.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/qrcode/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: pendingItems.map(p => p.url) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao gerar QR Codes.');
        return;
      }
      const items = data.results.map((r, i) => ({
        id: Date.now() + i,
        url: r.url,
        name: pendingItems[i]?.name || getDefaultName(r.url, i),
        qrCode: r.qrCode,
        svg: r.svg,
      }));
      setResults(items);
      saveToHistory(items);
    } catch {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate();
  };

  const updateName = (id, name) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, name } : r));
  };

  const makePDF = (item) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const size = 80;
    const x = (pageWidth - size) / 2;
    doc.addImage(item.qrCode, 'PNG', x, 40, size, size);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(item.url, pageWidth / 2, 130, { align: 'center', maxWidth: pageWidth - 40 });
    return doc;
  };

  const handleDownloadPNG = (item) => {
    const link = document.createElement('a');
    link.href = item.qrCode;
    link.download = `${sanitizeName(item.name)}.png`;
    link.click();
  };

  const handleDownloadSVG = (item) => {
    const blob = new Blob([item.svg], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${sanitizeName(item.name)}.svg`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleDownloadPDF = (item) => {
    makePDF(item).save(`${sanitizeName(item.name)}.pdf`);
  };

  const handleDownloadAll = async () => {
    const selected = Object.entries(bulkFormats).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      for (const item of results) {
        const name = sanitizeName(item.name);
        if (bulkFormats.png) zip.file(`png/${name}.png`, item.qrCode.split(',')[1], { base64: true });
        if (bulkFormats.svg) zip.file(`svg/${name}.svg`, item.svg);
        if (bulkFormats.pdf) {
          const pdfB64 = makePDF(item).output('datauristring').split(',')[1];
          zip.file(`pdf/${name}.pdf`, pdfB64, { base64: true });
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'qrcodes.zip';
      link.click();
      URL.revokeObjectURL(blobUrl);
    } finally {
      setZipping(false);
    }
  };

  const handleCopyUrl = async (item) => {
    await navigator.clipboard.writeText(item.url);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleHistoryClick = (entry) => {
    setUrlInput(entry.url);
    setPendingItems([{ url: entry.url, name: entry.name }]);
    setResults([entry]);
    setError('');
  };

  const handleRemoveHistory = (e, id) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  return (
    <div className={`qr-page ${theme}`}>
      <Head>
        <title>Gerador de QR Code — Pontin.dev TOOLS</title>
        <meta name="description" content="Gere QR codes em PNG, SVG e PDF para uma ou múltiplas URLs de uma vez." />
      </Head>

      <div className="qr-controls-bar">
        <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      </div>

      <main className="qr-main">
        <div className="qr-card-input">
          <p className="qr-card-label">Cole uma ou mais URLs — uma por linha</p>
          <textarea
            className="url-textarea"
            placeholder={"https://exemplo.com\nhttps://outro-site.com\nhttps://mais-um.com"}
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            autoFocus
          />
          {pendingItems.length > 0 && (
            <div className="pending-list">
              <p className="pending-list-label">Nomes dos arquivos</p>
              {pendingItems.map((item, i) => (
                <div key={item.url} className="pending-item">
                  <span className="pending-index">{i + 1}</span>
                  <span className="pending-url" title={item.url}>{item.url}</span>
                  <input
                    className="pending-name-input"
                    value={item.name}
                    onChange={e => updatePendingName(item.url, e.target.value)}
                    placeholder="nome-do-arquivo"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="qr-card-footer">
            <span className="qr-hint">Ctrl+Enter para gerar</span>
            <button className="qr-btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? <span className="qr-spinner" /> : 'Gerar QR Codes'}
            </button>
          </div>
          {error && <p className="qr-error-msg">{error}</p>}
        </div>

        {results.length > 0 && (
          <div className="qr-results-section">
            <div className="qr-results-header">
              <h2>{results.length} QR Code{results.length > 1 ? 's' : ''}</h2>
              {results.length > 1 && (
                <div className="qr-bulk-actions">
                  <span className="qr-download-label">Baixar todos</span>
                  <div className="qr-format-checks">
                    {['png', 'svg', 'pdf'].map(fmt => (
                      <label key={fmt} className={`qr-format-check ${bulkFormats[fmt] ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          checked={bulkFormats[fmt]}
                          onChange={e => setBulkFormats(prev => ({ ...prev, [fmt]: e.target.checked }))}
                        />
                        {fmt.toUpperCase()}
                      </label>
                    ))}
                  </div>
                  <button
                    className="qr-btn-primary"
                    onClick={handleDownloadAll}
                    disabled={zipping || !Object.values(bulkFormats).some(Boolean)}
                  >
                    {zipping ? <span className="qr-spinner" /> : 'Baixar .zip'}
                  </button>
                </div>
              )}
            </div>

            <div className="qr-results-grid">
              {results.map(item => (
                <div key={item.id} className="qr-result-card">
                  <img src={item.qrCode} alt="QR Code" className="qr-card-image" />
                  <div className="qr-card-body">
                    <label className="qr-name-label">Nome do arquivo</label>
                    <input
                      className="qr-name-input"
                      value={item.name}
                      onChange={e => updateName(item.id, e.target.value)}
                      placeholder="nome-do-arquivo"
                    />
                    <p className="qr-card-url" title={item.url}>{item.url}</p>
                    <div className="qr-card-actions">
                      <div className="qr-download-btns">
                        <button className="qr-btn-download" onClick={() => handleDownloadPNG(item)}>PNG</button>
                        <button className="qr-btn-download" onClick={() => handleDownloadSVG(item)}>SVG</button>
                        <button className="qr-btn-download" onClick={() => handleDownloadPDF(item)}>PDF</button>
                      </div>
                      <button
                        className={`qr-btn-copy ${copied === item.id ? 'copied' : ''}`}
                        onClick={() => handleCopyUrl(item)}
                      >
                        {copied === item.id ? 'Copiado!' : 'Copiar URL'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="qr-history">
            <div className="qr-history-header">
              <h2>Histórico</h2>
              <button className="qr-btn-ghost" onClick={() => {
                setHistory([]);
                localStorage.removeItem(HISTORY_KEY);
              }}>
                Limpar tudo
              </button>
            </div>
            <ul className="qr-history-list">
              {history.map(entry => (
                <li key={entry.id} className="qr-history-item" onClick={() => handleHistoryClick(entry)}>
                  <img src={entry.qrCode} alt="QR" className="qr-history-thumb" />
                  <div className="qr-history-info">
                    <span className="qr-history-name">{entry.name}</span>
                    <span className="qr-history-url">{entry.url}</span>
                    <span className="qr-history-date">{entry.createdAt}</span>
                  </div>
                  <button
                    className="qr-btn-remove"
                    onClick={e => handleRemoveHistory(e, entry.id)}
                    title="Remover"
                  >×</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
