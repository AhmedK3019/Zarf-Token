import React, { useState } from "react";

export default function GenerateQR() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [qrSrc, setQrSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // payload to encode in QR: a small JSON string
  const makePayload = () =>
    JSON.stringify({ name: name.trim(), email: email.trim() });

  const generate = async () => {
    setError(null);
    setCopied(false);
    setLoading(true);
    const payload = makePayload();
    try {
      // use the installed 'qrcode' library (dynamic import) when available
      const qrcode = await import("qrcode");
      const dataUrl = await qrcode.toDataURL(payload, {
        margin: 2,
        width: 360,
      });
      setQrSrc(dataUrl);
    } catch (err) {
      // fallback to Google Chart API if local lib not available
      try {
        const encoded = encodeURIComponent(payload);
        const url = `https://chart.googleapis.com/chart?cht=qr&chs=360x360&chl=${encoded}&chld=L|1`;
        setQrSrc(url);
      } catch (err2) {
        setError("QR generation failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!qrSrc) return;
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = `${(name || "qr").replace(/\s+/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(makePayload());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("copy failed", err);
      setCopied(false);
    }
  };

  return (
    <div className="w-full max-w-5xl">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-[#4C3BCF]">
          Generate QR Code
        </h2>
        <p className="text-sm text-[#312A68]">
          Create downloadable QR codes for vendors or reps.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 block w-full rounded-md border border-gray-200 p-3 focus:ring-2 focus:ring-[#736CED]"
            placeholder="Vendor or representative name"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 block w-full rounded-md border border-gray-200 p-3 focus:ring-2 focus:ring-[#736CED]"
            placeholder="vendor@example.com"
            type="email"
          />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={generate}
              disabled={loading || (!name && !email)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#736CED] to-[#A594F9] text-white px-4 py-2 shadow hover:brightness-105 disabled:opacity-50"
            >
              {loading ? (
                <span className="text-sm">Generating…</span>
              ) : (
                <span className="text-sm">Generate QR</span>
              )}
            </button>

            <button
              onClick={download}
              disabled={!qrSrc}
              className="rounded-full border border-[#736CED] text-[#736CED] px-4 py-2 hover:bg-[#736CED]/5 disabled:opacity-50"
            >
              Download PNG
            </button>

            <button
              onClick={copyPayload}
              disabled={!name && !email}
              className={`rounded-full px-3 py-2 text-sm ${
                copied
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-800"
              } disabled:opacity-50`}
            >
              {copied ? "Copied" : "Copy payload"}
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#4C3BCF]">QR Preview</h3>
            <p className="text-xs text-gray-500">PNG 360×360</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-72 h-72 rounded-lg bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
              {qrSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrSrc}
                  alt="QR code"
                  className="w-64 h-64 object-contain"
                />
              ) : (
                <div className="text-center text-sm text-gray-400">
                  No QR yet. Enter info and press Generate.
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Payload: <span className="break-words">{makePayload()}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
