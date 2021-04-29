const nodeResolve = require('@rollup/plugin-node-resolve');
const babel = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const istanbul = require('rollup-plugin-istanbul');

module.exports = {
    output: {
        format: 'iife'
    },
    plugins: [
        nodeResolve.nodeResolve(),
        commonjs(),
        istanbul({
            exclude: ['test/*.js', 'node_modules/**/*']
        }),
        babel.babel({
            babelrc: false,
            babelHelpers: 'bundled',
            presets: [['@babel/preset-env', {modules: false}]]
        })
    ]
};
