export interface Order {
  id: number[]; //1
  type: string[]; // ["Call", "Put"]
  completed: boolean;
  ticker: string[];
  actions: string[];
}
export interface Block {
  type: string[]; // Call or Put
  ticker: string[]; //AAPL, AMZN, etc
}

export interface Contract {
  id: string; //Ox7498349
  ind: number[]; //[12]
}

export interface Prices {

  adjusted: boolean;
  queryCount: number;
  request_id: string;
  results: Result[];
  resultsCount: number;
  status: string;
  ticker: string;
}

export interface Result {
  T: string;
  c: number;
  h: number;
  l: number;
  o: number;
  t: number;
  v: number;
  vw: number;
}

