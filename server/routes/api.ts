import { Router, Request, Response } from 'express';
import {
  summariesStore,
  datasetInfosStore,
  auditReportsStore,
  comparisonStore,
  dispatchesStore,
  dprStore,
  clusterStore,
  todSlotsStore,
  machineScheduleStore,
  acknowledgementsRegistry,
  generateSimulationTick,
  addSensorReading,
} from '../dataStore.ts';
import { generateAuditAiInsight } from '../geminiService.ts';

export const apiRouter = Router();

// 1. Health & Status
apiRouter.get('/health', (_req: Request, res: Response) => {
  const companies = Object.keys(summariesStore);
  const totalReadings = Object.values(datasetInfosStore).reduce((acc, curr) => acc + curr.row_count, 0);
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'Textile Factory Compliance Telemetry Backend',
    frameworks: ['BEE ADEETIE', 'SIDBI 4E', 'CPCB Emission Norms', 'ISO 50001'],
    database: 'In-Memory High-Fidelity Dataset',
    companiesMonitored: companies,
    totalReadingsTracked: totalReadings,
    aiModule: {
      provider: hasGeminiKey ? 'Gemini 2.5 Flash' : 'Industrial Rules Fallback',
      active: true,
    },
  });
});

// 2. Companies List
apiRouter.get('/companies', (_req: Request, res: Response) => {
  const list = Object.keys(summariesStore).map((name) => {
    const summary = summariesStore[name];
    const audit = auditReportsStore[name];
    return {
      name,
      machinesCount: summary.machines_monitored,
      totalReadings: summary.total_readings,
      auditScore: audit?.score || 0,
      complianceStatus: audit?.status || 'UNKNOWN',
      peakDemandKw: summary.peak_demand_kw,
    };
  });
  res.json({ count: list.length, companies: list });
});

// 3. Endpoint 1: GET /companies/:name/summary
apiRouter.get('/companies/:name/summary', (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);
  const summary = summariesStore[name] || summariesStore['TexAlpha Mills'];
  if (!summary) {
    res.status(404).json({ error: `Company "${name}" not found.` });
    return;
  }
  res.json(summary);
});

// 4. Endpoint 2: GET /companies/:name/readings?limit=20
apiRouter.get('/companies/:name/readings', (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);
  const baseInfo = datasetInfosStore[name] || datasetInfosStore['TexAlpha Mills'];
  if (!baseInfo) {
    res.status(404).json({ error: `Company "${name}" not found.` });
    return;
  }

  const limit = Math.min(Number(req.query.limit) || 20, 500);
  const shift = req.query.shift as string | undefined;
  const faultOnly = req.query.fault_only === 'true';

  let readings = baseInfo.readings;
  if (shift && ['A', 'B', 'C'].includes(shift)) {
    readings = readings.filter((r) => r.shift === shift);
  }
  if (faultOnly) {
    readings = readings.filter((r) => r.fault_flag === 1);
  }

  const result = {
    ...baseInfo,
    readings: readings.slice(0, limit),
  };
  res.json(result);
});

// 5. Ingest New Reading: POST /companies/:name/readings
apiRouter.post('/companies/:name/readings', (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);
  const reading = req.body;
  if (!reading || !reading.machine_id) {
    res.status(400).json({ error: 'Invalid sensor reading payload. machine_id is required.' });
    return;
  }
  const saved = addSensorReading(name, reading);
  res.status(201).json({ message: 'Telemetry reading ingested successfully.', reading: saved });
});

// 6. Endpoint 3: GET /companies/:name/audit
apiRouter.get('/companies/:name/audit', (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);
  const audit = auditReportsStore[name] || auditReportsStore['TexAlpha Mills'];
  if (!audit) {
    res.status(404).json({ error: `Audit data for "${name}" not found.` });
    return;
  }
  res.json(audit);
});

// 7. Endpoint 4: GET /audit/compare
apiRouter.get('/audit/compare', (_req: Request, res: Response) => {
  res.json(comparisonStore);
});

// 8. Vernacular Dispatches: GET /companies/:name/dispatches
apiRouter.get('/companies/:name/dispatches', (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);
  const dispatches = dispatchesStore[name] || dispatchesStore['TexAlpha Mills'];
  const enriched = dispatches.map((d) => ({
    ...d,
    acknowledgement: acknowledgementsRegistry[d.id] || null,
  }));
  res.json({ company: name, count: enriched.length, dispatches: enriched });
});

// 9. Acknowledge Dispatch: POST /companies/:name/dispatches/:id/acknowledge
apiRouter.post('/companies/:name/dispatches/:id/acknowledge', (req: Request, res: Response) => {
  const companyName = decodeURIComponent(req.params.name);
  const dispatchId = req.params.id;
  const { supervisor, note } = req.body;

  const ack = {
    dispatchId,
    companyName,
    acknowledgedBy: supervisor || 'Shift Supervisor',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    note: note || 'Acknowledged and mitigation actions initiated',
  };

  acknowledgementsRegistry[dispatchId] = ack;
  res.json({ message: 'Dispatch alert acknowledged.', acknowledgement: ack });
});

// 10. DPR & Green Loan: GET /companies/:name/dpr
apiRouter.get('/companies/:name/dpr', (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);
  const dpr = dprStore[name] || dprStore['TexAlpha Mills'];
  res.json(dpr);
});

// 11. Cluster Benchmark: GET /companies/:name/cluster
apiRouter.get('/companies/:name/cluster', (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);
  const cluster = clusterStore[name] || clusterStore['TexAlpha Mills'];
  res.json(cluster);
});

// 12. Tariffs & Shift Scheduling: GET /companies/:name/tariffs
apiRouter.get('/companies/:name/tariffs', (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);
  res.json({
    companyName: name,
    slots: todSlotsStore,
    scheduleItems: machineScheduleStore[name] || machineScheduleStore['TexAlpha Mills'],
  });
});

// 13. AI Audit Insight: POST /ai/audit-insight
apiRouter.post('/ai/audit-insight', async (req: Request, res: Response) => {
  try {
    const { companyName, focusArea, customPrompt } = req.body;
    const result = await generateAuditAiInsight({ companyName, focusArea, customPrompt });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Error generating AI audit insight.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// 14. Simulation Tick: POST /companies/:name/simulate-tick
apiRouter.post('/companies/:name/simulate-tick', (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);
  const newReading = generateSimulationTick(name);
  res.json({
    message: 'Simulation tick generated successfully.',
    reading: newReading,
  });
});
