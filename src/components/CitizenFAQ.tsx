import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Mic,
  MapPin,
  Clock,
  ShieldCheck,
  PhoneCall,
  ArrowRight,
  Copy,
  Check,
  FileText,
  LifeBuoy,
  Flame,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface CitizenFAQProps {
  onNavigateToReport?: () => void;
  onNavigateToTracking?: (docketId?: string) => void;
  onBackToDashboard?: () => void;
  isEmbedded?: boolean;
}

interface FAQItem {
  id: string;
  category: 'reporting' | 'description' | 'resolution' | 'escalation' | 'emergency';
  question: string;
  answer: string;
  keyPoints?: string[];
  tips?: string;
}

export const CitizenFAQ: React.FC<CitizenFAQProps> = ({
  onNavigateToReport,
  onNavigateToTracking,
  onBackToDashboard,
  isEmbedded = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItemIds, setOpenItemIds] = useState<string[]>(['rep-1', 'desc-1', 'res-1']);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'reporting', label: 'How to Report' },
    { id: 'description', label: 'Description & Photos' },
    { id: 'resolution', label: 'Municipal Resolution' },
    { id: 'escalation', label: 'SLAs & Escalation' },
    { id: 'emergency', label: 'Emergency Helplines' },
  ];

  const faqItems: FAQItem[] = [
    {
      id: 'rep-1',
      category: 'reporting',
      question: 'How do I submit a waterlogging or drainage complaint?',
      answer:
        'You can submit a grievance in two quick ways: either by scanning the QR code sticker placed on local street posts and electrical junction boxes, or by logging into this web platform. After logging in, click "Report New Problem", choose the specific issue (e.g. Street Inundation, Blocked Storm Drain, Submerged Manhole), attach a live photo or gallery image, allow geolocation access, and enter a brief description. You can also record a 30-second voice note.',
      keyPoints: [
        'Scan street QR code for instant ward pre-selection',
        'Upload clear photographic proof of the stagnant water',
        'Receive an instant tracking Docket ID (e.g., WL-2026-000124)',
      ],
      tips: 'Ensure location services/GPS are turned on in your mobile browser for precise dispatch accuracy.',
    },
    {
      id: 'rep-2',
      category: 'reporting',
      question: 'What are the different problem categories I can choose from?',
      answer:
        'The municipal system classifies drainage incidents into 4 primary operational categories to dispatch the correct engineering unit:',
      keyPoints: [
        'Waterlogging: Accumulation of stormwater on streets, underpasses, or residential roads exceeding 2 inches.',
        'Drainage Overflow: Silt, silt-choked gully traps, or reverse flow of drains onto pavements.',
        'Submerged Manhole: Submerged or displaced manhole lids presenting serious drowning or vehicle entrapment danger (Flagged as High Priority).',
        'Road Damage: Potholes and asphalt erosion caused by persistent stagnant stormwater.',
      ],
    },
    {
      id: 'rep-3',
      category: 'reporting',
      question: 'How does the street QR code work?',
      answer:
        'Street QR codes are affixed on designated municipal lamp posts, bus shelters, and junction boxes across each ward. When scanned with any smartphone camera, the QR code automatically encodes the Ward Number and Locality Name into your report. This eliminates manual typing and routes the docket directly to that specific ward’s field inspector.',
      tips: 'You can test different ward QR scans anytime using the "Simulate QR Scan" button in the navigation bar.',
    },
    {
      id: 'desc-1',
      category: 'description',
      question: 'What specific details should I include in the problem description?',
      answer:
        'A comprehensive description enables municipal dewatering squads to arrive with the appropriate equipment (e.g., 50HP submersible pumps, jetting vehicles, or desilting cranes). Always include estimated water depth, landmark references, and immediate hazards.',
      keyPoints: [
        'Estimated Depth: State whether water is ankle-deep (~4 inches), knee-deep (~1.5 feet), or waist-deep.',
        'Location Landmark: Mention nearby shops, metro pillars, house numbers, or junction names.',
        'Visible Obstacle: Mention if you see plastic trash choking the grates, construction debris, or a missing lid.',
        'Severity / Impact: State if traffic is stalled, basements are flooding, or school/hospital routes are blocked.',
      ],
      tips: 'Use one of our pre-formatted templates below to quickly fill in key details with one click.',
    },
    {
      id: 'desc-2',
      category: 'description',
      question: 'What are the best practices for taking photographic evidence?',
      answer:
        'Photographs provide verified visual proof for municipal engineers to assess crew deployment requirements.',
      keyPoints: [
        'Capture Perspective: Take a wide shot that shows the water level relative to a known object like car tires, sidewalk kerbs, or compound gates.',
        'Show the Drainage Inlet: If safe to do so, capture the clogged storm drain, catch basin, or gully pit.',
        'Night-time Visibility: If reporting at night, use your camera flash and stand near streetlights for clarity.',
        'Safety First: Never step into deep or fast-moving flood waters or near submerged electrical junction boxes.',
      ],
    },
    {
      id: 'desc-3',
      category: 'description',
      question: 'How does the voice recording feature help?',
      answer:
        'The built-in voice recorder (powered by the browser MediaRecorder API) is ideal for citizens on the move or in heavy rain who find typing cumbersome. Speak clearly for 15 to 30 seconds, mentioning your street name, depth, and whether vehicles are stranded. Field squad supervisors listen to this audio directly on their dispatch consoles.',
    },
    {
      id: 'res-1',
      category: 'resolution',
      question: 'How does the municipal resolution process work step-by-step?',
      answer:
        'Once submitted, every grievance flows through an auditable 5-stage lifecycle governed by municipal service level agreements (SLAs):',
      keyPoints: [
        '1. Submission: Complaint logged into the municipal database with timestamp and unique Docket ID.',
        '2. Triage & Ward Review: Ward control room verifies location and assigns severity level (High, Medium, or Low).',
        '3. Crew Assignment: Dispatched to a dedicated municipal staff squad (e.g., Stormwater Jetting Unit, Dewatering Pump Crew).',
        '4. Field Remediation: Crew deploys suction pumps, desilts drains, clears gully blocks, or secures covers.',
        '5. Verification & Resolution Proof: Crew MUST upload an "After" resolution photograph and describe the remedial action taken before the complaint can be closed.',
      ],
    },
    {
      id: 'res-2',
      category: 'resolution',
      question: 'Why does the municipality require a Before and After photo?',
      answer:
        'To prevent premature or fraudulent ticket closures, municipal regulations mandate that the resolving staff member upload a post-remediation photograph showing the cleared road or functional drain. The platform automatically displays the citizen’s original photo alongside the municipality’s completion photo for transparent side-by-side comparison.',
    },
    {
      id: 'res-3',
      category: 'resolution',
      question: 'What if the municipal crew cannot fix the problem immediately?',
      answer:
        'If a drainage line has structural collapse, requires underground excavation, or needs heavy earthmovers beyond the initial squad’s capacity, the crew marks the ticket as "Not Completed". They must document the specific bottleneck (e.g., "Major drainage line reconstruction required"), submit supporting obstacle photos, and recommend next actions.',
      tips: 'When marked "Not Completed", the ticket automatically enters the Municipal Escalation Hierarchy.',
    },
    {
      id: 'escalation-1',
      category: 'escalation',
      question: 'How does the multi-tier Escalation Hierarchy operate?',
      answer:
        'When an issue is marked unresolved or exceeds the target turnaround time, it escalates up the municipal command chain:',
      keyPoints: [
        'Level 1: Municipal Staff / Field Crew (Primary remediation, 2–6 hours target)',
        'Level 2: Ward Officer (Engineering inspection, pump reallocation, 12 hours target)',
        'Level 3: Zonal Officer (Cross-ward coordination, heavy civil desilting, 24 hours target)',
        'Level 4: Higher Municipal Authority / Commissioner (Emergency flood relief fund and high-capacity bypass)',
      ],
      tips: 'You can see the current authority level in real-time on your Tracking Page.',
    },
    {
      id: 'escalation-2',
      category: 'escalation',
      question: 'How do I rate the resolution quality and give feedback?',
      answer:
        'Once a complaint status turns to "Completed", open your complaint from the dashboard or tracking link. You will see the Before/After comparison and an interactive 1 to 5 Star Citizen Assessment form. Your rating directly scores the ward maintenance contractor and municipal squad efficiency.',
    },
    {
      id: 'emergency-1',
      category: 'emergency',
      question: 'When should I call the emergency control room instead of waiting?',
      answer:
        'Use the 24x7 Municipal Monsoon Emergency Hotline (1800-419-3312) immediately if you encounter life-threatening drainage emergencies such as an open submerged manhole on a flooded road, water entering electric substations, or torrential flooding trapping senior citizens or vehicles.',
      keyPoints: [
        '24x7 Central Disaster Control: 1800-419-3312 (Toll Free)',
        'Flood Dewatering Emergency WhatsApp: +91 98765 43210',
        'State Disaster Response Force (SDRF): 112',
      ],
    },
  ];

  const sampleTemplates = [
    {
      title: 'Roadway Waterlogging (Vehicular Hazard)',
      category: 'Waterlogging',
      text: 'Waterlogging of approximately 1.5 feet depth on Main Link Road opposite Metro Pillar 42. Stormwater drains appear clogged with construction silt. Traffic is slowing down and two-wheelers are skidding. Urgent dewatering required.',
    },
    {
      title: 'Submerged / Displaced Manhole Lid',
      category: 'Submerged Manhole',
      text: 'CRITICAL SAFETY HAZARD: Heavy stormwater accumulation of knee-depth has completely submerged a displaced manhole cover near the bus stop junction. Pedestrians cannot see the open hole. Immediate barricading and vacuum pump crew needed.',
    },
    {
      title: 'Residential Lane Drainage Overflow',
      category: 'Drainage Overflow',
      text: 'Stormwater gully trap overflowing with black stagnant water and plastic waste into residential lane #4. Water entering ground-floor parking areas. Odour and mosquito breeding concern.',
    },
  ];

  const toggleAccordion = (id: string) => {
    setOpenItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const copyTemplateToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(title);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  const filteredFaqs = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.keyPoints?.some((pt) => pt.toLowerCase().includes(query)) ||
        item.tips?.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [faqItems, selectedCategory, searchQuery]);

  return (
    <div className={`space-y-8 ${isEmbedded ? '' : 'max-w-6xl mx-auto px-4 sm:px-6 py-6'}`}>
      {/* Header & Breadcrumb */}
      {!isEmbedded && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="hover:text-teal-700 transition-colors cursor-pointer font-medium"
              >
                Citizen Portal
              </button>
              <span>/</span>
              <span className="text-teal-800 font-bold">Help & Reporting Guide</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Citizen Guidance & Municipal Resolution FAQ
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Official reference guide on reporting urban drainage hazards, crafting effective
              descriptions, and tracking municipal remediation workflows.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={onNavigateToReport}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Report Problem Now</span>
            </button>
          </div>
        </div>
      )}

      {/* QUICK FEATURE CALLOUTS (3 CARD GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: How to Report */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs hover:border-teal-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">1. Report in 90 Seconds</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Scan street QR code, take photo proof, enable GPS geotag, and upload. Docket ID
              generates instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('reporting');
              setOpenItemIds(['rep-1', 'rep-2', 'rep-3']);
            }}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Learn Reporting Steps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Description Quality */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">2. What to Include</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Estimated depth, nearest landmark, drain blockage causes, and hazard to vehicles or
              basements.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('description');
              setOpenItemIds(['desc-1', 'desc-2']);
            }}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>See Description Tips</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Resolution & Certification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">3. Municipal Resolution</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Transparent 5-stage SLA tracking with mandatory Before/After photo evidence and
              citizen rating.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('resolution');
              setOpenItemIds(['res-1', 'res-2', 'escalation-1']);
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Understand Lifecycle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SECTION: EFFECTIVE DESCRIPTION TEMPLATES (INTERACTIVE) */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-teal-950 text-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>FIELD CREW DISPATCH BEST PRACTICE</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              What to Include in Your Grievance Description
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Field squads prioritize calls that describe water depth, immediate risks, and exact
              landmarks. Click any template below to copy it for your report!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-teal-300 bg-teal-900/60 border border-teal-500/30 px-3 py-1 rounded-xl">
              1-Click Copy Ready
            </span>
          </div>
        </div>

        {/* Good vs Poor Comparison Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Vague Description (Causes Delays):</span>
            </div>
            <p className="text-slate-300 italic font-mono text-[11px] bg-black/30 p-2.5 rounded-xl border border-rose-500/20">
              "Water is flooded on road near my house please come fix it quickly."
            </p>
            <p className="text-[11px] text-rose-200/80">
              Missing depth, road name, vehicle hazard, and drain bottleneck details.
            </p>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Actionable Description (Rapid Response):</span>
            </div>
            <p className="text-slate-200 font-mono text-[11px] bg-black/30 p-2.5 rounded-xl border border-emerald-500/20">
              "1.5 ft waterlogging at Sector 14 Metro Pillar 42. Storm drain inlet blocked with silt & plastic. Cars stalling; hospital ambulance lane blocked."
            </p>
            <p className="text-[11px] text-emerald-200/80">
              Allows control room to dispatch a 50HP dewatering pump and jetting unit immediately.
            </p>
          </div>
        </div>

        {/* 3 Ready-to-Use Templates */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300 block">
            Click to Copy Recommended Templates:
          </span>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {sampleTemplates.map((tmpl) => (
              <div
                key={tmpl.title}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 space-y-2.5 transition-all text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-extrabold text-white text-xs">{tmpl.title}</span>
                    <span className="text-[10px] text-teal-300 font-semibold bg-teal-950/70 px-2 py-0.5 rounded-md border border-teal-500/30">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                    "{tmpl.text}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyTemplateToClipboard(tmpl.text, tmpl.title)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    copiedTemplate === tmpl.title
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/30'
                  }`}
                >
                  {copiedTemplate === tmpl.title ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VISUAL RESOLUTION LIFECYCLE BREAKDOWN */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>MUNICIPAL SERVICE LEVEL AGREEMENTS & WORKFLOW</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            How the Municipal Resolution Process Works
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            From the moment your complaint is recorded to the final certified remediation with
            post-fix photographs.
          </p>
        </div>

        {/* 5 Stages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Stage 1 */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
              1
            </div>
            <h4 className="font-extrabold text-slate-900 text-xs">Report Submitted</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Docket ID generated. Location, photos, and voice note securely saved to municipal
              records.
            </p>
            <span className="text-[10px] font-bold text-blue-700 block">Immediate (T + 0m)</span>
          </div>

          {/* Stage 2 */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
              2
            </div>
            <h4 className="font-extrabold text-slate-900 text-xs">Control Room Triage</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Ward supervisor reviews report, sets priority level (High/Med/Low), and alerts field
              depot.
            </p>
            <span className="text-[10px] font-bold text-amber-700 block">Within 30 mins</span>
          </div>

          {/* Stage 3 */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
              3
            </div>
            <h4 className="font-extrabold text-slate-900 text-xs">Staff Assigned</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Ticket assigned to specific field officer & crew. Citizen receives real-time
              notification.
            </p>
            <span className="text-[10px] font-bold text-teal-700 block">Within 1-2 hours</span>
          </div>

          {/* Stage 4 */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-sky-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
              4
            </div>
            <h4 className="font-extrabold text-slate-900 text-xs">Work In Progress</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Suction pump deployed, drain grates desilted, and water receded to safe vehicle
              clearance.
            </p>
            <span className="text-[10px] font-bold text-sky-700 block">Field execution</span>
          </div>

          {/* Stage 5 */}
          <div className="bg-slate-50 border border-emerald-300 rounded-2xl p-4 space-y-2 bg-emerald-50/50">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
              5
            </div>
            <h4 className="font-extrabold text-emerald-950 text-xs">Resolved & Certified</h4>
            <p className="text-emerald-900 text-[11px] leading-relaxed">
              Staff uploads mandatory "After" resolution photograph. Citizen rates resolution quality
              (1-5★).
            </p>
            <span className="text-[10px] font-bold text-emerald-800 block">Verified Close</span>
          </div>
        </div>

        {/* Escalation Matrix Strip */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-rose-950 block text-xs">
                What if an issue cannot be resolved in 12–24 hours?
              </span>
              <p className="text-rose-900 text-[11px]">
                Complaints automatically escalate across 4 authority tiers (Municipal Staff → Ward
                Officer → Zonal Officer → Commissioner) to deploy heavy civil machinery.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory('escalation');
              setOpenItemIds(['escalation-1', 'escalation-2']);
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs"
          >
            Read Escalation Policy
          </button>
        </div>
      </div>

      {/* INTERACTIVE FAQ ACCORDION SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">
              Search by keyword or select a topic category below to find instant answers
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQ (e.g. photo, SLA, depth)..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Items Accordion */}
        <div className="space-y-3 pt-1">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No matching FAQ found</h4>
              <p className="text-xs text-slate-500">
                Try searching for different terms like "photo", "docket", "pump", or "hotline".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = openItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all ${
                    isOpen ? 'border-teal-300 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full p-4 sm:p-5 flex items-start justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                          isOpen ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        ?
                      </div>
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {item.question}
                      </span>
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-0 space-y-3 text-xs text-slate-700 border-t border-slate-100 mt-1">
                      <p className="leading-relaxed font-normal pt-3">{item.answer}</p>

                      {item.keyPoints && item.keyPoints.length > 0 && (
                        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                            Key Details:
                          </span>
                          <ul className="space-y-1 text-slate-700 list-disc list-inside">
                            {item.keyPoints.map((pt, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.tips && (
                        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-medium text-[11px] flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Pro Tip: {item.tips}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 24x7 EMERGENCY CONTROL ROOM STRIP */}
      <div className="bg-gradient-to-r from-blue-900 to-teal-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6 text-teal-300" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-teal-300">
                24x7 Flood Control Room Hotline
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-black font-mono">1800-419-3312 / 011-2389-4000</h3>
            <p className="text-xs text-slate-300">
              For life-threatening emergencies, submerged open manholes, or major road collapses.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToReport}
            className="px-5 py-3 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>File New Grievance</span>
          </button>
        </div>
      </div>
    </div>
  );
};
