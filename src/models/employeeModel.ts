import {Dayjs} from "dayjs";

export interface employeeI {
  id: string;
  lastname: string;
  firstname: string;
  status: string;
  position: string;
  date_of_birth: Dayjs | null;
  phone: string;
  bank_details: string;
  cv: File;
  telegram: string;
  linkedin: string;
  github: string;
  salary: string;
  email: string;
  date_start_work: Dayjs | null;
  hourly_payment_cost: string;
  password: string;
}
