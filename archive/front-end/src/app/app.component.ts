import { Component } from '@angular/core';
// import { PollService } from './option-service/option.service'; //this is for the linking to the blockchain

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  activeBlock = null;

  showform = true;

  blocks = [
    // these are the blocks that stack on top of each other Call & Put
    { ID: 'CALL', ticker: "AAPL", }, { ID: "PUT", ticker: "AAPL", }];

  // setactiveBlock(blocks) {
  //   this.activeBlock = blocks;
  }
