
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



export interface IShift extends ICommon {
  shiftId: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  earlyMinutes: number;
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
  description?: string;
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
  noOfDays: number,
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
  leaveTypeId: string;
  leaveDate: string;
  offSet: string;
  leaveReason: string;
}


export interface ILeaveRes extends ICommonRes {

  data: {
    leaves: ILeave[]
    pagination: IPagination
  };

}


export interface IAttendanceList extends ICommon {
  attendanceId: string;
  employeeId: string;
  date: null | string;
  checkIn: null | string;
  checkOut: null | string;
  offSet: null | string;
  comment: null | string;
}


export interface IAttendanceListRes extends ICommonRes {

  data: {
    attendances: IAttendanceList[]
    pagination: IPagination
  };

}


export interface IClientRes extends ICommonRes {

  data: {
    clients: Clients[]
    pagination: IPagination
  };

}


export interface IJobRes extends ICommonRes {

  data: {
    jobs: Job[]
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
  offset:string | number;
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
