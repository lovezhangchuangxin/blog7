import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blog7/",
  title: "My Personal Blog",
  description: "个人博客",
  head: [["link", { rel: "icon", href: "aqing.ico" }]],
  themeConfig: {
    logo: "/aqing.ico",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: "js",
        items: [
          {
            text: "typescript",
            link: "/js/typescript/index.md",
          },
          {
            text: "nodejs",
            link: "/js/nodejs/index.md",
          },
        ],
      },
      {
        text: "rust",
        link: "/rust/index.md",
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/lovezhangchuangxin/blog7",
      },
    ],

    footer: {
      message: "Released under the MIT License",
      copyright: "Copyright © 2023 lovezhangchuangxin",
    },

    search: {
      provider: "local",
    },

    lastUpdated: {
      text: "最近更新于",
    },
  },
  vite: {
    resolve: {
      alias: {},
    },
  },
});
