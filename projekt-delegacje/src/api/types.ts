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

// model delegacji - zgodny z klasą Delegacja z backendu
export interface Delegacja {
  partitionKey: string;
  rowKey: string;
  pracownikImie: string;
  pracownikNazwisko: string;
  miejsce: string;
  pracownikID: number;
  dataRozpoczecia: string;
  dataZakonczenia: string;
  uwagi?: string;
  timestamp?: string | null;
}

export interface DelegacjaCreate {
  partitionKey: string;
  rowKey: string;
  pracownikImie: string;
  pracownikNazwisko: string;
  miejsce: string;
  pracownikID: number;
  dataRozpoczecia: string;
  dataZakonczenia: string;
  uwagi?: string;
}
