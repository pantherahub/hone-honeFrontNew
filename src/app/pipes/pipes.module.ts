import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from './safe-url.pipe';
import { FormatNameDocPipe } from './format-name-doc.pipe';
import { PluralizePipe } from './pluralize.pipe';
import { FormatFileBytesPipe } from './format-file-bytes.pipe';
import { TimeAgoPipe } from './time-ago.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';

@NgModule({
  declarations: [
    SafeUrlPipe,
    FormatNameDocPipe,
    PluralizePipe,
    FormatFileBytesPipe,
    TimeAgoPipe,
    SafeHtmlPipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SafeUrlPipe,
    FormatNameDocPipe,
    PluralizePipe,
    FormatFileBytesPipe,
    TimeAgoPipe,
    SafeHtmlPipe,
  ]
})
export class PipesModule { }
