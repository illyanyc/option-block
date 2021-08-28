import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-strike-prem-dep',
  templateUrl: './strike-prem-dep.component.html',
  styleUrls: ['./strike-prem-dep.component.scss']
})
export class StrikePremDepComponent implements OnInit {

  @Input() ContractNum: number;
  @Input() Strike: number;
  @Input() Expiration: string[];

  contractForm: FormGroup;

  constructor(private fb: FormBuilder) { //private fb initializes the form
    this.contractForm = this.fb.group({
      ContractNum: this.fb.control("", [Validators.required]), //validators.required checks to make sure the input value is empty or not
      Strike: this.fb.control("", [Validators.required]),
      Expiration: this.fb.control("", [Validators.required]),
      Collateral: this.fb.control("",[Validators.required]),
    });
  }

  ngOnInit(): void {};
  submitContract() {
    console.log(this.contractForm.value);
  }

}
