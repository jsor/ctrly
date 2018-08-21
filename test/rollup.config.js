const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const istanbul = require('rollup-plugin-istanbul');

module.exports = {
    output: {
        format: 'iife'
    },
    plugins: [
        resolve(),
        commonjs(),
        istanbul({
            exclude: ['test/*.js', 'node_modules/**/*']
        }),
        babel({
            babelrc: false,
            presets: [['@babel/preset-env', {modules: false}]]
        })
    ]
};
