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
