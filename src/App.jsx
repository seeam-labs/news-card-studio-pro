import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Play,
  Pause,
  Download,
  Video,
  Image as ImageIcon,
  Settings2,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  DownloadCloud,
  Type,
  Minus,
  ImagePlus,
  Camera,
  Film,
  LayoutGrid,
} from 'lucide-react';

export default function App() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [logoSrc, setLogoSrc] = useState(null);
  const [bgSrc, setBgSrc] = useState(null);
  const [showBg, setShowBg] = useState(true);

  const [videoProps, setVideoProps] = useState({ y: 360, height: 720 });
  const [logoProps, setLogoProps] = useState({ show: true, x: 360, y: 1130, size: 120 });

  const [texts, setTexts] = useState([
    { id: 1, content: "'ভাইতো ভালো খাবার-দাবারের ব্যবস্থা রেখেছেন'", x: 360, y: 110, size: 28, isBold: false },
    { id: 2, content: 'জামায়াত আমিরকে তারেক রহমান', x: 360, y: 210, size: 44, isBold: true },
  ]);

  const [dividers, setDividers] = useState([
    { id: 1, x: 360, y: 160, width: 560, thickness: 2 },
  ]);

  const [exportFormat, setExportFormat] = useState('mp4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordedExt, setRecordedExt] = useState('mp4');
  const [toastMsg, setToastMsg] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const logoImgRef = useRef(null);
  const bgImgRef = useRef(null);
  const animationRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const layoutRef = useRef({ texts, dividers, videoProps, logoProps, showBg });
  const isRecordingRef = useRef(isRecording);

  const CANVAS_WIDTH = 720;
  const CANVAS_HEIGHT = 1280;

  useEffect(() => {
    layoutRef.current = { texts, dividers, videoProps, logoProps, showBg };
    drawFrame();
  }, [texts, dividers, videoProps, logoProps, showBg]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    if (logoSrc) {
      const img = new Image();
      img.src = logoSrc;
      img.onload = () => {
        logoImgRef.current = img;
        drawFrame();
      };
    } else {
      logoImgRef.current = null;
      drawFrame();
    }
  }, [logoSrc]);

  useEffect(() => {
    if (bgSrc) {
      const img = new Image();
      img.src = bgSrc;
      img.onload = () => {
        bgImgRef.current = img;
        drawFrame();
      };
    } else {
      bgImgRef.current = null;
      drawFrame();
    }
  }, [bgSrc]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const saveSettings = () => {
    const config = { texts, dividers, videoProps, logoProps, showBg };
    localStorage.setItem('newsCardGenSettings', JSON.stringify(config));
    showToast('সেটিংস সেভ করা হয়েছে!');
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('newsCardGenSettings');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.texts) setTexts(config.texts);
        if (config.dividers) setDividers(config.dividers);
        if (config.videoProps) setVideoProps(config.videoProps);
        if (config.logoProps) setLogoProps(config.logoProps);
        if (config.showBg !== undefined) setShowBg(config.showBg);
        showToast('সেটিংস লোড করা হয়েছে!');
      } catch (e) {
        showToast('সেটিংস লোড করতে সমস্যা হয়েছে।');
      }
    } else {
      showToast('কোনো সেভ করা সেটিংস পাওয়া যায়নি!');
    }
  };

  const handleFileUpload = (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setter(url);
    if (setter === setVideoSrc) {
      setRecordedVideoUrl(null);
      setIsPlaying(false);
    }
  };

  const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = `${line}${words[n]} `;
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line.trim(), x, currentY);
        line = `${words[n]} `;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const video = videoRef.current;
    const currentLayout = layoutRef.current;

    if (currentLayout.showBg) {
      if (bgImgRef.current) {
        ctx.drawImage(bgImgRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = 'rgba(0, 0, 15, 0.4)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, '#1e3a8a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    const targetW = CANVAS_WIDTH;
    const targetH = parseInt(currentLayout.videoProps.height, 10);
    const yPos = parseInt(currentLayout.videoProps.y, 10);
    const targetRatio = targetW / targetH;

    if (video && video.readyState >= 2) {
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;
      const vRatio = vWidth / vHeight;
      let sx;
      let sy;
      let sWidth;
      let sHeight;

      if (vRatio > targetRatio) {
        sHeight = vHeight;
        sWidth = vHeight * targetRatio;
        sx = (vWidth - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = vWidth;
        sHeight = vWidth / targetRatio;
        sx = 0;
        sy = (vHeight - sHeight) / 2;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, yPos - 2, CANVAS_WIDTH, targetH + 4);
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, yPos, targetW, targetH);
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, yPos, CANVAS_WIDTH, targetH);
      ctx.fillStyle = '#4b5563';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VIDEO AREA', CANVAS_WIDTH / 2, yPos + targetH / 2);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    currentLayout.texts.forEach((t) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = `${t.isBold ? 'bold ' : ''}${parseInt(t.size, 10)}px "Hind Siliguri", Arial, sans-serif`;
      wrapText(ctx, t.content, parseInt(t.x, 10), parseInt(t.y, 10), CANVAS_WIDTH - 40, parseInt(t.size, 10) * 1.4);
    });

    currentLayout.dividers.forEach((d) => {
      const divWidthInt = parseInt(d.width, 10);
      const divStartX = parseInt(d.x, 10) - divWidthInt / 2;
      const divY = parseInt(d.y, 10);

      ctx.beginPath();
      ctx.moveTo(divStartX, divY);
      ctx.lineTo(divStartX + divWidthInt, divY);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = parseInt(d.thickness, 10);
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });

    if (currentLayout.logoProps.show && logoImgRef.current) {
      const maxLogoWidth = 350;
      const maxLogoHeight = parseInt(currentLayout.logoProps.size, 10);
      let logoW = logoImgRef.current.width;
      let logoH = logoImgRef.current.height;

      if (logoW > maxLogoWidth) {
        logoH = (logoH * maxLogoWidth) / logoW;
        logoW = maxLogoWidth;
      }
      if (logoH > maxLogoHeight) {
        logoW = (logoW * maxLogoHeight) / logoH;
        logoH = maxLogoHeight;
      }

      const logoX = parseInt(currentLayout.logoProps.x, 10) - logoW / 2;
      ctx.drawImage(logoImgRef.current, logoX, parseInt(currentLayout.logoProps.y, 10), logoW, logoH);
    } else if (currentLayout.logoProps.show && !logoImgRef.current) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 30px Arial';
      ctx.fillText('LOGO', parseInt(currentLayout.logoProps.x, 10), parseInt(currentLayout.logoProps.y, 10) + 20);
    }

    if (video && !video.paused && !video.ended && !isRecordingRef.current) {
      animationRef.current = requestAnimationFrame(drawFrame);
    }

    if (isRecordingRef.current && video && video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      setRecordingProgress(Number.isFinite(progress) ? progress : 0);
      animationRef.current = requestAnimationFrame(drawFrame);
    }
  };

  const togglePlay = () => {
    if (!videoSrc || !videoRef.current) return;
    const video = videoRef.current;
    if (video.paused || video.ended) {
      video.play();
      setIsPlaying(true);
      drawFrame();
    } else {
      video.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
    }
  };

  const addText = () =>
    setTexts([...texts, { id: Date.now(), content: 'নতুন টেক্সট', x: 360, y: 300, size: 36, isBold: false }]);
  const removeText = (id) => setTexts(texts.filter((t) => t.id !== id));
  const updateText = (id, key, val) => setTexts(texts.map((t) => (t.id === id ? { ...t, [key]: val } : t)));

  const addDivider = () =>
    setDividers([...dividers, { id: Date.now(), x: 360, y: 300, width: 400, thickness: 2 }]);
  const removeDivider = (id) => setDividers(dividers.filter((d) => d.id !== id));
  const updateDivider = (id, key, val) => setDividers(dividers.map((d) => (d.id === id ? { ...d, [key]: val } : d)));

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleGenerate = () => {
    if (!videoSrc || !videoRef.current || !canvasRef.current) return;

    if (exportFormat === 'jpg') {
      drawFrame();
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `news-card-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    setIsRecording(true);
    setRecordedVideoUrl(null);
    chunksRef.current = [];
    setRecordingProgress(0);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    video.currentTime = 0;

    const canvasStream = canvas.captureStream(30);
    let finalStream = canvasStream;
    try {
      const videoStream = video.captureStream ? video.captureStream() : video.mozCaptureStream ? video.mozCaptureStream() : null;
      if (videoStream && videoStream.getAudioTracks().length > 0) {
        finalStream = new MediaStream([canvasStream.getVideoTracks()[0], ...videoStream.getAudioTracks()]);
      }
    } catch (e) {
      console.warn('Audio capture failed', e);
    }

    const options = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'];
    const selectedMimeType = options.find((type) => MediaRecorder.isTypeSupported(type)) || '';
    setRecordedExt(selectedMimeType.includes('mp4') ? 'mp4' : 'webm');

    try {
      mediaRecorderRef.current = new MediaRecorder(finalStream, selectedMimeType ? { mimeType: selectedMimeType } : undefined);
    } catch (error) {
      mediaRecorderRef.current = new MediaRecorder(finalStream);
    }

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      if (chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current.mimeType || 'video/mp4' });
        setRecordedVideoUrl(URL.createObjectURL(blob));
      }
      setIsRecording(false);
      setIsPlaying(false);
      setRecordingProgress(100);
    };

    mediaRecorderRef.current.start(250);
    video.play();
    setIsPlaying(true);
    drawFrame();
  };

  const handleDownloadVideo = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `news-reel.${recordedExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6 font-sans text-gray-800">
      {toastMsg && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="font-medium text-sm">{toastMsg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
              <Video className="w-6 h-6 text-blue-600" />
              নিউজ কার্ড স্টুডিও প্রো
            </h1>
            <p className="text-gray-500 text-xs mt-1">কাস্টম ভিডিও রিলস ও শর্টস তৈরি করার টুল</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadSettings}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition"
            >
              <DownloadCloud className="w-4 h-4" /> সেটিংস লোড
            </button>
            <button
              onClick={saveSettings}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-semibold transition"
            >
              <Save className="w-4 h-4" /> সেটিংস সেভ
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <details className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" open>
              <summary className="flex items-center justify-between p-4 font-semibold cursor-pointer bg-slate-50">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" /> মিডিয়া আপলোড
                </div>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <div className="p-4 border-t border-gray-100 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">১. মূল ভিডিও</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, setVideoSrc)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">২. লোগো</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setLogoSrc)}
                      className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">৩. ব্যাকগ্রাউন্ড</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setBgSrc)}
                      className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700"
                    />
                  </div>
                </div>
              </div>
            </details>

            <details className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <summary className="flex items-center justify-between p-4 font-semibold cursor-pointer bg-slate-50">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-indigo-600" /> ভিডিও ও লোগো লেআউট
                </div>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <div className="p-4 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-5">
                <div>
                  <label className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                    <span>ভিডিও Y</span> <span>{videoProps.y}px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={videoProps.y}
                    onChange={(e) => setVideoProps({ ...videoProps, y: e.target.value })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                    <span>ভিডিও সাইজ (Height)</span> <span>{videoProps.height}px</span>
                  </label>
                  <input
                    type="range"
                    min="300"
                    max="1280"
                    value={videoProps.height}
                    onChange={(e) => setVideoProps({ ...videoProps, height: e.target.value })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                    <span>লোগো X</span> <span>{logoProps.x}px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="720"
                    value={logoProps.x}
                    onChange={(e) => setLogoProps({ ...logoProps, x: e.target.value })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                    <span>লোগো Y</span> <span>{logoProps.y}px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1280"
                    value={logoProps.y}
                    onChange={(e) => setLogoProps({ ...logoProps, y: e.target.value })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                    <span>লোগো সাইজ</span> <span>{logoProps.size}px</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="400"
                    value={logoProps.size}
                    onChange={(e) => setLogoProps({ ...logoProps, size: e.target.value })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logoProps.show}
                      onChange={(e) => setLogoProps({ ...logoProps, show: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    লোগো দেখান
                  </label>
                </div>
              </div>
            </details>

            <details className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" open>
              <summary className="flex items-center justify-between p-4 font-semibold cursor-pointer bg-slate-50">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-green-600" /> টেক্সট এলিমেন্ট ({texts.length})
                </div>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <div className="p-4 border-t border-gray-100 space-y-4 max-h-[500px] overflow-y-auto">
                {texts.map((t, index) => (
                  <div key={t.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg relative">
                    <button
                      onClick={() => removeText(t.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-gray-400 mb-2 block">টেক্সট #{index + 1}</span>
                    <textarea
                      rows="2"
                      value={t.content}
                      onChange={(e) => updateText(t.id, 'content', e.target.value)}
                      className="w-full p-2 mb-3 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      placeholder="টেক্সট লিখুন..."
                    />
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                          <span>X পজিশন</span> <span>{t.x}px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="720"
                          value={t.x}
                          onChange={(e) => updateText(t.id, 'x', e.target.value)}
                          className="w-full h-1 bg-gray-300 rounded appearance-none"
                        />
                      </div>
                      <div>
                        <label className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                          <span>Y পজিশন</span> <span>{t.y}px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1280"
                          value={t.y}
                          onChange={(e) => updateText(t.id, 'y', e.target.value)}
                          className="w-full h-1 bg-gray-300 rounded appearance-none"
                        />
                      </div>
                      <div>
                        <label className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                          <span>ফন্ট সাইজ</span> <span>{t.size}px</span>
                        </label>
                        <input
                          type="range"
                          min="15"
                          max="100"
                          value={t.size}
                          onChange={(e) => updateText(t.id, 'size', e.target.value)}
                          className="w-full h-1 bg-gray-300 rounded appearance-none"
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer bg-white px-2 py-1 rounded border">
                          <input
                            type="checkbox"
                            checked={t.isBold}
                            onChange={(e) => updateText(t.id, 'isBold', e.target.checked)}
                            className="rounded"
                          />
                          বোল্ড ফন্ট
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addText}
                  className="w-full py-2.5 border-2 border-dashed border-green-300 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg flex justify-center items-center gap-2 text-sm font-bold transition"
                >
                  <Plus className="w-4 h-4" /> নতুন টেক্সট যুক্ত করুন
                </button>
              </div>
            </details>

            <details className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <summary className="flex items-center justify-between p-4 font-semibold cursor-pointer bg-slate-50">
                <div className="flex items-center gap-2">
                  <Minus className="w-5 h-5 text-orange-600" /> ডিভাইডার / দাগ ({dividers.length})
                </div>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <div className="p-4 border-t border-gray-100 space-y-4 max-h-[400px] overflow-y-auto">
                {dividers.map((d, index) => (
                  <div key={d.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg relative">
                    <button
                      type="button"
                      onClick={() => removeDivider(d.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-gray-400 mb-2 block">দাগ #{index + 1}</span>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                          <span>X পজিশন</span> <span>{d.x}px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="720"
                          value={d.x}
                          onChange={(e) => updateDivider(d.id, 'x', e.target.value)}
                          className="w-full h-1 bg-gray-300 rounded appearance-none"
                        />
                      </div>
                      <div>
                        <label className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                          <span>Y পজিশন</span> <span>{d.y}px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1280"
                          value={d.y}
                          onChange={(e) => updateDivider(d.id, 'y', e.target.value)}
                          className="w-full h-1 bg-gray-300 rounded appearance-none"
                        />
                      </div>
                      <div>
                        <label className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                          <span>দৈর্ঘ্য (Width)</span> <span>{d.width}px</span>
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="700"
                          value={d.width}
                          onChange={(e) => updateDivider(d.id, 'width', e.target.value)}
                          className="w-full h-1 bg-gray-300 rounded appearance-none"
                        />
                      </div>
                      <div>
                        <label className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                          <span>পুরুত্ব (Thickness)</span> <span>{d.thickness}px</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={d.thickness}
                          onChange={(e) => updateDivider(d.id, 'thickness', e.target.value)}
                          className="w-full h-1 bg-gray-300 rounded appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDivider}
                  className="w-full py-2.5 border-2 border-dashed border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg flex justify-center items-center gap-2 text-sm font-bold transition"
                >
                  <Plus className="w-4 h-4" /> নতুন দাগ যুক্ত করুন
                </button>
              </div>
            </details>

            <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700 text-white">
              <div className="flex bg-slate-700 p-1 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setExportFormat('mp4')}
                  className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-semibold rounded-md transition ${
                    exportFormat === 'mp4'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Film className="w-4 h-4" /> MP4 ভিডিও
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('jpg')}
                  className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-semibold rounded-md transition ${
                    exportFormat === 'jpg'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" /> JPG ছবি
                </button>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!videoSrc || isRecording}
                className={`w-full py-3.5 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all ${
                  !videoSrc
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : exportFormat === 'jpg'
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRecording
                  ? 'ভিডিও জেনারেট হচ্ছে (অপেক্ষা করুন)...'
                  : exportFormat === 'jpg'
                  ? '📸 এক ক্লিকে JPG ডাউনলোড'
                  : '🎬 ফাইনাল ভিডিও তৈরি করুন'}
              </button>

              {isRecording && (
                <div className="mt-4">
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${recordingProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-red-300">ভিডিও রেকর্ড হচ্ছে...</p>
                </div>
              )}

              {recordedVideoUrl && !isRecording && exportFormat === 'mp4' && (
                <div className="mt-4 p-4 bg-green-900/50 border border-green-700 rounded-lg text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <button
                    type="button"
                    onClick={handleDownloadVideo}
                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold transition w-full"
                  >
                    <Download className="w-4 h-4" /> ভিডিও ডাউনলোড ({recordedExt})
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 w-full flex flex-col items-center sticky top-6">
              <div className="w-full flex justify-between items-center mb-4 px-2">
                <h2 className="text-lg font-bold text-gray-800">লাইভ প্রিভিউ</h2>
                <label className="flex items-center gap-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={showBg}
                    onChange={(e) => setShowBg(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  ব্যাকগ্রাউন্ড অন
                </label>
              </div>

              {videoSrc && (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="hidden"
                  playsInline
                  onLoadedData={() => drawFrame()}
                  onEnded={() => {
                    setIsPlaying(false);
                    if (isRecordingRef.current) stopRecording();
                  }}
                />
              )}

              <div className="relative group rounded-lg overflow-hidden shadow-2xl bg-black border border-gray-800" style={{ width: '100%', maxWidth: '380px', aspectRatio: '9 / 16' }}>
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                />

                {videoSrc && (
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity pointer-events-none ${isPlaying ? 'opacity-0' : 'opacity-100 group-hover:opacity-100'}`}>
                    <div className="bg-white/90 text-slate-800 p-4 rounded-full shadow-2xl backdrop-blur-sm">
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </div>
                  </div>
                )}

                {!videoSrc && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none p-6 text-center bg-gray-900/80">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-50 text-blue-400" />
                    <p className="font-bold text-lg text-white">প্রিভিউ দেখতে ভিডিও আপলোড করুন</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
