// Plain JavaScript module function
export default function (options, nuxt) {
  // Register components directory
  nuxt.hook('components:dirs', (dirs) => {
    dirs.push({
      path: './components',
      prefix: '',
      extensions: ['vue'],
      pathPrefix: false,
    })
  })
} 