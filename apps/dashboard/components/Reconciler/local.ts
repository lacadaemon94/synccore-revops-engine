type Severity = 'critical' | 'high' | 'medium' | 'low';
type DiscrepancyStatus = 'open' | 'reviewing' | 'resolved';
type SourceTruth = 'billing' | 'crm' | undefined;

interface FieldDiff {
  field: string;
  stripeValue: string;
  hubspotValue: string;
  differs: boolean;
  sourceOfTruth?: SourceTruth;
}

export interface DiscrepancyTriage {
  id: string;
  accountName: string;
  account: string;
  field: string;
  severity: Severity;
  status: DiscrepancyStatus;
  isAutoSafe: boolean;
  scenario: string;
  impactNarrative: string;
  detected: string;
  aLabel: string;
  aSystem: string;
  aValue: string;
  aShort: string;
  bLabel: string;
  bSystem: string;
  bValue: string;
  bShort: string;
  recommend: 'A' | 'B';
  fixText: string;
  resolvedWinner?: 'A' | 'B';
  fields?: FieldDiff[];
}

export interface DiscrepancyTriageCardProps {
  triage: DiscrepancyTriage;
  isDismissed?: boolean;
  onAcceptBilling?: (id: string) => Promise<void>;
  onAcceptCrm?: (id: string) => Promise<void>;
  onDismiss?: (id: string) => Promise<void>;
}
