import esbuild from 'esbuild';
import postcss from 'esbuild-postcss';

esbuild.build({
  entryPoints: ['./front/input.css'],
  bundle: true,
  outfile: './front/public/output.css',
  plugins: [postcss()],
  minify: false,
  sourcemap: true,
}).catch(() => process.exit(1));
