import { Component } from '@angular/core';
import { Crm } from '../crm/crm';

@Component({
  selector: 'app-amazon',
  standalone: true,
  imports: [Crm],
  templateUrl: './amazon.html',
  styleUrl: './amazon.css',
})
export class Amazon {}
