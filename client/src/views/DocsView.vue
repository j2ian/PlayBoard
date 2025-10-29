<template>
  <div class="docs-isolated">
    <div id="docsify-app"></div>
  </div>
</template>

<script>
export default {
  name: 'DocsView',

  mounted() {

    this.initDocsify();
  },

  methods: {


    initDocsify() {
      // 配置 Docsify
      window.$docsify = {
        el: '#docsify-app',
        basePath: '/PlayBoard/docs/',           // MD 檔案路徑
        loadSidebar: true,             // 載入 _sidebar.md
        loadNavbar: false,             // 不載入導航欄
        subMaxLevel: 2,                // TOC 最多顯示 H3
        auto2top: true,                // 切換頁面自動回到頂部
        name: 'PlayBoard',               // 側邊欄標題
        repo: 'j2ian/PlayBoard', // GitHub 連結(可選)
        search: {                      // 搜尋功能
          placeholder: '搜尋',
          noData: '找不到結果',
        },
        alias: {
          "/.*/_sidebar.md": "/_sidebar.md", // 不加這行的話讀取資料夾內的md時sidebar就會爆掉
        },

      };

      // 動態載入 CSS
      this.loadCSS('//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css');

      // 動態載入 Docsify 核心
      this.loadScript('//cdn.jsdelivr.net/npm/docsify@4/lib/docsify.min.js');

      // 載入搜尋插件
      this.loadScript('//cdn.jsdelivr.net/npm/docsify@4/lib/plugins/search.min.js');

      // 載入程式碼高亮(可選)
      this.loadScript('//cdn.jsdelivr.net/npm/prismjs@1/components/prism-javascript.min.js');
    },

    loadCSS(href) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    },

    loadScript(src) {
      const script = document.createElement('script');
      script.src = src;
      document.body.appendChild(script);
    }
  },

  beforeUnmount() {
    delete window.$docsify;
  }
}
</script>
<style>
.page-wrapper {
  all: initial;
  display: block;
  width: 100vw;
  min-height: 100vh;
}

.docs-isolated {
  all: initial;
  display: block;
  width: 100%;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 完全阻斷外部樣式 */
.docs-isolated * {
  all: revert;
}
</style>