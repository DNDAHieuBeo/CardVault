import { Component, input } from '@angular/core';

@Component({
  selector: 'button[appBtn]',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[disabled]':            'disabled()',
    '[class.btn-primary]':   "variant() === 'primary'",
    '[class.btn-secondary]': "variant() === 'secondary'",
    '[class.btn-danger]':    "variant() === 'danger'",
  },
})
export class BtnComponent {
  variant  = input<'primary' | 'secondary' | 'danger'>('primary');
  disabled = input(false);
}
