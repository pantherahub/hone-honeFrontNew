import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from './safe-url.pipe';
import { FormatNameDocPipe } from './format-name-doc.pipe';
import { PluralizePipe } from './pluralize.pipe';
import { FormatFileBytesPipe } from './format-file-bytes.pipe';

@NgModule({
  declarations: [
    SafeUrlPipe,
    FormatNameDocPipe,
    PluralizePipe,
    FormatFileBytesPipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SafeUrlPipe,
    FormatNameDocPipe,
    PluralizePipe,
    FormatFileBytesPipe,
  ]
})
export class PipesModule { }
