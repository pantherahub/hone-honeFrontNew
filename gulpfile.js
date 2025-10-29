// const svgstore = require('gulp-svgstore');
// const rename = require('gulp-rename');
// const cheerio = require('gulp-cheerio');
// const svgmin = require('gulp-svgmin');
// const svgSymbols = require('gulp-svg-symbols');

const gulp = require('gulp');
const through2 = require('through2');
const fs = require('fs');
const path = require('path');
const xmlFormatter = require('xml-formatter');

function createSvgSprite() {
  let spriteContent = '';

  return gulp.src('node_modules/flowbite-icons/src/solid/weather/*.svg')
    .pipe(through2.obj(function (file, _, cb) {
      if (file.isBuffer()) {
        const svgText = file.contents.toString();
        const filename = path.basename(file.path, '.svg');
        const id = `${filename}`;

        // Extrae el contenido relevante del SVG
        const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

        const fillMatch = svgText.match(/<svg[^>]*fill="([^"]+)"/);
        const fillAttr = fillMatch ? `fill="${fillMatch[1]}"` : '';

        const pathContent = svgText
          .replace(/^.*?<svg[^>]*>/s, '') // remove <svg ...>
          .replace(/<\/svg>\s*$/s, '')   // remove </svg>
          .trim();

        const symbol = `
  <symbol id="${id}" ${fillAttr} viewBox="${viewBox}">
    ${pathContent}
  </symbol>`;

        spriteContent += symbol + '\n';
      }
      cb();
    }, function (cb) {
      const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
${spriteContent}</svg>`;

      const formatted = xmlFormatter(finalSvg, {
        indentation: '  ',
        collapseContent: true,
        lineSeparator: '\n',
      });

      // Guarda el resultado
      fs.writeFileSync('src/assets/icons/test/solid/weather.svg', formatted);
      cb();
    }));
}

gulp.task('svgstore', createSvgSprite);
