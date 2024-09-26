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
