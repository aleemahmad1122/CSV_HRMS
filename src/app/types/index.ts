
interface ICommon {
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
}



interface IPagination {
  totalCount: number;
  pageSize: number;
  pageNo: number;
}

interface ICommonRes {
  status: number;
  success: number;
  message: string;
}

export interface IGraphData {
  attendanceDate: string;
  dayName: string;
  isWorkingDay: boolean;
  attendanceStatus: number;
  attendanceTime: string;
  checkInTime: null | string;
  checkOutTime: null | string;
  attendanceType: number;
  onLeave: boolean;
}

export interface IReportTo {
  employeeId: string;
  companyId: string;
  employeeName: string;
}


export interface IShift extends ICommon {
  shiftId: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  offSet: string;
  description: string;
  workingDays: string;
  shiftStartsPreviousDay: boolean;
  shiftEndsNextDay: boolean;
  isActive: boolean;
  shiftPolicies: any[];
}


export interface IShiftRes extends ICommonRes {

  data: {
    shifts: IShift[]
    pagination: IPagination
  };

}


export interface IEmployeeWorkHistory extends ICommon {
  employeeWorkHistoryId: string;
  employeeId: string;
  attachmentTypeId: string;
  positionTitle: string;
  organization?: string;
  workHistoryAttachments: {
    attachmentId: string;
    documentPath: string;
    documentName: string;
  }[];
  startDate?: string;
  endDate?: string;
}


export interface IEmployeeWorkHistoryRes extends ICommonRes {

  data: {
    employeeWorkHistoryDetails: IEmployeeWorkHistory[]
    pagination: IPagination
  };

}


export interface IEmployeeAsset extends ICommon {
  employeeAssetId: string;
  companyId: string;
  employeeId: string;
  assetTypeId: string;
  assetTypeName: string;
  assetId: string;
  assetName: string;
  issuedDate: string;
  offSet: string;
  description: string;
  isActive: boolean;
  assetStatus: number;
}


export interface IEmployeeAssetRes extends ICommonRes {

  data: {
    assets: IEmployeeAsset[]
    pagination: IPagination
  };

}


export interface IEmployeeShift extends ICommon {
  shiftId: string;
  description: string;
}


export interface IEmployeeShiftRes extends ICommonRes {

  data: {
    shiftDetails: IEmployeeShift[]
    pagination: IPagination
  };

}

export interface IEmployeeEducation extends ICommon {
  employeeEducationId: string;
  employeeId: string;
  attachmentTypeId: string;
  educationTitle: string;
  institution?: string;
  educationAttachments: {
    attachmentId: string;
    documentPath: string;
    documentName: string;
  }[];
  startDate?: string;
  endDate?: string;
}


export interface IEmployeeEducationRes extends ICommonRes {

  data: {
    employeeEducationDetails: IEmployeeEducation[]
    pagination: IPagination
  };

}


export interface IRole extends ICommon {
  roleId: string;
  name: string;
  rolePriority: number;
  textColor: string;
  backgroundColor: string;
  description?: string;
  isActive: boolean;
}


export interface IRoleRes extends ICommonRes {

  data: {
    roles: IRole[]
    pagination: IPagination
  };

}


export interface IDesignations extends ICommon {
  designationId: string;
  companyId: string;
  designationTitle: string;
  designationCode: string;
  description: string;
}


export interface IDesignationRes extends ICommonRes {

  data: {
    designations: IDesignations[]
    pagination: IPagination
  };

}

export interface IAttachmentType extends ICommon {
  attachmentTypeId: string;
  name: string;
  attachmentType: string | number;
  description: string;
}


export interface IAttachmentTypeRes extends ICommonRes {

  data: {
    attachmentTypes: IAttachmentType[]
    pagination: IPagination
  };

}


export interface IDepartment extends ICommon {
  departmentId: string;
  companyId: string;
  name: string;
  hodId: string;
  description: string;
}


export interface IDepartmentRes extends ICommonRes {

  data: {
    departments: IDepartment[]
    pagination: IPagination
  };

}


export interface ITeam extends ICommon {
  teamId: string;
  companyId: string;
  name: string;
  teamLeadId: string;
  description: string;
}


export interface ITeamRes extends ICommonRes {

  data: {
    teams: ITeam[]
    pagination: IPagination
  };

}

// export interface IEmployeeWorkHistory extends ICommon{
//   roleId:string;
//   name:string;
//   description?:string;
// }


// export interface IEmployeeWorkHistoryRes extends ICommonRes {

//   data: {
//     employeeWorkHistoryDetails:IEmployeeWorkHistory[]
//     pagination:IPagination
//   };

// }

export interface IEmployeeWorkHistory extends ICommon {
  attachmentTypeId: string;
  positionTitle: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
}

export interface IEmployeeWorkHistoryRes extends ICommonRes {

  data: {
    employeeWorkHistoryDetails: IEmployeeWorkHistory[]
    pagination: IPagination
  };

}

export interface IEmployeeDesignation extends ICommon {
  employeeDesignationId: string;
  employeeId: string;
  designationName?: string;
  departmentName?: string;
  teamName?: string;
}

export interface IEmployeeDesignationRes extends ICommonRes {

  data: {
    employeeDesignations: IEmployeeDesignation[]
    pagination: IPagination
  };

}

export interface IAttachmentType extends ICommon {
  attachmentTypeId: string;
  name: string;
  description: string;
}

export interface IAttachmentTypeRes extends ICommonRes {
  data: {
    attachmentTypes: IAttachmentType[]
    pagination: IPagination
  };
}


export interface ICompany extends ICommon {
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
  cnic: string;
  dob: string;
  registrationNumber: string;
  isActive: boolean;
}


export interface ICompanyRes extends ICommonRes {

  data: {
    companies: ICompany[]
    pagination: IPagination
  };

}


export interface IEmployee extends ICommon {
  employeeId: string;
  imagePath: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  city: string;
  address: string;
  phoneNumber: string;
  role: string;
  cnic: string;
  ssn: string;
  roleId: string;
  roleTextColor: string;
  roleBackgroundColor: string;
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
    employeeDetails: IEmployee[]
    pagination: IPagination
  };

}


export interface ILeaveType extends ICommon {
  leaveTypeId: string;
  companyId: string;
  name: string;
  noOfDays: number;
  description: string;
  isPaid: boolean;
  isActive: boolean;
}


export interface ILeaveTypeRes extends ICommonRes {

  data: {
    leaveType: ILeaveType[]
    pagination: IPagination
  };

}



export interface ILeave extends ICommon {
  leaveId: string;
  employeeId: string;
  firstName: string;
  approvedBy: string;
  approvedDate: string;
  approvedComment: string;
  lastName: string;
  email: string;
  leaveTypeId: string;
  leaveDate: string;
  offSet: string;
  leaveReason: string;
  leaveStatus: number;
  isActive: boolean;
}


export interface ILeaveRes extends ICommonRes {

  data: {
    leaves: ILeave[]
    pagination: IPagination
  };

}


export interface IAttendanceList extends ICommon {
  approvedBy: string;
  approvedDate: string;
  approvedComment: string;
  attendanceId: string;
  attendanceType: number;
  employeeId: string;
  date: null | string;
  firstName: string;
  remarks: string;
  lastName: string;
  checkIn: null | string;
  checkOut: null | string;
  offSet: null | string;
  attendanceStatus: number;
  comment: null | string;
  attendanceDateTime: string;
}


export interface IAttendanceListRes extends ICommonRes {

  data: {
    attendances: IAttendanceList[]
    pagination: IPagination
  };

}


export interface AttendanceRequests extends ICommon {
  attendanceId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  comment: string;
  attendanceDateTime: string;
  checkIn: string;
  checkOut: string;
  activeTime: string;
  attendanceStatus: number;
  approvedBy: null | string;
  approvedDate: string;
  approvedComment: null | string;
  isActive: boolean;
}


export interface AttendanceRequestsRes extends ICommonRes {

  data: {
    attendanceRequests: AttendanceRequests[]
    pagination: IPagination
  };

}


export interface IClientRes extends ICommonRes {

  data: {
    clients: Clients[]
    pagination: IPagination
  };

}



export interface IProjectRes extends ICommonRes {

  data: {
    projects: Projects[]
    pagination: IPagination
  };

}

export interface IQualificationRes extends ICommonRes {

  data: {
    qualifications: Qualification[]
    pagination: IPagination
  };

}




export interface Job extends ICommon {
  jobId: string;
  jobTitle: string;
  jobCode: string;
  jobDescription: string;
}


export interface IJobRes extends ICommonRes {

  data: {
    jobs: Job[]
    pagination: IPagination
  };

}



export interface Salary extends ICommon {
  salaryId: string;
  companyId: string;
  salaryTitle: string;
  type: string;
  description: string;
  isActive: boolean;
}


export interface ISalaryRes extends ICommonRes {

  data: {
    salaries: Salary[]
    pagination: IPagination
  };

}



export interface SalaryFrequencies extends ICommon {
  salaryFrequencyId: string;
  companyId: string;
  title: string;
  description: null | string;
  isActive: boolean;
}


export interface ISalaryFrequenciesRes extends ICommonRes {

  data: {
    salaryFrequencies: SalaryFrequencies[]
    pagination: IPagination
  };

}


export interface IAssetType extends ICommon {
  assetTypeId: string;
  companyId: string;
  name: string;
  description: string;
  isActive: boolean;
}


export interface IAssetTypeRes extends ICommonRes {

  data: {
    assetTypes: IAssetType[]
    pagination: IPagination
  };

}

export interface IAsset extends ICommon {
  assetId: string;
  assetTypeId: string;
  companyId: string;
  name: string;
  description: string;
  assetStatus: number;
  isActive: boolean;
}


export interface IAssetRes extends ICommonRes {

  data: {
    assets: IAsset[]
    pagination: IPagination
  };

}

export interface Qualification extends ICommon {
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

export interface Clients extends ICommon {
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
  permissions: string;
  show: boolean;
  class?: string;
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


export interface ICompany {
  offSet: string | number;
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



export interface AttendanceSummary {
  employeeId: string;
  fullName: string;
  presents: number,
  absents: number,
  leaves: number,
  late: number,
  early: number,
  halfDays: number,
  offDays: number,
  missingAttendance: number
}

export interface TeamSummary {
  employeeId: string;
  fullName: string;
  imagePath: string;
  attendanceStatus: false
}

export interface EmployeeLeaveSummary {
  leaveTypeId: string
  leaveTypeName: string;
  totalLeaves: number,
  leavesTaken: number,
  remainingLeaves: number
}

export interface ICheckInSummary {
  checkInTime: string | null;
  offSet: string | number | null
}
export interface ResDasSummaryData {
  checkInSummary: ICheckInSummary;
  attendanceSummary: AttendanceSummary;
  teamSummary: TeamSummary[];
  employeeLeaveSummary: EmployeeLeaveSummary[];
  absentData: { date: string; }[];
  lateData: { attendanceDate: string; checkIn: string; checkOut: string; }[];
  earlyData: { attendanceDate: string; checkIn: string; checkOut: string; }[];
  missingData: { attendanceDate: string; checkIn: string; checkOut: string; }[];
}
export interface ResDasSummary {
  message: string;
  data: ResDasSummaryData;
  status: number;
  success: boolean;
}


export interface IModulePermissions {
  systemPermissionId: string;
  title: string
  description: string;
  isAssigned: boolean;
}
export interface IGetSystemPermissions {
  systemModuleId: string;
  parentModule: string;
  description: string;
  modulePermissions: IModulePermissions[];
}
export interface IResGetSystemPermissions {
  message: string;
  data: {
    systemModules: IGetSystemPermissions[]
  };
  status: number;
  success: boolean;
}


export interface EmployeeDetail {
  employeeId: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  imagePath: string;
  phoneNumber: number | string;
  city: string;
  country: string;
  designation: string;
  role: string;
  roleId: string;
  isPasswordSet: any;
  rolePermission: {
    backgroundColor: string;
    isActive: boolean;
    name: string;
    roleId: string;
    systemModulePermissions: {
      systemModules: IGetSystemPermissions[]
    }
  }
}

export enum AttType {
  personal = 0,
  education = 1,
  workHistory = 2,
}
