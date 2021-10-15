import {Component} from '@angular/core';

@Component({
  selector: 'mts-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {
  toggling = false;
  expanded = false;

  toggle() {
    this.toggling = true;
    setTimeout(() => {
      this.toggling = false;
      this.expanded = !this.expanded;
    }, 350);
  }
}
