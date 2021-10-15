import {Component, Input} from '@angular/core';
import {Table} from '../../../model/table';

@Component({
  selector: 'mts-table-item',
  templateUrl: './table-item.component.html',
  styleUrls: ['./table-item.component.scss']
})
export class TableItemComponent {
  @Input()
  table: Table | undefined
}
