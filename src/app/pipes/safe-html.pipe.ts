import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(value: any): SafeHtml {
    if (!value) return '';

    let processedValue = value;

    const hasHtml = /<[a-z][\s\S]*>/i.test(value);
    if (!hasHtml) {
      processedValue = value.replace(/(\r\n|\n|\r)/g, '<br>');
    }

    const sanitizedHtml = DOMPurify.sanitize(processedValue);

    return this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml);
  }

}
