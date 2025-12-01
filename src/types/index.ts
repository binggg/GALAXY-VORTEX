export interface Participant {
  id: string;
  name: string;
}

export interface Prize {
  id: string;
  name: string;
  level: number;
  count: number;
  color: string;
  icon: string;
}

export interface WinnerRecord {
  participant: Participant;
  prize: Prize;
  timestamp: number;
}
