export type BankType = 'Lead Bank' | 'Wells Fargo';

export interface Transaction {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface BaseRecord {
  id: string;
  bankType: BankType;
  emailId: string;
  firstName: string;
  lastName: string;
  accountNo: string;
  notes?: string;
  createdAt: number;
  isDeleted: boolean;
}

export interface LeadBankRecord extends BaseRecord {
  bankType: 'Lead Bank';
  routing: string;
}

export interface WellsFargoRecord extends BaseRecord {
  bankType: 'Wells Fargo';
  dob: string;
  ssn: string;
  ach: string;
  wire: string;
  loginId: string;
  password: string;
  receiverAddress: string;
  phone: string;
  phoneLink: string;
  phoneExpiry: string;
  transactions: Transaction[];
}

export type BankRecord = LeadBankRecord | WellsFargoRecord;
