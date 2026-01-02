// typ requestu logowania - zgodny z kontrolerem w ASP.NET
export interface LoginRequest {
  email: string;
  password: string;
}

// to, co zwraca AuthController
export interface LoginResponse {
  success: boolean;
  message?: string;
}

// model delegacji 
export interface Delegacja {
  id: string; // RowKey z Azure
  userEmail: string;
  pracownikImie: string;
  pracownikNazwisko: string;
  miejsce: string;
  dataRozpoczecia: string;
  dataZakonczenia: string;
  uwagi?: string;
  timestamp?: string | null;
}

// Request do tworzenia delegacji 
export interface DelegacjaCreate {
  miejsce: string;
  dataRozpoczecia: string;
  dataZakonczenia: string;
  uwagi?: string;
}

// Request do aktualizacji delegacji 
export interface DelegacjaUpdate {
  miejsce?: string;
  dataRozpoczecia?: string;
  dataZakonczenia?: string;
  uwagi?: string;
}