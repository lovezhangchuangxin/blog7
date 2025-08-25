<template>
  <div class="page-view-stat">
    <div class="page-view-stat-inner">
      <p>本站总访问量 <span id="busuanzi_value_site_pv" /> 次</p>
      <p>本站访客数 <span id="busuanzi_value_site_uv" /> 人次</p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
.page-view-stat {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .page-view-stat-inner {
    background: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 8px;
    font-size: 15px;
    color: #444;
    padding: 18px 28px;

    p {
      margin: 0;

      span {
        font-weight: bold;
        color: #007bff;
        margin-left: 4px;
      }
    }
  }
}

.dark .page-view-stat-inner {
  background: #202127;
  color: #f8f9fa;

  span {
    color: #17a2b8;
  }
}
</style>
