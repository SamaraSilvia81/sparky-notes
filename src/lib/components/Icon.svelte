<script>
  // Single-source line-icon set (24x24, stroke-based) so every icon in the
  // app — sidebar nav, category badges, breadcrumb — shares one visual
  // language instead of mixing in emoji glyphs.
  export let name = "bolt";
  export let size = 15;
  export let strokeWidth = 1.8;

  const paths = {
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />',
    code: '<polyline points="18 16 22 12 18 8" /><polyline points="6 8 2 12 6 16" /><line x1="14.5" y1="4" x2="9.5" y2="20" />',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5V4.5Z" /><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />',
    "pen-tool": '<path d="m12 19 7-7 3 3-7 7-3-3Z" /><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z" /><circle cx="11" cy="11" r="1.6" />',
    compass: '<circle cx="12" cy="12" r="9.5" /><polygon points="15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6 15.5 8.5" />',
    lightbulb: '<path d="M14.5 14.2c.4-1 1-1.7 1.7-2.5a5 5 0 1 0-8.4 0c.7.8 1.3 1.5 1.7 2.5" /><path d="M9.5 18h5" /><path d="M10.3 21.5h3.4" />',
    "chevron-down": '<polyline points="6 9 12 15 18 9" />',
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {@html paths[name] ?? paths.bolt}
</svg>

<style>
  svg {
    flex-shrink: 0;
    display: block;
  }
</style>
