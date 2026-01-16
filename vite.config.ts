// @ts-nocheck
import { prettierFormat } from 'vite-plugin-prettier-format';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';
import { builtinModules } from 'node:module';

export default defineConfig({
  resolve: {
    alias: {
      "eslint-plugin-perfectionist": path.resolve(__dirname, 'node_modules/eslint-plugin-perfectionist'),
    }
  },
  plugins: [
    dts({
      beforeWriteFile: (filePath, content) => ({
        content: content.replaceAll(
          /(?<importPath>(?:from|import\s*\()\s*["']\..*?)(?<quote>["'])/gu,
          (...replaceArguments) => {
            let { importPath, quote } = replaceArguments.at(-1) as {
              importPath: string
              quote: string
            }
            if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
              return `${importPath}${quote}`
            }
            return `${importPath}.js${quote}`
          },
        ),
        filePath,
      }),
      include: [
        path.join(import.meta.dirname, 'index.ts'),
        path.join(import.meta.dirname, 'types'),
        path.join(import.meta.dirname, 'rules'),
        path.join(import.meta.dirname, 'utils'),
      ],
      insertTypesEntry: true,
      copyDtsFiles: true,
      strictOutput: true,
    }),
    prettierFormat(),
  ],
  build: {
    lib: {
      entry: [
        path.resolve(import.meta.dirname, 'index.ts'),
      ],
      fileName: (_format, entryName) => `${entryName}.js`,
      name: 'eslint-plugin',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        preserveModules: false,
        inlineDynamicImports: true,
        banner: `
          // import { fileURLToPath } from "node:url";
          import path from "node:path";
          
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);
        `,
      },
      external: [
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
      ],
    },
    minify: true,
  },
});
