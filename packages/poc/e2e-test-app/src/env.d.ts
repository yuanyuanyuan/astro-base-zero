/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'virtual:brand' {
  const brand: import('@astro-base-zero/core/brand').Brand;
  export default brand;
} 