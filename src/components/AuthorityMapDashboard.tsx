import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  Layers,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Flame,
  CheckCircle2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../types';

interface Props {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
}

export const AuthorityMapDashboard: React.FC<Props> = ({
  complaints,
  onSelectComplaint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Map Filter states
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [wardFilter, setWardFilter] = useState<string>('All');

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
    if (wardFilter !== 'All' && !c.ward.toLowerCase().includes(wardFilter.toLowerCase())) return false;
    return true;
  });

  // Unique wards for filter dropdown
  const uniqueWards = Array.from(new Set(complaints.map((c) => c.ward)));

  // Color generator for status markers
  const getMarkerHtml = (c: Complaint) => {
    let bgColor = '#ef4444'; // Red default (Pending / Critical)
    let icon = '🔴';

    if (c.status === 'Completed') {
      bgColor = '#10b981'; // Green
      icon = '🟢';
    } else if (c.status === 'In Progress') {
      bgColor = '#f97316'; // Orange
      icon = '🟠';
    } else if (c.status === 'Not Completed') {
      bgColor = '#334155'; // Dark Slate/Black
      icon = '⚫';
    } else if (c.status === 'Escalated') {
      bgColor = '#a855f7'; // Purple
      icon = '🟣';
    } else if (c.priority === 'Critical') {
      bgColor = '#dc2626'; // Deep Red
      icon = '🔴';
    }

    return `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${bgColor};
        border: 2.5px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 11px; font-weight: bold;">
          💧
        </div>
      </div>
    `;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.6189, 77.2100],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Municipal Flood GIS',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update Markers when complaints or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    const bounds = L.latLngBounds([]);

    filteredComplaints.forEach((c) => {
      const lat = Number(c.latitude) || 28.6139;
      const lng = Number(c.longitude) || 77.2090;

      const customIcon = L.divIcon({
        className: 'custom-status-pin',
        html: getMarkerHtml(c),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; min-width: 200px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-family: monospace; font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">
              ${c.complaint_id}
            </strong>
            <span style="font-size: 10px; font-weight: bold; padding: 1px 6px; border-radius: 999px; ${
              c.status === 'Completed'
                ? 'background: #dcfce7; color: #166534;'
                : c.status === 'In Progress'
                ? 'background: #ffedd5; color: #9a3412;'
                : c.status === 'Escalated'
                ? 'background: #f3e8ff; color: #6b21a8;'
                : 'background: #fee2e2; color: #991b1b;'
            }">
              ${c.status}
            </span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #0f172a;">
            ${c.problem_type}
          </h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569; line-height: 1.3;">
            📍 ${c.address}
          </p>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-bottom: 8px;">
            <span>Priority: <strong>${c.priority}</strong></span>
            <span>${new Date(c.created_at).toLocaleDateString()}</span>
          </div>
          <button id="btn-manage-${c.complaint_id}" style="
            width: 100%;
            background: #0d9488;
            color: white;
            border: none;
            padding: 6px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
          ">
            Open Details & Triage →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-manage-${c.complaint_id}`);
        if (btn) {
          btn.onclick = () => onSelectComplaint(c);
        }
      });

      marker.addTo(layer);
      bounds.extend([lat, lng]);
    });

    if (filteredComplaints.length > 0 && mapInstanceRef.current && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [filteredComplaints]);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">🔴 Pending</option>
              <option value="In Progress">🟠 In Progress</option>
              <option value="Completed">🟢 Completed</option>
              <option value="Not Completed">⚫ Not Completed</option>
              <option value="Escalated">🟣 Escalated</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Ward Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Ward:</span>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Municipal Wards</option>
              {uniqueWards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter & Legend Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Plotting {filteredComplaints.length} of {complaints.length} Incidents
          </span>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-md">
        <div ref={mapContainerRef} className="h-[520px] w-full z-0 bg-slate-100" />

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-lg text-[11px] space-y-1.5 pointer-events-auto">
          <span className="font-extrabold text-slate-800 block text-xs border-b pb-1">
            GIS Pin Color Key:
          </span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span>🔴 Pending / Critical</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
              <span>🟠 In Progress</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>🟢 Completed</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
              <span>⚫ Not Completed</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 col-span-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              <span>🟣 Escalated to Level 2-4</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
