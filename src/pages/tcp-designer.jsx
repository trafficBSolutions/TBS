import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/headerviews/HeaderAdminDash';
import '../css/tcp-designer.css';
import utilityWorkAhead from '@assets/tcp/Utility Work Ahead.svg';
import bePreparedToStop from '@assets/tcp/Be Prepared to Stop.svg';
import mergeLeft from '@assets/tcp/Merge Left.svg';
import flaggerAhead from '@assets/tcp/Flagger Ahead.svg';
import roadClosedAhead from '@assets/tcp/Road Closed Ahead.svg';
import detourLeft from '@assets/tcp/Detour Left.svg';
import detourRight from '@assets/tcp/Detour Right.svg';
import detourStraight from '@assets/tcp/Detour Straight.svg';
import detourAhead from '@assets/tcp/Detour Ahead.svg';
import endDetour from '@assets/tcp/End Detour.svg';
import endRoadWork from '@assets/tcp/End Road Work.svg';
import leftLaneClosedAhead from '@assets/tcp/Left Lane Closed Ahead.svg';
import rightLaneClosedAhead from '@assets/tcp/Right Lane Closed Ahead.svg';
import oneLaneClosedAhead from '@assets/tcp/One Lane Closed Ahead.svg';
import twoRightLanesClosedAhead from '@assets/tcp/2 Right Lanes Closed Ahead.svg';
import twoRightLanesClosed1500 from '@assets/tcp/2 Right Lanes Closed 1500ft.svg';
import twoRightLanesClosed1000 from '@assets/tcp/2 Right Lanes Closed 1000ft.svg';
import twoRightLanesClosed500 from '@assets/tcp/2 Right Lanes Closed 500ft.svg';
import twoRightLanesClosedHalfMile from '@assets/tcp/2 Right Lanes Closed Half Mile.svg';
import flaggerStop from '@assets/tcp/Flagger SVG Symbol With Stop.svg';
const TA_TYPES = [
  { value: 'TA-10', label: 'TA-10 - Work Beyond Shoulder' },
  { value: 'TA-22', label: 'TA-22 - Lane Closure on Two-Lane Road' },
  { value: 'TA-33', label: 'TA-33 - Lane Closure on Multi-Lane Road' },
  { value: 'TA-37', label: 'TA-37 - Multi-Lane Road Closure' },
  { value: 'Rolling Roadblock', label: 'Rolling Roadblock' },
];
export const SIGN_ASSETS = {
  'Utility Work Ahead': utilityWorkAhead,
  'Be Prepared to Stop': bePreparedToStop,
  'Merge Left Symbol': mergeLeft,
  'Flagger Ahead': flaggerAhead,
  'Road Closed Ahead': roadClosedAhead,
  'Detour Left': detourLeft,
  'Detour Right': detourRight,
  'Detour Straight': detourStraight,
  'Detour Ahead': detourAhead,
  'End Detour': endDetour,
  'End Road Work': endRoadWork,
  'Left Lane Closed Ahead': leftLaneClosedAhead,
  'Right Lane Closed Ahead': rightLaneClosedAhead,
  'One Lane Closed Ahead': oneLaneClosedAhead,
  '2 Right Lanes Closed Ahead': twoRightLanesClosedAhead,
  '2 Right Lanes Closed 1500FT': twoRightLanesClosed1500,
  '2 Right Lanes Closed 1000FT': twoRightLanesClosed1000,
  '2 Right Lanes Closed 500FT': twoRightLanesClosed500,
  '2 Right Lanes Closed 1/2 Mile': twoRightLanesClosedHalfMile,
};

const SIGN_TYPES = [
  'Utility Work Ahead', 'Be Prepared to Stop', 'Merge Left Symbol', 'Flagger Ahead',
  'Road Closed Ahead', 'Detour Left', 'Detour Right', 'Detour Straight',
  'Right Lane Closed Ahead', 'Left Lane Closed Ahead', 'One Lane Closed Ahead',
  '2 Right Lanes Closed Ahead', '2 Right Lanes Closed 1500FT', '2 Right Lanes Closed 500FT',
  '2 Right Lanes Closed 1000FT', '2 Right Lanes Closed 1/2 Mile',
  'Detour Ahead', 'End Detour', 'End Road Work',
];

const DRAGGABLE_ITEMS = [
  { type: 'sign', label: 'Sign', emoji: '🪧', markerStyle: 'gold-pin' },
  { type: 'flagger', label: 'Flagger', emoji: '🧑', markerStyle: 'flagger-pin' },
  { type: 'messageBoard', label: 'Message Board', emoji: '📺', markerStyle: 'hazard-pin' },
];

const DRAW_MODES = [
  { mode: 'buffer', label: 'Buffer (Yellow)', color: '#f1c40f' },
  { mode: 'taper', label: 'Taper (Orange)', color: '#e67e22' },
  { mode: 'crossing', label: 'Crossing (Green)', color: '#27ae60' },
];

const TAPER_DEVICE_OPTIONS = ['CONES', 'BARRELS'];

const emptyPhase = () => ({
  id: Date.now(),
  taType: 'TA-10',
  description: '',
  speedLimit: '45',
  totalSigns: '',
  signSpacing: '350',
  roadSignSpacing: '100',
  arrowBoards: '1',
  totalFlaggers: '',
  totalCrews: '',
  workspaceMin: '100',
  workspaceMax: '300',
  taperDevice: 'CONES',
  coneSpacingTaper: '45',
  coneSpacingPast: '90',
  bufferSpace: '360',
  taperLength: '540',
  stopSightDistance: '540',
  signCounts: Object.fromEntries(SIGN_TYPES.map(s => [s, 0])),
});

// Helper: pixel (relative to map container) → LatLng
const pixelToLatLng = (map, x, y) => {
  if (!map) return null;
  return map.containerPointToLatLng(L.point(x, y));
};

// Helper: LatLng → pixel (relative to map container)
const latLngToPixel = (map, lat, lng) => {
  if (!map) return null;
  const pt = map.latLngToContainerPoint(L.latLng(lat, lng));
  return { x: pt.x, y: pt.y };
};

const TCPDesigner = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const canvasRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapMoveKey, setMapMoveKey] = useState(0);
  const leafletMarkersRef = useRef({}); // { [itemId]: L.marker }
  const [planInfo, setPlanInfo] = useState({
    projectAddress: '', city: '', state: 'TN', zip: '',
    prismId: '', roadName: '', email: 'tbsolutions9@gmail.com',
  });

  const [phases, setPhases] = useState([emptyPhase()]);
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);

  // Items stored with lat/lng
  const [placedItems, setPlacedItems] = useState({ [phases[0].id]: [] });

  // Lines stored with lat/lng points
  const [drawMode, setDrawMode] = useState(null);
  const [lines, setLines] = useState({ [phases[0].id]: [] });
  const [currentLine, setCurrentLine] = useState(null); // pixel-based while drawing, converted on mouseUp

  const [dragItem, setDragItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  // Measure tool state
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]); // [{lat,lng,px}]
  const [measureDistanceFt, setMeasureDistanceFt] = useState(null);

  const activePhase = phases[activePhaseIdx];
  const phaseId = activePhase?.id;

  // Load Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: [35.0689, -85.0481],
      zoom: 15,
    });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri',
    }).addTo(map);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
      attribution: '',
    }).addTo(map);
    mapInstanceRef.current = map;

    const update = () => setMapMoveKey(k => k + 1);
    map.on('moveend', update);
    map.on('zoomend', update);

    setMapLoaded(true);
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  const geocodeAddress = useCallback(async () => {
    const { projectAddress, city, state, zip } = planInfo;
    if (!projectAddress) return;
    try {
      const q = encodeURIComponent(`${projectAddress}, ${city}, ${state} ${zip}`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`);
      const data = await res.json();
      if (data[0]) {
        mapInstanceRef.current?.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 17);
      }
    } catch (err) {
      console.error('Geocode failed:', err);
    }
  }, [planInfo]);

  // Build divIcon HTML for an item
  const buildIconHtml = (item) => {
    const inner = item.svgSrc
      ? `<img src="${item.svgSrc}" alt="${item.label}" class="tcp-marker-svg" draggable="false" />`
      : `<span style="font-size:1.2rem">${item.emoji}</span>`;

    let controls = '';
    if (item.type === 'sign') {
      const opts = SIGN_TYPES.map(s =>
        `<option value="${s}" ${s === item.signType ? 'selected' : ''}>${s}</option>`
      ).join('');
      controls = `<select class="tcp-marker-select" data-item-id="${item.id}" style="font-size:0.65rem;max-width:130px;padding:2px">${opts}</select>`;
    } else if (item.type === 'messageBoard') {
      controls = `<div class="msg-board-inputs">
        <input class="tcp-msg-input" data-item-id="${item.id}" data-field="msgLine1" placeholder="Line 1" value="${item.msgLine1 || ''}" />
        <input class="tcp-msg-input" data-item-id="${item.id}" data-field="msgLine2" placeholder="Line 2" value="${item.msgLine2 || ''}" />
      </div>`;
    }

    return `<div class="tcp-draggable-inner">
      <button class="remove-icon" data-item-id="${item.id}">×</button>
      <div class="tcp-marker ${item.markerStyle || ''}">
        <div class="tcp-marker-circle">${inner}</div>
        <div class="tcp-marker-pointer"></div>
      </div>
      ${controls}
      <span class="tcp-coords">${item.lat.toFixed(6)}, ${item.lng.toFixed(6)}</span>
    </div>`;
  };

  // Sync Leaflet markers with placedItems for the active phase
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const items = placedItems[phaseId] || [];
    const currentIds = new Set(items.map(it => it.id));
    const markers = leafletMarkersRef.current;

    // Remove markers no longer in items
    Object.keys(markers).forEach(id => {
      if (!currentIds.has(Number(id))) {
        markers[id].remove();
        delete markers[id];
      }
    });

    // Add or update markers
    items.forEach(item => {
      const icon = L.divIcon({
        className: 'tcp-leaflet-marker',
        html: buildIconHtml(item),
        iconSize: [44, 70],
        iconAnchor: [22, 56],
      });

      if (markers[item.id]) {
        markers[item.id].setLatLng([item.lat, item.lng]);
        markers[item.id].setIcon(icon);
      } else {
        const m = L.marker([item.lat, item.lng], { icon, draggable: true }).addTo(map);
        m._itemId = item.id;

        m.on('dragend', () => {
          const pos = m.getLatLng();
          setPlacedItems(prev => ({
            ...prev,
            [phaseId]: (prev[phaseId] || []).map(it =>
              it.id === item.id ? { ...it, lat: pos.lat, lng: pos.lng } : it
            ),
          }));
        });

        // Event delegation on the marker container
        const el = m.getElement();
        if (el) {
          el.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-icon');
            if (removeBtn) {
              e.stopPropagation();
              const id = Number(removeBtn.dataset.itemId);
              setPlacedItems(prev => ({
                ...prev,
                [phaseId]: (prev[phaseId] || []).filter(it => it.id !== id),
              }));
            }
          });
          el.addEventListener('change', (e) => {
            const sel = e.target.closest('.tcp-marker-select');
            if (sel) {
              const id = Number(sel.dataset.itemId);
              const nextType = sel.value;
              setPlacedItems(prev => ({
                ...prev,
                [phaseId]: (prev[phaseId] || []).map(it =>
                  it.id === id ? { ...it, signType: nextType, svgSrc: SIGN_ASSETS[nextType] } : it
                ),
              }));
            }
          });
          el.addEventListener('input', (e) => {
            const inp = e.target.closest('.tcp-msg-input');
            if (inp) {
              const id = Number(inp.dataset.itemId);
              const field = inp.dataset.field;
              setPlacedItems(prev => ({
                ...prev,
                [phaseId]: (prev[phaseId] || []).map(it =>
                  it.id === id ? { ...it, [field]: inp.value } : it
                ),
              }));
            }
          });
        }

        markers[item.id] = m;
      }
    });
  }, [placedItems, phaseId, mapLoaded]);

  // Clean up all markers when phase changes
  useEffect(() => {
    return () => {
      Object.values(leafletMarkersRef.current).forEach(m => m.remove());
      leafletMarkersRef.current = {};
    };
  }, [phaseId]);

  // Convert line lat/lng points to pixel for canvas drawing
  const lineToPixels = (line) => {
    if (!mapInstanceRef.current) return [];
    return line.points.map(p => latLngToPixel(mapInstanceRef.current, p.lat, p.lng)).filter(Boolean);
  };

  // Redraw canvas whenever map moves, lines change, or phase changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawLine = (pts, color) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.setLineDash(color === '#27ae60' ? [8, 6] : []);
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    };

    // Draw saved lines (convert lat/lng → pixel)
    const phaseLines = lines[phaseId] || [];
    phaseLines.forEach(l => {
      const pixels = lineToPixels(l);
      drawLine(pixels, l.color);
    });

    // Draw current in-progress line (already in pixels)
    if (currentLine && currentLine.points.length >= 2) {
      drawLine(currentLine.points, currentLine.color);
    }

    // Draw measure line
    if (measurePoints.length >= 1) {
      const mPts = measurePoints.map(p => latLngToPixel(mapInstanceRef.current, p.lat, p.lng)).filter(Boolean);
      if (mPts.length >= 1) {
        // Draw dots
        mPts.forEach(pt => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#3498db';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        // Draw dashed line + label
        if (mPts.length === 2 && measureDistanceFt !== null) {
          ctx.beginPath();
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = '#3498db';
          ctx.lineWidth = 3;
          ctx.moveTo(mPts[0].x, mPts[0].y);
          ctx.lineTo(mPts[1].x, mPts[1].y);
          ctx.stroke();
          ctx.setLineDash([]);
          // Label at midpoint
          const mx = (mPts[0].x + mPts[1].x) / 2;
          const my = (mPts[0].y + mPts[1].y) / 2;
          const text = `${measureDistanceFt} ft`;
          ctx.font = 'bold 14px Arial';
          const tw = ctx.measureText(text).width;
          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          ctx.fillRect(mx - tw / 2 - 6, my - 12, tw + 12, 24);
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, mx, my);
        }
      }
    }
  }, [lines, currentLine, phaseId, mapMoveKey, measurePoints, measureDistanceFt]);

  // --- Drawing handlers (pixel while drawing, convert to lat/lng on save) ---
  const handleCanvasMouseDown = (e) => {
    if (!drawMode) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const color = DRAW_MODES.find(d => d.mode === drawMode)?.color || '#fff';
    setCurrentLine({ mode: drawMode, color, points: [pt] });
  };

  const handleCanvasMouseMove = (e) => {
    if (!currentLine) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCurrentLine(prev => ({ ...prev, points: [...prev.points, pt] }));
  };

  const handleCanvasMouseUp = () => {
    if (!currentLine || currentLine.points.length < 2) { setCurrentLine(null); return; }
    const map = mapInstanceRef.current;
    if (!map) { setCurrentLine(null); return; }

    // Convert pixel points → lat/lng for permanent storage
    const geoPoints = currentLine.points.map(pt => {
      const ll = pixelToLatLng(map, pt.x, pt.y);
      return ll ? { lat: ll.lat, lng: ll.lng } : null;
    }).filter(Boolean);

    if (geoPoints.length >= 2) {
      setLines(prev => ({
        ...prev,
        [phaseId]: [...(prev[phaseId] || []), { mode: currentLine.mode, color: currentLine.color, points: geoPoints }],
      }));
    }
    setCurrentLine(null);
  };

  // --- Snap helper: find nearest placed item within threshold px ---
  const snapToItem = (x, y, threshold = 30) => {
    const items = placedItems[phaseId] || [];
    const map = mapInstanceRef.current;
    let best = null, bestDist = threshold;
    items.forEach(item => {
      if (!map) return;
      const px = latLngToPixel(map, item.lat, item.lng);
      if (!px) return;
      const d = Math.hypot(px.x - x, px.y - y);
      if (d < bestDist) { bestDist = d; best = { lat: item.lat, lng: item.lng, label: item.label || item.type }; }
    });
    return best;
  };

  // --- Measure click handler ---
  const handleMeasureClick = (e) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const snapped = snapToItem(x, y);
    const ll = snapped || (() => { const p = pixelToLatLng(map, x, y); return p ? { lat: p.lat, lng: p.lng } : null; })();
    if (!ll) return;

    if (measurePoints.length === 0) {
      setMeasurePoints([ll]);
      setMeasureDistanceFt(null);
    } else {
      const p1 = L.latLng(measurePoints[0].lat, measurePoints[0].lng);
      const p2 = L.latLng(ll.lat, ll.lng);
      const meters = p1.distanceTo(p2);
      const feet = meters * 3.28084;
      setMeasurePoints([measurePoints[0], ll]);
      setMeasureDistanceFt(Math.round(feet));
    }
  };

  // --- Place item (click on map area → convert pixel to lat/lng) ---
  const handleMapClick = (e) => {
    if (measureMode) { handleMeasureClick(e); return; }
    if (drawMode || !dragItem || dragItem.placed) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ll = pixelToLatLng(map, x, y);
    if (!ll) return;

    const defaultSignType = SIGN_TYPES[0];
    const newItem = {
      id: Date.now(),
      type: dragItem.type,
      label: dragItem.label,
      emoji: dragItem.emoji,
      markerStyle: dragItem.markerStyle,
      lat: ll.lat,
      lng: ll.lng,
      signType: dragItem.type === 'sign' ? defaultSignType : undefined,
      svgSrc: dragItem.type === 'sign' ? SIGN_ASSETS[defaultSignType]
            : dragItem.type === 'flagger' ? flaggerStop
            : undefined,
      msgLine1: '', msgLine2: '',
    };
    setPlacedItems(prev => ({
      ...prev,
      [phaseId]: [...(prev[phaseId] || []), newItem],
    }));
    setDragItem(null);
  };





  // Phase management
  const addPhase = () => {
    const np = emptyPhase();
    setPhases(prev => [...prev, np]);
    setPlacedItems(prev => ({ ...prev, [np.id]: [] }));
    setLines(prev => ({ ...prev, [np.id]: [] }));
    setActivePhaseIdx(phases.length);
  };

  const updatePhase = (key, val) => {
    setPhases(prev => prev.map((p, i) => i === activePhaseIdx ? { ...p, [key]: val } : p));
  };

  const updateSignCount = (signType, val) => {
    setPhases(prev => prev.map((p, i) =>
      i === activePhaseIdx ? { ...p, signCounts: { ...p.signCounts, [signType]: parseInt(val) || 0 } } : p
    ));
  };

  const clearDrawing = () => setLines(prev => ({ ...prev, [phaseId]: [] }));
  const undoLastLine = () => setLines(prev => ({ ...prev, [phaseId]: (prev[phaseId] || []).slice(0, -1) }));

  // Export
  const handleExport = async () => {
    setExporting(true);
    setExportMsg('');
    try {
      const canvas = canvasRef.current;
      const canvasImage = canvas?.toDataURL('image/png') || '';
      const payload = {
        planInfo,
        phases: phases.map(p => ({ ...p, items: placedItems[p.id] || [], lines: lines[p.id] || [] })),
        canvasImage,
        email: planInfo.email,
      };
      const res = await axios.post('/tcp-designer/export', payload);
      setExportMsg(res.data?.message || 'TTCP exported and emailed successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      setExportMsg(err.response?.data?.message || 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="tcp-designer">
        <h1>🚧 Traffic Control Plan Designer</h1>

        <div className="tcp-legend">
          <span><span className="legend-line legend-buffer" /> Buffer (Yellow/Gold)</span>
          <span><span className="legend-line legend-taper" /> Taper (Orange)</span>
          <span><span className="legend-line legend-crossing" /> Crossing (Green)</span>
        </div>

        {/* Toolbar */}
        <div className="tcp-toolbar">
          {DRAGGABLE_ITEMS.map(item => (
            <button
              key={item.type}
              className={dragItem?.type === item.type && !dragItem.placed ? 'active' : ''}
              onClick={() => { setDragItem(item); setDrawMode(null); }}
            >
              {item.emoji} {item.label}
            </button>
          ))}
          <div className="toolbar-divider" />
          {DRAW_MODES.map(dm => (
            <button
              key={dm.mode}
              className={drawMode === dm.mode ? 'active' : ''}
              style={drawMode === dm.mode ? { background: dm.color, borderColor: dm.color } : {}}
              onClick={() => { setDrawMode(drawMode === dm.mode ? null : dm.mode); setDragItem(null); }}
            >
              ✏️ {dm.label}
            </button>
          ))}
          <div className="toolbar-divider" />
          <button onClick={undoLastLine}>↩️ Undo Line</button>
          <button onClick={clearDrawing}>🗑️ Clear Lines</button>
          <div className="toolbar-divider" />
          <button
            className={measureMode ? 'active measure-active' : ''}
            onClick={() => {
              setMeasureMode(m => !m);
              setMeasurePoints([]);
              setMeasureDistanceFt(null);
              setDrawMode(null);
              setDragItem(null);
            }}
          >
            📏 Measure
          </button>
          {measureMode && measureDistanceFt !== null && (
            <span className="measure-result">📐 {measureDistanceFt} ft</span>
          )}
          {measureMode && (
            <button onClick={() => { setMeasurePoints([]); setMeasureDistanceFt(null); }}>
              ✖ Clear Measure
            </button>
          )}
        </div>

        {/* Map Area */}
        <div
          className="tcp-map-area"
        >
          <div ref={mapRef} className="map-container" />
          <canvas
            ref={canvasRef}
            className={`tcp-canvas-overlay ${drawMode ? 'drawing' : ''}`}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
          {/* Invisible click layer — only active when a tool is selected */}
          {(dragItem || measureMode) && (
            <div
              className="tcp-click-overlay"
              onClick={handleMapClick}
            />
          )}

        </div>

        {/* Plan Info */}
        <div className="tcp-form-section">
          <h2>📋 TTCP Plan Information</h2>
          <div className="tcp-form-grid">
            <label>Prism ID Number<input value={planInfo.prismId} onChange={e => setPlanInfo(p => ({ ...p, prismId: e.target.value }))} /></label>
            <label>Road Name<input value={planInfo.roadName} onChange={e => setPlanInfo(p => ({ ...p, roadName: e.target.value }))} placeholder="e.g. U.S Hwy 64" /></label>
            <label>Project Address<input value={planInfo.projectAddress} onChange={e => setPlanInfo(p => ({ ...p, projectAddress: e.target.value }))} placeholder="9200 AMOS RD" /></label>
            <label>City<input value={planInfo.city} onChange={e => setPlanInfo(p => ({ ...p, city: e.target.value }))} placeholder="OOLTEWAH" /></label>
            <label>State<input value={planInfo.state} onChange={e => setPlanInfo(p => ({ ...p, state: e.target.value }))} /></label>
            <label>Zip<input value={planInfo.zip} onChange={e => setPlanInfo(p => ({ ...p, zip: e.target.value }))} placeholder="37363" /></label>
            <label>Email (PDF sent here)<input value={planInfo.email} onChange={e => setPlanInfo(p => ({ ...p, email: e.target.value }))} /></label>
            <label><br />
              <button onClick={geocodeAddress} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e67e22', background: '#e67e22', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                📍 Go to Address on Map
              </button>
            </label>
          </div>
        </div>

        {/* Phases */}
        <div className="tcp-phases">
          <h2>📐 Phases</h2>
          <div className="phase-tabs">
            {phases.map((p, i) => (
              <button key={p.id} className={i === activePhaseIdx ? 'active' : ''} onClick={() => setActivePhaseIdx(i)}>
                Phase {i + 1} ({p.taType})
              </button>
            ))}
            <button className="add-phase" onClick={addPhase}>+ Add Phase</button>
          </div>
          {activePhase && (
            <div className="phase-form">
              <label>Typical Application (TA)
                <select value={activePhase.taType} onChange={e => updatePhase('taType', e.target.value)}>
                  {TA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label>Speed Limit (mph)<input type="number" value={activePhase.speedLimit} onChange={e => updatePhase('speedLimit', e.target.value)} /></label>
              <label className="full-width">Phase Description
                <textarea value={activePhase.description} onChange={e => updatePhase('description', e.target.value)} placeholder="Traffic lanes will be reduced to one lane of traffic..." />
              </label>
              <label>Total Signs<input type="number" value={activePhase.totalSigns} onChange={e => updatePhase('totalSigns', e.target.value)} /></label>
              <label>Sign Spacing (ft) Main Road<input type="number" value={activePhase.signSpacing} onChange={e => updatePhase('signSpacing', e.target.value)} /></label>
              <label>Sign Spacing (ft) Side Roads<input type="number" value={activePhase.roadSignSpacing} onChange={e => updatePhase('roadSignSpacing', e.target.value)} /></label>
              <label>Arrow Boards<input type="number" value={activePhase.arrowBoards} onChange={e => updatePhase('arrowBoards', e.target.value)} /></label>
              <label>Total Flaggers<input value={activePhase.totalFlaggers} onChange={e => updatePhase('totalFlaggers', e.target.value)} placeholder="e.g. 3-4" /></label>
              <label>Total Crews<input type="number" value={activePhase.totalCrews} onChange={e => updatePhase('totalCrews', e.target.value)} /></label>
              <label>Workspace Min (ft)<input type="number" value={activePhase.workspaceMin} onChange={e => updatePhase('workspaceMin', e.target.value)} /></label>
              <label>Workspace Max (ft)<input type="number" value={activePhase.workspaceMax} onChange={e => updatePhase('workspaceMax', e.target.value)} /></label>
              <label>Taper Device
                <select value={activePhase.taperDevice} onChange={e => updatePhase('taperDevice', e.target.value)}>
                  {TAPER_DEVICE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label>Cone Spacing - Taper (ft)<input type="number" value={activePhase.coneSpacingTaper} onChange={e => updatePhase('coneSpacingTaper', e.target.value)} /></label>
              <label>Cone Spacing - Past Taper (ft)<input type="number" value={activePhase.coneSpacingPast} onChange={e => updatePhase('coneSpacingPast', e.target.value)} /></label>
              <label>Buffer Space (ft)<input type="number" value={activePhase.bufferSpace} onChange={e => updatePhase('bufferSpace', e.target.value)} /></label>
              <label>Taper/Transition Length (ft)<input type="number" value={activePhase.taperLength} onChange={e => updatePhase('taperLength', e.target.value)} /></label>
              <label>Stop Sight Distance (ft)<input type="number" value={activePhase.stopSightDistance} onChange={e => updatePhase('stopSightDistance', e.target.value)} /></label>
              <label className="full-width" style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.5rem' }}>Sign Breakdown:</label>
              <div className="sign-count-grid">
                {SIGN_TYPES.map(s => (
                  <label key={s}>
                    <input type="number" min="0" value={activePhase.signCounts[s]} onChange={e => updateSignCount(s, e.target.value)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="tcp-export-bar">
          <button className="export-pdf" onClick={handleExport} disabled={exporting}>
            {exporting ? '⏳ Generating & Emailing PDF...' : '📄 Export PDF & Email'}
          </button>
        </div>
        {exportMsg && (
          <p style={{ textAlign: 'center', fontWeight: 700, color: exportMsg.includes('success') ? '#27ae60' : '#e74c3c', fontSize: '1.1rem' }}>
            {exportMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default TCPDesigner;
