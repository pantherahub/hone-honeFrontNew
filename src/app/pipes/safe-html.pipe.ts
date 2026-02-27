import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

// DOMPurify.addHook('afterSanitizeAttributes', (node) => {
//   if (node instanceof HTMLElement && node.hasAttribute('style')) {
//     const style = node.getAttribute('style')?.toLowerCase();
//     if (!style) return;

//     if (style.includes('position')) {
//       node.removeAttribute('style');
//       return;
//     }

//     const dangerousCoords = /(^|[;]\s*)(top|left|right|bottom)\s*:/i;
//     if (dangerousCoords.test(style)) {
//       if (!style.includes('border-')) {
//         node.removeAttribute('style');
//       }
//     }
//   }
// });

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node instanceof HTMLElement && node.hasAttribute('style')) {
    const style = node.getAttribute('style')?.toLowerCase();
    if (!style) return;

    // Remove position styles for safety
    if (style.includes('position')) {
      node.removeAttribute('style');
      return;
    }

    // Remove styles for negative coordinates and margins
    // const dangerousPattern = /(^|[;]\s*)(top|left|right|bottom|margin|margin-top|margin-left|margin-right|margin-bottom)\s*:\s*[-]/i;
    // if (dangerousPattern.test(style)) {
    //    node.removeAttribute('style');
    // }

    // // Remove styles for positive coordinates
    // const coordProperty = /(^|[;]\s*)(top|left|right|bottom)\s*:/i;
    // if (coordProperty.test(style) && !style.includes('border-')) {
    //    node.removeAttribute('style');
    // }

    // Remove styles for coordinates and negative margins
    const isCoord = /(^|[;]\s*)(top|left|right|bottom)\s*:/i.test(style);
    const isNegativeMargin = /(^|[;]\s*)(margin)\b.*:\s*[-]/i.test(style);

    if ((isCoord && !style.includes('border-')) || isNegativeMargin) {
      node.removeAttribute('style');
    }
  }
});

@Pipe({
  name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(value: any): SafeHtml {
    if (!value) return '';

    let htmlContent = value;

    const hasHtml = /<[a-z][\s\S]*>/i.test(value);
    if (!hasHtml) {
      htmlContent = value.replace(/(\r\n|\n|\r)/g, '<br>');
    }

    const cleanHtml = DOMPurify.sanitize(htmlContent, {
      SAFE_FOR_TEMPLATES: true
    });

    // Security settings on links
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    const links = tempDiv.querySelectorAll('a');

    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('http')) {
        link.setAttribute('rel', 'nofollow noopener noreferrer');
        link.setAttribute('target', '_blank');
      }
      link.classList.add('text-blue-600', 'dark:text-blue-500', 'hover:underline'); // external-link
    });

    return this.sanitizer.bypassSecurityTrustHtml(tempDiv.innerHTML);
  }

}
