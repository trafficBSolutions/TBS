import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '../constants/constantapi';
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
  { type: 'sign', label: 'Sign', emoji: '🪧', markerStyle: 'sign-marker' },
  { type: 'flagger', label: 'Flagger', emoji: '🧑', markerStyle: 'flagger-marker' },
  { type: 'messageBoard', label: 'Message Board', emoji: '📺', markerStyle: 'board-marker' },
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
const pixelToLatLng = (overlay, x, y) => {
  const proj = overlay.getProjection();
  if (!proj) return null;
  const topRight = proj.fromLatLngToContainerPixel(overlay.getMap().getBounds().getNorthEast());
  const bottomLeft = proj.fromLatLngToContainerPixel(overlay.getMap().getBounds().getSouthWest());
  // fromContainerPixelToLatLng takes a google.maps.Point
  return proj.fromContainerPixelToLatLng(new window.google.maps.Point(x, y));
};

// Helper: LatLng → pixel (relative to map container)
const latLngToPixel = (overlay, lat, lng) => {
  const proj = overlay.getProjection();
  if (!proj) return null;
  const pt = proj.fromLatLngToContainerPixel(new window.google.maps.LatLng(lat, lng));
  return pt ? { x: pt.x, y: pt.y } : null;
};

const TCPDesigner = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const overlayRef = useRef(null);
  const canvasRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapMoveKey, setMapMoveKey] = useState(0); // triggers re-render on map pan/zoom
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

  // Load Google Maps + create OverlayView for projection access
  useEffect(() => {
    const init = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 35.0689, lng: -85.0481 },
        zoom: 15,
        mapTypeId: 'hybrid',
        disableDefaultUI: false,
        gestureHandling: 'greedy',
      });
      mapInstanceRef.current = map;

      // Create a dummy OverlayView just to access its projection
      const overlay = new window.google.maps.OverlayView();
      overlay.onAdd = () => {};
      overlay.draw = () => {};
      overlay.onRemove = () => {};
      overlay.setMap(map);
      overlayRef.current = overlay;

      // Re-render items/lines whenever map moves
      map.addListener('idle', () => setMapMoveKey(k => k + 1));
      map.addListener('zoom_changed', () => setMapMoveKey(k => k + 1));

      setMapLoaded(true);
    };
    if (window.google?.maps) { init(); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
    script.async = true;
    script.onload = init;
    document.body.appendChild(script);
  }, []);

  const geocodeAddress = useCallback(() => {
    const { projectAddress, city, state, zip } = planInfo;
    if (!projectAddress || !window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: `${projectAddress}, ${city}, ${state} ${zip}` }, (results, status) => {
      if (status === 'OK' && results[0]) {
        mapInstanceRef.current?.setCenter(results[0].geometry.location);
        mapInstanceRef.current?.setZoom(17);
      }
    });
  }, [planInfo]);

  // Convert item lat/lng to pixel for rendering
  const getItemPixel = (item) => {
    if (!overlayRef.current?.getProjection()) return null;
    return latLngToPixel(overlayRef.current, item.lat, item.lng);
  };

  // Convert line lat/lng points to pixel for canvas drawing
  const lineToPixels = (line) => {
    if (!overlayRef.current?.getProjection()) return [];
    return line.points.map(p => latLngToPixel(overlayRef.current, p.lat, p.lng)).filter(Boolean);
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
      const mPts = measurePoints.map(p => latLngToPixel(overlayRef.current, p.lat, p.lng)).filter(Boolean);
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
    const overlay = overlayRef.current;
    if (!overlay?.getProjection()) { setCurrentLine(null); return; }

    // Convert pixel points → lat/lng for permanent storage
    const geoPoints = currentLine.points.map(pt => {
      const ll = pixelToLatLng(overlay, pt.x, pt.y);
      return ll ? { lat: ll.lat(), lng: ll.lng() } : null;
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
    let best = null, bestDist = threshold;
    items.forEach(item => {
      const px = getItemPixel(item);
      if (!px) return;
      const d = Math.hypot(px.x - x, px.y - y);
      if (d < bestDist) { bestDist = d; best = { lat: item.lat, lng: item.lng, label: item.label || item.type }; }
    });
    return best;
  };

  // --- Measure click handler ---
  const handleMeasureClick = (e) => {
    const overlay = overlayRef.current;
    if (!overlay?.getProjection()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const snapped = snapToItem(x, y);
    const ll = snapped || (() => { const p = pixelToLatLng(overlay, x, y); return p ? { lat: p.lat(), lng: p.lng() } : null; })();
    if (!ll) return;

    if (measurePoints.length === 0) {
      setMeasurePoints([ll]);
      setMeasureDistanceFt(null);
    } else {
      const p1 = new window.google.maps.LatLng(measurePoints[0].lat, measurePoints[0].lng);
      const p2 = new window.google.maps.LatLng(ll.lat, ll.lng);
      const meters = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
      const feet = meters * 3.28084;
      setMeasurePoints([measurePoints[0], ll]);
      setMeasureDistanceFt(Math.round(feet));
    }
  };

  // --- Place item (click on map area → convert pixel to lat/lng) ---
  const handleMapClick = (e) => {
    if (measureMode) { handleMeasureClick(e); return; }
    if (drawMode || !dragItem || dragItem.placed) return;
    const overlay = overlayRef.current;
    if (!overlay?.getProjection()) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ll = pixelToLatLng(overlay, x, y);
    if (!ll) return;

    const newItem = {
      id: Date.now(),
      type: dragItem.type,
      label: dragItem.label,
      emoji: dragItem.emoji,
      lat: ll.lat(),
      lng: ll.lng(),
      signType: dragItem.type === 'sign' ? SIGN_TYPES[0] : undefined,
      msgLine1: '', msgLine2: '',
    };
    setPlacedItems(prev => ({
      ...prev,
      [phaseId]: [...(prev[phaseId] || []), newItem],
    }));
    setDragItem(null);
  };

  // --- Drag placed items (move in lat/lng) ---
  const startDragPlaced = (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    const px = getItemPixel(item);
    if (!px) return;
    const rect = mapRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - px.x, y: e.clientY - px.y });
    setDragItem({ ...item, placed: true });
  };

  const handleMapMouseMove = (e) => {
    if (!dragItem?.placed) return;
    const overlay = overlayRef.current;
    if (!overlay?.getProjection()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x + 16; // +16 to center
    const y = e.clientY - rect.top - dragOffset.y + 16;
    const ll = pixelToLatLng(overlay, x, y);
    if (!ll) return;
    setPlacedItems(prev => ({
      ...prev,
      [phaseId]: (prev[phaseId] || []).map(it =>
        it.id === dragItem.id ? { ...it, lat: ll.lat(), lng: ll.lng() } : it
      ),
    }));
  };

  const handleMapMouseUp = () => {
    if (dragItem?.placed) setDragItem(null);
  };

  const removeItem = (id) => {
    setPlacedItems(prev => ({
      ...prev,
      [phaseId]: (prev[phaseId] || []).filter(it => it.id !== id),
    }));
  };

  const updateItemProp = (id, key, val) => {
    setPlacedItems(prev => ({
      ...prev,
      [phaseId]: (prev[phaseId] || []).map(it => it.id === id ? { ...it, [key]: val } : it),
    }));
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
          onClick={handleMapClick}
          onMouseMove={handleMapMouseMove}
          onMouseUp={handleMapMouseUp}
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
          {/* Render placed items at their pixel position derived from lat/lng */}
          {(placedItems[phaseId] || []).map(item => {
            const px = getItemPixel(item);
            if (!px) return null;
            return (
              <div
  key={item.id}
  className="tcp-draggable"
  style={{ left: px.x - 22, top: px.y - 52 }}
  onMouseDown={(e) => startDragPlaced(e, item)}
>
  <button
    className="remove-icon"
    onClick={(e) => {
      e.stopPropagation();
      removeItem(item.id);
    }}
  >
    ×
  </button>

  <div className={`tcp-marker ${item.markerStyle}`}>
    <div className="tcp-marker-circle">
      <img src={item.svgSrc} alt={item.label} className="tcp-marker-svg" draggable={false} />
    </div>
    <div className="tcp-marker-pointer" />
  </div>

  {item.type === 'sign' && (
    <select
      value={item.signType}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onChange={(e) => {
        const nextType = e.target.value;
        updateItemProp(item.id, 'signType', nextType);
        updateItemProp(item.id, 'svgSrc', SIGN_ASSETS[nextType]);
      }}
      style={{ fontSize: '0.65rem', maxWidth: '130px', padding: '2px' }}
    >
      {SIGN_TYPES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )}

  {item.type === 'messageBoard' && (
    <div
      className="msg-board-inputs"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <input
        placeholder="Line 1"
        value={item.msgLine1}
        onChange={(e) => updateItemProp(item.id, 'msgLine1', e.target.value)}
      />
      <input
        placeholder="Line 2"
        value={item.msgLine2}
        onChange={(e) => updateItemProp(item.id, 'msgLine2', e.target.value)}
      />
    </div>
  )}
</div>
            );
          })}
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
