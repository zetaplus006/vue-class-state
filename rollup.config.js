
import uglify from 'rollup-plugin-uglify-es';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
export default {
    entry: 'src/index.ts',
    //if es suglify bug
    format: 'es',
    dest: 'lib/vubx.js',
    plugins: [
        resolve(),
        typescript(),
        uglify()
    ]
}