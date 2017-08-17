
import uglify from 'rollup-plugin-uglify-es';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const entry = 'src/index.ts'
const basePlugins = [
    resolve(),
    typescript()
]
const minPlugins = basePlugins.concat([uglify()]);

export default [{
    entry,
    plugins: basePlugins,
    dest: 'lib/vubx.esm.js',
    format: 'es'
}, {
    entry,
    plugins: basePlugins,
    dest: 'lib/vubx.js',
    format: 'umd',
    moduleName: 'Vubx'
}, {
    entry,
    plugins: minPlugins,
    dest: 'lib/vubx.min.js',
    format: 'umd',
    moduleName: 'Vubx'
}]


/* export default {
    entry: 'src/index.ts',
    //if es suglify bug
    // format: 'es',
    // dest: 'lib/vubx.js',
    plugins: [
        resolve(),
        typescript(),
        // uglify()
    ],
    targets: [
        {
            dest: 'lib/vubx.esm.js',
            format: 'es'
        },
        {
            dest: 'lib/vubx.min.js',
            format: 'es',
            plugins: [
                uglify()
            ]
        }
    ]
} */