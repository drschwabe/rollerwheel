#!/usr/bin/env node

const { log, warn } = console

const { rollup, watch } = require('rollup')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const nodePolyfills = require('rollup-plugin-polyfill-node')
const ignore = require('rollup-plugin-ignore')
const babel = require('@rollup/plugin-babel').babel
const { existsSync } = require('fs')
const { join, dirname } = require('path')
const json  = require('@rollup/plugin-json') 

// Parse command line args
const args = process.argv.slice(2)
const watchMode = args.includes('--watch') || args.includes('-w')

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
    
    const config = {
      input: inputFile,
      plugins: [
        nodeResolve({
          browser: true,
          modulesOnly: false
        }),
        babel({
          babelHelpers: 'bundled',
          presets: [
            [require.resolve('@babel/preset-env'), {
              targets: '> 0.25%, not dead',
              loose: true
            }]
          ],
          plugins: [
            [require.resolve('@babel/plugin-proposal-pipeline-operator'), { 
              proposal: 'minimal'
            }]
          ],
          // Make sure Babel processes files from the project directory
          exclude: 'node_modules/**',
          babelrc: false,
          configFile: false
        }),
        
        ignore(['inspector']),
        commonjs({
          transformMixedEsModules: true,
          requireReturnsDefault: 'auto'
        }),
        nodePolyfills()
      ],
      output: {
        file: outputFile,
        format: 'iife',
        sourcemap: 'inline'
      }
    }
    
    if (watchMode) {
      log(`Watching ${inputFile} for changes...`)
      
      const watcher = watch(config)
      
      watcher.on('event', event => {
        if (event.code === 'START') {
          log('Building...')
        } else if (event.code === 'BUNDLE_END') {
          log(`✓ Bundle created at ${outputFile} (${event.duration}ms)`)
        } else if (event.code === 'ERROR') {
          warn(`Build error: ${event.error.message}`)
        }
      })
      
      // Handle Ctrl+C
      process.on('SIGINT', () => {
        log('\nStopping watcher...')
        watcher.close()
        process.exit(0)
      })
    } else {
      log(`Bundling ${inputFile}...`)
      
      const bundle = await rollup(config)
      await bundle.write(config.output)
      await bundle.close()
      
      log(`✓ Bundle created at ${outputFile}`)
    }
  } catch (error) {
    warn(`Build failed: ${error.message}`)
    process.exit(1)
  }
}

main()