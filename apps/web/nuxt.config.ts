import path from "node:path";
import { getBaseUrl } from "utils";
import { config } from "../../config";

const baseUrl = getBaseUrl();

export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  compatibilityDate: '2025-03-16',

  alias: {
    "@config": path.resolve(__dirname, path.join("..", "..", "config")),
  },

  experimental: {
    typedPages: true,
    cookieStore: false,
  },

  runtimeConfig: {
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    public: {
      siteUrl: baseUrl,
      s3AvatarsBucketName: process.env.NUXT_PUBLIC_S3_AVATARS_BUCKET_NAME,
      analytics: {
        googleAnalyticsId: process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_ID,
        mixpanelToken: process.env.NUXT_PUBLIC_MIXPANEL_TOKEN,
        pirschCode: process.env.NUXT_PUBLIC_PIRSCH_CODE,
        plausibleUrl: process.env.NUXT_PUBLIC_PLAUSIBLE_URL,
        umamiTrackingId: process.env.NUXT_PUBLIC_UMAMI_TRACKING_ID,
      },
      auth: {
        redirectPath: "/app/dashboard",
      },
    },
  },

  imports: {
    dirs: [
      "modules/saas/auth/composables/**",
      "modules/saas/dashboard/composables/**",
      "modules/saas/shared/**",
      "modules/shared/composables/**",
      "modules/shared/utils/**",
      "modules/ui/lib/**",
      "modules/marketing/shared/util/**",
      "modules/marketing/content/**",
    ],
  },

  components: [
    { path: "@/modules/shared/components", pathPrefix: false },
    { path: "@/modules/marketing/shared/components", pathPrefix: false },
    { path: "@/modules/marketing/home/components", pathPrefix: false },
    { path: "@/modules/marketing/blog/components", pathPrefix: false },
    { path: "@/modules/marketing/faq/components", pathPrefix: false },
    { path: "@/modules/marketing/changelog/components", pathPrefix: false },
    { path: "@/modules/marketing/content/components", pathPrefix: false },
    { path: "@/modules/marketing/pricing/components", pathPrefix: false },
    { path: "@/modules/saas/admin/components", pathPrefix: false },
    { path: "@/modules/saas/auth/components", pathPrefix: false },
    { path: "@/modules/saas/dashboard/components", pathPrefix: false },
    { path: "@/modules/saas/onboarding/components", pathPrefix: false },
    { path: "@/modules/saas/settings/components", pathPrefix: false },
    { path: "@/modules/saas/shared/components", pathPrefix: false },
    { path: "@/modules/ui/components", pathPrefix: false },
  ],

  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/icon.png",
        },
      ],
    },
  },

  build: {
    transpile: ["trpc-nuxt"],
  },

  modules: [
    "@nuxtjs/i18n", // configured here and in i18n.config.ts
    "@nuxtjs/tailwindcss", // configured in tailwind.config.ts
    "@nuxtjs/google-fonts",
    "@nuxtjs/color-mode",
    "@nuxt/content",
    "@nuxt/image",
    "@vue-email/nuxt",
    "shadcn-nuxt",
    "@nuxtjs/seo",
    "@vee-validate/nuxt",
    "@vueuse/nuxt",
    // UI components are registered directly in the components config above
  ],

  // @nuxtjs/i18n
  i18n: {
    locales: Object.entries(config.i18n.locales).map(([code, locale]) => ({
      code,
      file: `${code}.json`,
      name: locale.label,
    })),
    defaultLocale: config.i18n.defaultLocale,
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: config.i18n.cookieName,
      redirectOn: "root",
    },
    lazy: true,

    langDir: path.join("..", "..", "packages", "i18n", "translations"),
  },

  // @nuxtjs/google-fonts
  googleFonts: {
    display: "swap",
    families: {
      "DM Sans": [400, 500, 600, 700],
    },
  },

  // @nuxtjs/color-mode
  colorMode: {
    preference: "system",
    fallback: "light",
    classSuffix: "",
    storageKey: "NUXT_COLOR_MODE",
  },

  // @nuxt/content
  content: {
    markdown: {
      anchorLinks: false,
    },
  },

  // @nuxt/image
  image: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },

  shadcn: {
    prefix: "",
    componentDir: "./modules/ui/components",
  },

  // nuxt-simple-robots
  robots: {
    allow: "*",
    // sitemap: 'sitemap.xml',
  },

  // @vue-email/nuxt
  vueEmail: {
    baseUrl,
    tailwind: {
      // Use a simplified theme configuration that can be properly serialized
      theme: {
        extend: {
          colors: {
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            primary: {
              DEFAULT: "hsl(var(--primary))",
              foreground: "hsl(var(--primary-foreground))",
            },
            secondary: {
              DEFAULT: "hsl(var(--secondary))",
              foreground: "hsl(var(--secondary-foreground))",
            },
            destructive: {
              DEFAULT: "hsl(var(--destructive))",
              foreground: "hsl(var(--destructive-foreground))",
            },
            success: {
              DEFAULT: "hsl(var(--success))",
              foreground: "hsl(var(--success-foreground))",
            },
            highlight: {
              DEFAULT: "hsl(var(--highlight))",
              foreground: "hsl(var(--highlight-foreground))",
            },
          }
        }
      }
    }
  },

  // @vee-validate/nuxt
  veeValidate: {
    // disable or enable auto imports
    autoImports: true,
    // Use different names for components
    componentNames: {
      Form: "Form",
      Field: "FormField",
      ErrorMessage: "ErrorMessage",
    },
  },

  // Add Nitro configuration for proper Vercel deployment
  nitro: {
    preset: 'vercel',
  },
});
