import clean from 'rollup-plugin-clean';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import {uglify} from 'rollup-plugin-uglify';

const pkg = require('./package.json');

const now = new Date();
const banner = () => {
    return '/*!\n' +
        ' * ' + (pkg.title || pkg.name) + ' v' + pkg.version + '\n' +
        ' * Copyright (c) ' + now.getFullYear() + ' ' + pkg.author.name + '\n' +
        ' * License: ' + pkg.license + '\n' +
        ' */';
};

const cleanPlugin = clean();
const resolvePlugin = resolve();
const babelPlugin = babel({
    babelrc: false,
    presets: [['@babel/preset-env', {modules: false}]]
});
const cleanupPlugin = cleanup({
    comments: 'some'
});

export default [
    {
        input: 'src/ctrly.js',
        output: {
            banner: banner(),
            file: 'dist/ctrly.mjs',
            format: 'es'
        },
        plugins: [
            cleanPlugin,
            resolvePlugin,
            babelPlugin,
            cleanupPlugin
        ]
    },
    {
        input: 'src/ctrly.js',
        output: {
            banner: banner(),
            file: 'dist/ctrly.js',
            format: 'umd',
            name: 'ctrly'
        },
        plugins: [
            cleanPlugin,
            resolvePlugin,
            babelPlugin,
            cleanupPlugin
        ]
    },
    {
        input: 'src/ctrly.js',
        output: {
            banner: banner(),
            file: 'dist/ctrly.min.js',
            format: 'umd',
            name: 'ctrly'
        },
        plugins: [
            cleanPlugin,
            resolvePlugin,
            babelPlugin,
            cleanupPlugin,
            uglify({
                output: {
                    comments: 'all'
                }
            })
        ]
    }
];
