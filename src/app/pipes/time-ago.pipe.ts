import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

@Pipe({
  name: 'timeAgo',
  pure: false,
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {

  private timer: any;

  constructor(private cd: ChangeDetectorRef) {}

  transform(value: string | Date): string {
    if (!value) return '';

    // Update every minute
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.cd.markForCheck();
      }, 60000); // 60 seconds
    }

    return formatDistanceToNow(new Date(value), {
      addSuffix: true,
      locale: es,
    });
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

}
