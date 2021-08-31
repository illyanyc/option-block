import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IContract } from './contract';
import { ContractService } from './contract.service';
import { IContractHash } from './contractHash';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-return-balance',
  templateUrl: './return-balance.component.html',
  styleUrls: ['./return-balance.component.css']
})
export class ReturnBalanceComponent implements OnInit {

  constructor(private contractService : ContractService) { }

  public balances: IContract;
  public hash: IContractHash;

  public valor : string = "1000";
  public error: any;

  dataForm : FormGroup;


  getBalanceAPI()
  {
    this.contractService.getBalance().subscribe(data =>this.balances = data,err => this.error = err);
  }


  setDeposit()
  {
    let account = this.dataForm.value.account_eth;
    this.contractService.setDepositAccount(account).subscribe(data =>this.hash = data,err => this.error = err);
  }

  ngOnInit() {
     this.getBalanceAPI();
     this.dataForm = new FormGroup({
       account_eth : new FormControl('')
     });

     
  }




}
