import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-call-block',
  templateUrl: './call-block.component.html',
  styleUrls: ['./call-block.component.scss']
})
export class CallComponent implements OnInit {
  callForm: FormGroup;
  @Input() cblock: boolean;



  constructor(private fb: FormBuilder) { //private fb initializes the form
    this.callForm = this.fb.group({
      cticker: this.fb.control("", [Validators.required]), //validators.required checks to make sure the input value is empty or not
      cid: this.fb.control("", [Validators.required])
    });
  }
  ngOnInit(): void { }

  onItemSelector(value: any) {
    console.log(value);
  }

}
