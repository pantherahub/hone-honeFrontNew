import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from './safe-url.pipe';
import { FormatNameDocPipe } from './format-name-doc.pipe';
import { PluralizePipe } from './pluralize.pipe';

@NgModule({
  declarations: [
    SafeUrlPipe,
    FormatNameDocPipe,
    PluralizePipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SafeUrlPipe,
    FormatNameDocPipe,
    PluralizePipe,
  ]
})
export class PipesModule {}
