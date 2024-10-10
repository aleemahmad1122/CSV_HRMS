
interface ICommon {
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
}



export interface Company {
  id: number;
  title: string;
  address: string;
  type: string;
  country: string;
  timezone: string;
  parent: string | null;
}


export interface Job extends ICommon{
  jobId: string;
  jobTitle: string;
  jobCode: string;
  jobDescription: string;
  specification: string;
}

export interface Qualification extends ICommon{
  qualificationId: string;
  name: string;
  description: string;
}

export interface Projects extends ICommon {
  projectId: string;
  name: string;
  statusId: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  description: string;
}

export interface Clients extends ICommon{
  clientId: string;
  name: string;
  email: string;
  address: string;
  details: string;
  contactNumber: string;
  website: string;
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

