export type StringType = 'poly' | 'syngut' | 'multi' | 'natural';
export type Setup = 'full' | 'hybrid';
export type Unit = 'kg' | 'lb';
export type JobStatus = 'active' | 'retired' | 'broken';
export type SessionKind = 'match' | 'practice';

export interface Limit {
  hours: number;
  days: number;
}
export type Limits = Record<StringType, Limit>;

export interface Profile {
  name: string;
  email: string;
  unit: Unit;
  customLimits?: Partial<Limits>;
  createdAt: number;
}

export interface Racquet {
  id: string;
  name: string;
  brand: string;
  model: string;
  activeStringJobId: string | null;
  createdAt: number;
}

export interface StringJob {
  id: string;
  racquetId: string;
  setup: Setup;
  mainsType: StringType;
  crossesType: StringType;
  mainsName: string;
  crossesName: string;
  gauge: string;
  tensionMain: number | null;
  tensionCross: number | null;
  unit: Unit;
  strungAt: string; // YYYY-MM-DD
  cost: number | null;
  playedMinutes: number;
  status: JobStatus;
  endedAt: string | null;
  createdAt: number;
}

export interface Session {
  id: string;
  stringJobId: string;
  racquetId: string;
  playedAt: string; // YYYY-MM-DD
  minutes: number;
  kind: SessionKind;
  createdAt: number;
}
