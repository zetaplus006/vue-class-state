
import uglify from 'rollup-plugin-uglify-es';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-post-replace';
import filesize from 'rollup-plugin-filesize';
const version = process.env.VERSION || require('./package.json').version;
const banner =
    `/**
 * vue-class-state v${version}
 * (c) ${new Date().getFullYear()} zetaplus006
 * @license MIT
 */`
const entry = 'src/vue-class-state.ts';
const moduleName = 'vue-class-state';

const options = [{
    dest: 'lib/vue-class-state.esm.js',
    format: 'es'
}, {
    dest: 'lib/vue-class-state.common.js',
    format: 'cjs'
}, {
    dest: 'lib/vue-class-state.js',
    format: 'umd',
    env: '"development"'
}, {
    dest: 'lib/vue-class-state.min.js',
    format: 'umd',
    env: '"production"',
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
        ],
        external: ['vue']
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

