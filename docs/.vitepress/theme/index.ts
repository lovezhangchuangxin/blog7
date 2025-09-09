import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { inBrowser } from "vitepress";
// @ts-ignore
import busuanzi from "busuanzi.pure.js";
import Layout from "./components/Layout.vue";
import "./index.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    if (inBrowser) {
      router.onAfterRouteChange = () => {
        busuanzi.fetch();
      };
    }
  },
  // 使用注入插槽的包装组件覆盖 Layout
  Layout: Layout,
} satisfies Theme;
