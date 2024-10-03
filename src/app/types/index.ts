export interface Company {
  id: number;
  title: string;
  address: string;
  type: string;
  country: string;
  timezone: string;
  parent: string | null;
}


export interface Job {
  id: number;
  code: string;
  name: string;
}

export interface Qualification {
  id: number;
  name: string;
  description: string;
}

export interface Projects {
  id: number;
  name: string;
  client: string | null;
}

export interface Clients {
  id: number;
  name: string;
  details: string | null;
  address: string;
  contact_number: string;
}

export interface Sidebar {
  name: string;
  route: string;
}


export interface Employee {
  id: number;
  code: string;
  name: string;
}

export interface Document {
  id: number;
  code: string;
  name: string;
}


export interface Attendance {
  id: number;
  code: string;
  name: string;
}

export interface Travel {
  id: number;
  code: string;
  name: string;
}

export interface Overtime {
  id: number;
  code: string;
  name: string;
}

export interface Loan {
  id: number;
  code: string;
  name: string;
}


export interface AdminReportModule {
  id: number;
  code: string;
  name: string;
}

