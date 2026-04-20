# AI Agent Instructions — Storybook MCP

Este repositorio tiene Storybook 10 con el MCP server activo en `http://localhost:6006/mcp`.

## Prerrequisitos

Antes de generar o modificar stories, asegurate de que Storybook esté corriendo:

```bash
npm run storybook
```

## Herramientas MCP disponibles

| Herramienta                       | Uso                                                              |
| --------------------------------- | ---------------------------------------------------------------- |
| `list-all-documentation`          | Listar todos los componentes documentados en Storybook           |
| `get-documentation`               | Obtener props, descripción y ejemplos de un componente           |
| `get-storybook-story-instructions`| Obtener instrucciones para escribir stories correctamente        |
| `run-story-tests`                 | Ejecutar tests de accesibilidad y visuales de las stories        |

## Reglas para generar stories

1. **Nunca inventar props** — usar `get-documentation` para obtener las props reales antes de escribir el story.
2. **Formato CSF3** — named exports + `satisfies Meta<typeof Component>`.
3. **Un concepto por story** — cada export representa un estado específico del componente.
4. **Tag `autodocs`** — siempre incluir `tags: ['autodocs']` en el meta.
5. **Estado del store** — los componentes que usan `useProductsStore` requieren un decorator que llame a `useProductsStore.setState({...})` antes de renderizar.
6. **Validar con tests** — después de crear stories, ejecutar `run-story-tests` para verificar a11y y render.

## Convención de archivos

Colocar el story junto al componente: `src/components/ComponentName.stories.tsx`

## Estructura de story tipo

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MyComponent } from "./MyComponent";

/** Descripción JSDoc del componente */
const meta = {
  title: "Components/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Descripción del estado que representa este story */
export const Default: Story = {};
```

## Componentes y sus stories

| Componente      | Story file                              | Depende del store |
| --------------- | --------------------------------------- | ----------------- |
| Header          | Header.stories.tsx                      | No                |
| Footer          | Footer.stories.tsx                      | No                |
| Cafecito        | Cafecito.stories.tsx                    | No                |
| EmptyState      | EmptyState.stories.tsx                  | No                |
| Disclaimer      | Disclaimer.stories.tsx                  | No                |
| MissionModal    | MissionModal.stories.tsx                | No                |
| DarkMode        | DarkMode.stories.tsx                    | No                |
| BrandFilter     | BrandFilter.stories.tsx                 | Sí                |
| StoreFilter     | StoreFilter.stories.tsx                 | Sí                |
| StoresList      | StoresList.stories.tsx                  | Sí                |
| SearchForm      | SearchForm.stories.tsx                  | Sí                |
| SearchRow       | SearchRow.stories.tsx                   | Sí                |
| ProductList     | ProductList.stories.tsx                 | Sí                |
| ResultsHeader   | ResultsHeader.stories.tsx               | Sí                |
| ErrorAlert      | ErrorAlert.stories.tsx                  | Sí                |
