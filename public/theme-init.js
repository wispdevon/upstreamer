(() => {
  const schemeMeta = document.querySelector('meta[name="color-scheme"]');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  try {
    const saved = localStorage.getItem("upstreamer-theme");
    if (saved === "light" || saved === "dark") schemeMeta.content = saved;
  } catch {
    // The page still follows the operating system when storage is unavailable.
  }

  const isDark =
    schemeMeta.content === "dark" ||
    (schemeMeta.content === "light dark" &&
      matchMedia("(prefers-color-scheme: dark)").matches);
  if (themeColorMeta) themeColorMeta.content = isDark ? "#1b1d19" : "#f8f7f3";
})();
