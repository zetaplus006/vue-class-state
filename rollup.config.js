
import uglify from 'rollup-plugin-uglify-es';
// import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-post-replace';
import filesize from 'rollup-plugin-filesize';
const version = process.env.VERSION || require('./package.json').version;
const banner = `/**
 * vubx v${version}
 * (c) ${new Date().getFullYear()} zetaplus006
 * @license MIT
 */`
const entry = 'src/index.ts';
const moduleName = 'Vubx';

const options = [{
    dest: 'lib/vubx.esm.js',
    format: 'es'
}, {
    dest: 'lib/vubx.common.js',
    format: 'cjs'
}, {
    dest: 'lib/vubx.js',
    format: 'umd',
    env: '"development"'
}, {
    dest: 'lib/vubx.min.js',
    format: 'umd',
    isMin: true
}]

export default options.map(({ dest, format, env, isMin }) => {
    const config = {
        entry,
        dest,
        banner,
        moduleName,
        format,
        plugins: [
            typescript(),
            filesize()
        ]
    }
    if (isMin) {
        config.plugins.push(uglify({
            ie8: false
        }));
    }
    if (env) {
        config.plugins.unshift(replace({
            'process.env.NODE_ENV': env
        }))
    }
    return config;
})

