# 設定

1. 使用 Vue 3 + Vite + Element Plus + TailwindCSS。
2. 所有畫面 layout 請以 Tailwind 為優先（例如 flex, grid, spacing）。
3. 不要在 <template> 中直接寫 CSS 樣式（例如 style="..." 或 class="text-red"），若有樣式需求請使用 Tailwind 或提取 class。
4. 所有元件請維持簡潔結構，避免巢狀過深。
5. 組件命名統一使用 PascalCase，例如：`UserForm.vue`, `LoginCard.vue`。
6. 資料表與表單元件請優先使用 Element Plus 元件。
7. 所有樣式變化請盡量使用 Tailwind utility class，避免寫 `<style>` 區塊。
8. 若需要複用樣式，請提取到 `src/styles/components.scss` 或使用全域 class。
9. 務必使用繁體中文或英文，禁止使用簡體中文。
10. 所有步驟需要先列出 to-do list 再執行。
11. 使用註解時，不能使用簡體中文用語，例如"添加"需使用"新增"
12. 永遠不執行任何 bash 指令，因為你會當機
