<template>
  <div style="margin-top: 2rem">
    <Giscus
      id="comments"
      :key="route.path"
      repo="lovezhangchuangxin/blog7"
      repo-id="R_kgDOPg8LBA"
      category="Announcements"
      category-id="DIC_kwDOPg8LBM4CudIZ"
      mapping="pathname"
      strict="0"
      term="欢迎评论!"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="top"
      lang="zh-CN"
      loading="lazy"
      :theme="isDark ? 'dark_tritanopia' : 'light_tritanopia'"
    >
    </Giscus>
  </div>
</template>

<script setup lang="ts">
import Giscus from "@giscus/vue";
import { watch } from "vue";
import { inBrowser, useData, useRoute } from "vitepress";

const { isDark } = useData();
const route = useRoute();

watch(isDark, (dark) => {
  if (!inBrowser) return;

  const iframe = document
    .querySelector("giscus-widget")
    ?.shadowRoot?.querySelector("iframe");

  iframe?.contentWindow?.postMessage(
    {
      giscus: {
        setConfig: { theme: dark ? "dark_tritanopia" : "light_tritanopia" },
      },
    },
    "https://giscus.app"
  );
});
</script>
