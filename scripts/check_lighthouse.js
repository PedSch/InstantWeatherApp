#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const file = process.argv[2]
if (!file) {
  console.error('Usage: node check_lighthouse.js <report.json>')
  process.exit(2)
}

const report = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'))

// Configure thresholds here (0-100)
const thresholds = {
  performance: 50,
  accessibility: 80,
  'best-practices': 80,
  seo: 50
}

const categories = report.categories || {}
let failed = false
for (const key of Object.keys(thresholds)) {
  const cat = categories[key]
  const score = cat ? Math.round((cat.score || 0) * 100) : 0
  console.log(`${key}: ${score} (threshold ${thresholds[key]})`)
  if (score < thresholds[key]) {
    console.error(`ERROR: ${key} score ${score} is below threshold ${thresholds[key]}`)
    failed = true
  }
}

if (failed) process.exit(1)
console.log('Lighthouse thresholds satisfied')