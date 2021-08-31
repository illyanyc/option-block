import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { IContract } from "./contract";
import { catchError, map } from 'rxjs/operators';
import { IContractHash } from "./contractHash";


@Injectable()



export class ContractService{

    constructor(private http: HttpClient){}
    protected UrlServiceV1: string = "http://localhost:80/smartcontract/";

    public retorno : Observable<IContract>;
    public contracthash : Observable<IContractHash>



    getHeaderJSON()
    {
       return {
           headers: new HttpHeaders({
               'Content-Type' : 'application/json'
           })
       };
    }

    serviceError(response: Response | any) {
        let customError: string[] = [];

        if(response instanceof HttpErrorResponse) {

            if(response.statusText === "Unknown Error") {
                customError.push("Ocorreu um erro desconhecido");
                response.error.errors = customError;
            }

            console.log(response);
            
        }
        return throwError(response);
    }
    

    getBalance(): Observable<IContract>
    {
        this.retorno =  this.http.get<IContract>(this.UrlServiceV1+ "balance")
        .pipe(catchError(this.serviceError));

        return this.retorno;
    }

    setDepositAccount(account : string): Observable<IContractHash>
    {
        this.contracthash =  this.http.get<IContractHash>(this.UrlServiceV1 + "update-balance/" + account)
        .pipe(catchError(this.serviceError));

        return this.contracthash;
    }

}