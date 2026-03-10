import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Determine if we're in production
  const isProduction = mode === 'production'
  
  return {
    plugins: [react()],
    
    // Build optimizations for production
    build: {
      // Enable minification in production (esbuild is faster than terser)
      minify: isProduction ? 'esbuild' : false,
      // Source maps for debugging (disable in production for smaller builds)
      sourcemap: !isProduction,
      // Chunk size warning limit (in KB)
      chunkSizeWarningLimit: 1000,
      // Target modern browsers for smaller bundle size
      target: 'es2015',
      // CSS code splitting
      cssCodeSplit: true,
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching and parallel loading
          manualChunks: (id) => {
            // React and router
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // UI libraries
            if (id.includes('framer-motion') || id.includes('lottie-react')) {
              return 'ui-vendor';
            }
            // Three.js and related
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            // Axios
            if (id.includes('axios')) {
              return 'axios-vendor';
            }
            // React Icons (large library, split separately)
            if (id.includes('react-icons')) {
              return 'icons-vendor';
            }
          },
          // Optimize chunk file names for better caching
          chunkFileNames: isProduction 
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          entryFileNames: isProduction
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          assetFileNames: isProduction
            ? 'assets/[ext]/[name]-[hash].[ext]'
            : 'assets/[ext]/[name].[ext]',
        },
      },
      // Report compressed size
      reportCompressedSize: true,
      // Esbuild options for production minification
      // Note: drop_console is handled by our logger utility, but we can also remove it here
      esbuild: isProduction ? {
        drop: ['console', 'debugger'], // Remove console and debugger in production
      } : {},
    },
    
    // Development server configuration
    server: {
      port: 5173,
      open: !isProduction,
    },
    
    // Preview server configuration (for testing production builds)
    preview: {
      port: 4173,
    },
  }
})
