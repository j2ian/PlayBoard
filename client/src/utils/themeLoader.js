/**
 * 動態載入主題相關的 Vue 元件
 *
 * 根據 theme 名稱動態 import 對應資料夾中的 view 元件
 * 例如：loadThemeComponent('default', 'PlayBookPlayer') 會載入 @/views/themes/default/PlayBookPlayer.vue
 */

/**
 * 載入指定主題的元件
 * @param {string} theme - 主題名稱 (例如: 'default', 'theme-a')
 * @param {string} componentName - 元件檔案名稱 (不含 .vue)
 * @returns {Promise<Component>} Vue 元件
 */
export const loadThemeComponent = (theme, componentName) => {
  // 使用動態 import 載入對應主題資料夾中的元件
  // Vite 需要使用字串模板來支援動態 import
  return import(`../views/themes/${theme}/${componentName}.vue`)
    .then((module) => module.default)
    .catch((error) => {
      console.error(
        `無法載入主題元件: themes/${theme}/${componentName}.vue`,
        error
      );
      // 如果載入失敗，嘗試載入預設主題
      if (theme !== "default") {
        console.warn(`嘗試載入預設主題: default/${componentName}.vue`);
        return import(`../views/themes/default/${componentName}.vue`).then(
          (module) => module.default
        );
      }
      throw error;
    });
};

/**
 * 建立 router 用的動態元件載入函數
 * @param {string} componentName - 元件檔案名稱 (不含 .vue)
 * @returns {Function} 回傳一個適用於 Vue Router 的元件載入函數
 */
export const createThemeRouteComponent = (componentName) => {
  // 回傳一個函數，這個函數會在 router 需要時被呼叫
  return () => {
    // 預設使用 default 主題
    // 實際的 theme 會在元件內部根據 playbook 資料動態切換
    return loadThemeComponent("default", componentName);
  };
};

/**
 * 主題設定清單
 * 未來新增主題時只需要在這裡加入新的項目即可
 */
const THEME_CONFIG = [
  {
    value: "default",
    label: "預設主題",
    description: "系統預設的主題樣式",
  },
  {
    value: "jungle",
    label: "叢林主題",
    description: "充滿自然氣息的叢林風格主題",
  },
  {
    value: "ocean",
    label: "海洋主題",
    description: "海洋風格主題",
  },
  // 未來新增主題時在這裡加入：
  // {
  //   value: 'theme-a',
  //   label: '主題 A',
  //   description: '主題 A 的說明'
  // }
];

/**
 * 取得所有可用的主題列表（僅主題名稱）
 * @returns {Array<string>} 主題名稱陣列
 */
export const getAvailableThemes = () => {
  return THEME_CONFIG.map((theme) => theme.value);
};

/**
 * 取得完整的主題設定清單（包含 label 和 description）
 * @returns {Array<{value: string, label: string, description: string}>} 主題設定陣列
 */
export const getThemeOptions = () => {
  return THEME_CONFIG;
};

/**
 * 取得特定主題的設定
 * @param {string} themeValue - 主題名稱
 * @returns {{value: string, label: string, description: string} | null} 主題設定物件
 */
export const getThemeConfig = (themeValue) => {
  return THEME_CONFIG.find((theme) => theme.value === themeValue) || null;
};

/**
 * 驗證主題是否存在
 * @param {string} theme - 主題名稱
 * @returns {boolean} 主題是否存在
 */
export const isThemeAvailable = (theme) => {
  return THEME_CONFIG.some((t) => t.value === theme);
};
