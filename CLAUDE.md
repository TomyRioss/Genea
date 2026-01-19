# Instrucciones del Proyecto - Landing Page

## ⛔ NUNCA ASUMIR - PREGUNTAR SIEMPRE (MÁXIMA PRIORIDAD)
- **JAMÁS asumir** la causa de un error o problema
- **SIEMPRE preguntar** al usuario antes de implementar una solución
- Ante cualquier duda o ambigüedad: **PREGUNTAR**
- No inventar soluciones basadas en suposiciones
- Si algo falla, pedir más contexto antes de actuar
- Esta regla aplica a: errores, configuraciones, decisiones de diseño, etc.

## ⛔ SEGURIDAD - APIs DE TERCEROS (MÁXIMA PRIORIDAD)
**NUNCA exponer datos de APIs de terceros al cliente. Esto incluye:**
- Prompts construidos internamente
- URLs de APIs externas
- Modelos, IDs internos o metadata de servicios externos
- Respuestas completas de APIs de terceros

**Reglas obligatorias:**
1. El cliente SOLO envía parámetros básicos (IDs, opciones del usuario)
2. El servidor construye prompts, URLs y payloads internamente
3. Las respuestas al cliente SOLO contienen datos necesarios (IDs de seguimiento, status, resultados finales)
4. NUNCA pasar `prompt` u otros datos sensibles desde el cliente al servidor
5. NUNCA devolver respuestas raw de APIs externas al cliente

**VIOLACIÓN = CANCELACIÓN INMEDIATA DEL PROYECTO**

## Stack Tecnológico
- **TailwindCSS obligatorio** - No usar CSS puro bajo ninguna circunstancia
- **NUNCA crear fondos CSS propios** - Solo usar componentes de terceros o librerías
- Clases utilitarias de Tailwind para todos los estilos
- **shadcn/ui obligatorio** - Usar para todos los componentes UI cuando sea posible

## Componentes Reutilizables (CRÍTICO)
- **Siempre priorizar reutilización** - No duplicar código
- Crear componentes genéricos con props configurables
- Usar shadcn como base y extender según necesidad
- Extraer patrones repetidos en componentes compartidos
- Documentar props y variantes de cada componente

## Arquitectura MVC y Modularización
- Seguir patrón Modelo-Vista-Controlador
- Separar lógica de negocio, presentación y datos
- **Máximo 500 líneas por componente** - Si excede, dividir en subcomponentes
- Scaffolding modular con responsabilidades claras:
  - `/components` - Componentes UI reutilizables
  - `/views` - Páginas/secciones principales
  - `/controllers` - Lógica y handlers
  - `/models` - Estructuras de datos

## Paleta de Colores
- **Monocromática** (escala de grises/neutros)
- Usar variables de Tailwind: `gray-50` a `gray-900`
- Mantener consistencia en toda la landing

## Diseño UX/UI
- Mobile-first obligatorio
- Jerarquía visual clara
- Espaciado consistente (sistema de 4px/8px)
- Tipografía legible y escalable
- CTAs prominentes y accesibles
- Feedback visual en interacciones

## Responsividad (CRÍTICO)
- **Prioridad alta**: Muchos usuarios mobile y desktop
- Usar breakpoints de Tailwind: `sm:`, `md:`, `lg:`, `xl:`
- **PROHIBIDO**: Componentes con `position: fixed` o `absolute` que dificulten responsividad
- Usar Flexbox (`flex`) y Grid (`grid`) para layouts
- Unidades relativas (`%`, `rem`, `vw/vh`) sobre absolutas (`px`)
- Testear en múltiples viewports

## Apariencia
- Profesional y moderna
- Limpia y minimalista
- Animaciones sutiles (no excesivas)
- Imágenes optimizadas y lazy-loaded

## Buenas Prácticas
- Nombres descriptivos para clases y componentes
- Comentarios solo cuando sean necesarios
- Accesibilidad (ARIA, semántica HTML5)
- Performance: evitar re-renders innecesarios
- SEO básico en estructura HTML

## Investigación y Documentación (CRÍTICO)
- **SIEMPRE buscar documentación oficial** antes de implementar o solucionar errores
- Ante cualquier error o problema, buscar en:
  - Documentación oficial de la herramienta
  - GitHub Issues del proyecto
  - StackOverflow
  - Reddit (r/nextjs, r/reactjs, r/webdev, etc.)
- **NUNCA asumir** cómo funciona una herramienta sin verificar
- Leer changelogs cuando hay problemas de versiones
- Verificar breaking changes en actualizaciones mayores
- Si una solución no funciona, investigar más antes de probar otra cosa
