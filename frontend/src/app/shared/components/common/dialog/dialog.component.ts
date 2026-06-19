import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dialog.component.html',
})
export class DialogComponent {
  title       = input.required<string>();
  message     = input<string>('');
  confirmLabel = input<string>('Confirm');
  cancelLabel  = input<string>('Cancel');
  confirmDanger = input<boolean>(false);
  loading      = input<boolean>(false);

  /** Khi muốn dialog có 1 text input (ví dụ: tên deck) */
  inputPlaceholder = input<string>('');
  inputLabel       = input<string>('');

  confirmed = output<string>();
  cancelled = output<void>();

  readonly visible = signal(false);
  readonly inputValue = signal('');
  readonly inputError = signal('');

  open(defaultValue = ''): void {
    this.inputValue.set(defaultValue);
    this.inputError.set('');
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
  }

  onConfirm(): void {
    if (this.inputPlaceholder()) {
      const v = this.inputValue().trim();
      if (!v) { this.inputError.set('This field is required.'); return; }
    }
    this.confirmed.emit(this.inputValue().trim());
  }

  onCancel(): void {
    this.close();
    this.cancelled.emit();
  }

  onBackdrop(): void {
    if (!this.loading()) this.onCancel();
  }
}
