import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})

export class ActionsComponent implements OnInit {

  options: string[] = ["Buy to Open", "Buy to Close","Sell to Open", "Sell to Close"];
  actionsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.actionsForm = this.fb.group({
      selected: this.fb.control('', [Validators.required]), //[Validators.required] this will require the input to have a value

    });
  }
  ngOnInit(): void { }
  submitForm() {
    console.log(this.actionsForm.value);
  }

}
