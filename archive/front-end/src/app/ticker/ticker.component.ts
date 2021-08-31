import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ticker',
  templateUrl: './ticker.component.html',
  styleUrls: ['./ticker.component.scss']
})
export class TickerComponent implements OnInit {
  @Input() ticker: string;
  tickerForm: FormGroup; //tickerForm is the form specific to the inputted ticker. FormGroup is for all the data.

  constructor(private fb: FormBuilder) { //private fb initializes the form
    this.tickerForm = this.fb.group({
      ticker: this.fb.control("", [Validators.required]), //validators.required checks to make sure the input value is empty or not

    });
  }

  ngOnInit(): void {};
  submitTicker() {
    console.log(this.tickerForm.value);
  }

}
