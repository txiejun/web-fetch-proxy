/*
 * author: txiejun
 * email: txiejun@126.com
 */
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';
import pkg from "./package.json";
const {formatDate} = require("./build/utils.js");
const stripBanner = require('rollup-plugin-strip-banner');

function getBanner(fileName) {
    let day = new Date();
    let result = [
        '/*!',
        ` * ${fileName}.js - ${pkg.version} - ${formatDate(null, "YYYY-MM-DD")}`,
        ' * ',
        ` * Copyright (c) ${day.getFullYear()} ${pkg.author.name};`,
        ` * Licensed under the ${pkg.license} license`,
        ' */'
    ].join('\n');
    return result;
}

/**
 * 
 * @param {*} input entry files
 * @param {*} outputFileName Output file name
 * @param {*} name The global variable name attached to the window in UMD mode.
 * @returns 
 */
function getConfig(input, outputFileName, name) {
    return {
        input: input,
        output: [
            {
                file: `dist/${outputFileName}.js`,
                format: 'umd',
                name: name,
                banner: getBanner(outputFileName)
            },
            {
                file: `dist/${outputFileName}.min.js`,
                format: 'umd',
                name: name,
                banner: getBanner(outputFileName),
                sourcemap: true,
                plugins: [terser({
                    compress: {
                        // drop_console: true,
                        drop_debugger: true,
                        pure_funcs: ['console.log']
                    }
                })]
            }
        ],
        external: [],
        plugins: [
            resolve({
                customResolveOptions: {
                    moduleDirectory: ['src', 'node_modules']
                }
            }),
            stripBanner(),
            babel({
                exclude: 'node_modules/**',
                runtimeHelpers: true
            }),
            commonjs()
        ]
    }
}

export default [
    getConfig('src/index.js', 'web-fetch-proxy', 'webFetchProxy'),
]
