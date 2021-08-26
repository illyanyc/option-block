import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-put-block',
  templateUrl: './put-block.component.html',
  styleUrls: ['./put-block.component.scss']
})
export class PutBlockComponent implements OnInit {
  putForm: FormGroup;
  @Input() pticker: string[];
  @Input() pid: string[];
  @Input() options: string[];

  constructor(private fb: FormBuilder) { //private fb initializes the form
    this.putForm = this.fb.group({
      pticker: this.fb.control("", [Validators.required]), //validators.required checks to make sure the input value is empty or not

    });
  }

    ngOnInit(): void {}
    
    onItemSelector(value: any) {
      console.log(value);
    }

}
