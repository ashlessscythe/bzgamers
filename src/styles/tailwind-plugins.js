/**
 * Custom Tailwind CSS plugins
 * 
 * This file contains custom plugins for Tailwind CSS that extend its functionality.
 */

// Line clamp plugin for truncating text at a specific number of lines
const plugin = require('tailwindcss/plugin')

const lineClampPlugin = plugin(function({ addUtilities, theme, e }) {
  const utilities = {}
  const lineClamps = theme('lineClamp', { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 })

  Object.entries(lineClamps).forEach(([key, value]) => {
    utilities[`.${e(`line-clamp-${key}`)}`] = {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': `${value}`
    }
  })

  utilities['.line-clamp-none'] = {
    '-webkit-line-clamp': 'unset'
  }

  addUtilities(utilities)
})

module.exports = {
  lineClampPlugin
}
