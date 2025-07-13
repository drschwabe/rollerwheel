#!/usr/bin/env node

const { log, warn } = console

const { rollup } = require('rollup')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const nodePolyfills = require('rollup-plugin-polyfill-node')
const ignore = require('rollup-plugin-ignore')
const { existsSync } = require('fs')
const { join } = require('path')

const main = async () => {
  try {
    const cwd = process.cwd()
    const inputFile = join(cwd, 'client.js')
    
    // Check if client.js exists
    if (!existsSync(inputFile)) {
      warn(`Error: client.js not found in ${cwd}`)
      process.exit(1)
    }
    
    // Determine output path
    const staticDir = join(cwd, 'static')
    const outputFile = existsSync(staticDir) 
      ? join(staticDir, 'client.bundle.js')
      : join(cwd, 'client.bundle.js')
    
    log(`Bundling ${inputFile}...`)
    
    // Create bundle
    const bundle = await rollup({
      input: inputFile,
      plugins: [
        nodeResolve({
          browser: true,
          modulesOnly: false
        }),
        ignore(['inspector']),
        commonjs({
          transformMixedEsModules: true,
          requireReturnsDefault: 'auto'
        }),
        nodePolyfills()
      ]
    })
    
    // Write bundle
    await bundle.write({
      file: outputFile,
      format: 'iife',
      sourcemap: 'inline'
    })
    
    await bundle.close()
    
    log(`✓ Bundle created at ${outputFile}`)
  } catch (error) {
    warn(`Build failed: ${error.message}`)
    process.exit(1)
  }
}

main()
