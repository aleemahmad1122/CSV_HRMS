
interface ICommon {
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
}



interface IPagination {
  totalCount: number;
  pageSize:number;
  pageNo:number;
}

interface ICommonRes {
  status:number;
  success:number;
  message:string;
}



export interface IShift extends ICommon{
  shiftId:string;
  name:string;
  startTime:string;
  endTime:string;
}


export interface IShiftRes extends ICommonRes {

  data: {
    shifts:IShift[]
    pagination:IPagination
  };

}


export interface IRole extends ICommon{
  roleId:string;
  name:string;
  description?:string;
}


export interface IRoleRes extends ICommonRes {

  data: {
    roles:IRole[]
    pagination:IPagination
  };

}


export interface ICompany  extends ICommon{
  companyId: string;
  companyImage: string;
  countryId: string;
  employeesCount: number;
  faxNumber: string;
  firstAddress: string;
  foundedDate: string;
  industryId: string;
  name: string;
  phoneNumber: string;
  registrationNumber: string;
}


export interface ICompanyRes extends ICommonRes {

  data: {
    companies:ICompany[]
    pagination:IPagination
  };

}


export interface IEmployee extends ICommon{
  employeeId: string;
  imagePath: string;
  fullName: string;
  email: string;
  country: string;
  city: string;
  address: string;
  phoneNumber: string;
  role: string;
  cnic: string;
  ssn: string;
  passportNumber: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: string;
  department: string;
  dateOfHire: string;
  salary: number;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
}


export interface IEmployeeRes extends ICommonRes {

  data: {
    employeeDetails:IEmployee[]
    pagination:IPagination
  };

}


export interface IClientRes extends ICommonRes {

  data: {
    clients:Clients[]
    pagination:IPagination
  };

}


export interface IJobRes extends ICommonRes {

  data: {
    jobs:Job[]
    pagination:IPagination
  };

}

export interface IProjectRes extends ICommonRes {

  data: {
    projects:Projects[]
    pagination:IPagination
  };

}

export interface IQualificationRes extends ICommonRes {

  data: {
    qualifications:Qualification[]
    pagination:IPagination
  };

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

export interface Clients {
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

export interface CompanyDetail {
  companyId: string;
  companyName: string;
}

export interface EmployeeDetail {
  employeeId: string;
  email: string;
  employeeName: string;
}


export interface ICompany {
  companyId: string;
  companyImage: string;
  name: string;
  email: string;
  phoneNumber: string;
  faxNumber: string;
  registrationNumber: string;
  countryId: string;
  industryId: string;
  firstAddress: string;
  secondAddress?: string; // Optional field
  website: string;
  employeesCount: number;
  foundedDate: string; // ISO 8601 date format
  companyType: number;
}


interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}
