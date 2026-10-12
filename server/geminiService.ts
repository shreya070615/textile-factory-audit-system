import { GoogleGenAI } from '@google/genai';
import { summariesStore, auditReportsStore } from './dataStore.ts';

export interface AuditAiRequest {
  companyName: string;
  focusArea?: string;
  customPrompt?: string;
}

export interface AuditAiResponse {
  companyName: string;
  source: 'gemini' | 'industrial_rule_engine';
  generatedAt: string;
  executiveSummary: string;
  keyRisks: string[];
  recommendations: Array<{
    title: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedPaybackMonths: number;
    statutoryFramework: string;
  }>;
  complianceRating: string;
}

export async function generateAuditAiInsight(req: AuditAiRequest): Promise<AuditAiResponse> {
  const companyKey = req.companyName || 'TexAlpha Mills';
  const summary = summariesStore[companyKey] || summariesStore['TexAlpha Mills'];
  const audit = auditReportsStore[companyKey] || auditReportsStore['TexAlpha Mills'];

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyValid = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10;

  if (isKeyValid) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a Senior Textile Industrial Auditor and Energy Compliance Engineer in India.
Analyze the following sensor compliance telemetry and generate a structured audit assessment:

Company: ${summary.company_name}
Monitored Period: ${summary.period_start} to ${summary.period_end}
Total Telemetry Readings: ${summary.total_readings}
Estimated Monthly Power: ${summary.est_monthly_energy_kwh} kWh
Average Power Factor: ${summary.avg_power_factor} (Target >= 0.85)
Anomaly / Fault Rate: ${summary.fault_rate_pct}%
Peak Demand: ${summary.peak_demand_kw} kW
Statutory Audit Score: ${audit.score}/100 (${audit.status})
Penalties Liability: ₹${audit.estimated_penalties_inr?.toLocaleString() || 0}

Machines Monitored:
${summary.machines.map((m) => `- ${m.machine_id} (${m.machine_type}): Avg kW: ${m.avg_kw}, Max Temp: ${m.max_temp_c}°C, Vibration: ${m.avg_vibration_mm_s} mm/s, Status: ${m.status}`).join('\n')}

Focus Area: ${req.focusArea || 'General Energy Efficiency & CPCB Environmental Compliance'}
${req.customPrompt ? `User Inquiry: ${req.customPrompt}` : ''}

Provide a concise, high-impact assessment with:
1. Executive Summary
2. Top 3 Risk Factors (referencing BEE / CPCB / OSHA)
3. 3 Strategic Action Steps with estimated payback periods
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      if (text) {
        return {
          companyName: companyKey,
          source: 'gemini',
          generatedAt: new Date().toISOString(),
          executiveSummary: text.slice(0, 500) + '...',
          keyRisks: [
            `Power Factor deviation recorded at ${summary.avg_power_factor.toFixed(3)} risking DISCOM surcharge penalties.`,
            `High fault incidence of ${summary.fault_rate_pct.toFixed(1)}% across monitored loom and spinning motors.`,
            `Thermal and acoustic spikes in heavy machines breaching CPCB factory boundary limits.`,
          ],
          recommendations: (audit.suggestions || []).map((s) => ({
            title: s.finding,
            priority: s.priority,
            estimatedPaybackMonths: s.est_saving_pct ? Math.round(100 / s.est_saving_pct) : 12,
            statutoryFramework: s.category,
          })),
          complianceRating: audit.status,
        };
      }
    } catch (error) {
      console.warn('[Gemini AI] Call failed or quota exceeded, falling back to expert rule engine:', error);
    }
  }

  // Industrial Rule-Engine Fallback (Always reliable, high fidelity)
  const isHighFault = summary.fault_rate_pct > 20;
  const isLowPf = summary.avg_power_factor < 0.88;

  const risks: string[] = [];
  if (isLowPf) {
    risks.push(
      `Discom Power Factor penalty exposure: Current PF is ${summary.avg_power_factor.toFixed(3)}, below optimal 0.95 threshold (BEE ECBC Standards).`
    );
  }
  if (isHighFault) {
    risks.push(
      `Motor Vibration & Temperature degradation: Telemetry flagged ${summary.fault_rate_pct.toFixed(1)}% anomalous cycles indicating imminent bearing or lubrication seizure.`
    );
  }
  risks.push(
    `Peak demand breaches (${summary.peak_demand_kw} kW) coincide with high-tariff Time-of-Day (ToD) slots, elevating operational expense by ~14%.`
  );

  return {
    companyName: companyKey,
    source: 'industrial_rule_engine',
    generatedAt: new Date().toISOString(),
    executiveSummary: `Synthetic audit analysis for ${summary.company_name}: Overall statutory compliance score stands at ${audit.score}/100 (${audit.status}). Primary compliance bottlenecks stem from harmonic distortion and power factor lag in high-draw spinning motors, as well as casing temperatures exceeding OSHA safety thresholds. Implementation of targeted capacitor banks and variable frequency drives (VFDs) is forecasted to recoup ₹${((summary.annual_energy_bill_k * 0.18) * 1000).toLocaleString('en-IN')} annually with payback within 14 months.`,
    keyRisks: risks,
    recommendations: (audit.suggestions || []).map((s) => ({
      title: s.finding,
      priority: s.priority,
      estimatedPaybackMonths: s.est_saving_pct ? Math.round(100 / s.est_saving_pct) : 12,
      statutoryFramework: s.category,
    })),
    complianceRating: audit.status,
  };
}
