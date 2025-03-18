import type { Nuxt } from '@nuxt/schema'

// Define a module function the way Nuxt expects
export default function(options: any, nuxt: Nuxt) {
  // Register components directory
  nuxt.hook('components:dirs', (dirs: any[]) => {
    dirs.push({
      path: './components',
      prefix: '',
      extensions: ['vue'],
      pathPrefix: false,
    })
  })
} 