
import typescript from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';
const version = process.env.VERSION || require('./package.json').version;
const banner =
    `/**
 * vue-class-state v${version}
 * (c) ${new Date().getFullYear()} zetaplus006
 * @license MIT
 */`
const input = 'src/vue-class-state.ts';
const name = 'vue-class-state';

const options = [{
    file: 'lib/vue-class-state.esm.js',
    format: 'es'
}, {
    file: 'lib/vue-class-state.common.js',
    format: 'cjs'
}]

export default options.map(({ file, format, env, isMin }) => {
    const config = {
        input,
        output: {
            name,
            file,
            format,
            banner
        },
        plugins: [
            typescript(),
            filesize()
        ],
        external: ['vue']
    }
    return config;
})

