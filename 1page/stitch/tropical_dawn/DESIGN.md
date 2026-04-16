# Design System: Tropical Sunrise Editorial

## 1. Overview & Creative North Star: "The Ethereal Atoll"
This design system moves away from the rigid, cold grids of traditional booking platforms and toward a "High-End Editorial" experience. The Creative North Star is **The Ethereal Atoll**—a concept that mimics the soft transition of light at dawn over a tropical horizon. 

We achieve a premium feel through **Intentional Asymmetry** and **Tonal Depth**. By layering surfaces of varying warmth rather than using harsh lines, we create a digital environment that feels as tactile and peaceful as a heavy-stock paper receipt from a luxury boutique. The UI does not just hold information; it curates it through expansive breathing room and sophisticated typographic scales.

---

## 2. Colors: The Dawn Spectrum
The palette is rooted in the warmth of a tropical sunrise. We utilize a Material-inspired token system but apply it with editorial restraint.

| Role | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `primary` | `#AB3500` | High-emphasis actions and brand touchpoints. |
| **Accent** | `primary-container` | `#FF6B35` | Hero CTAs and active states. |
| **Secondary** | `secondary` | `#835400` | Subtitle accents and secondary interactions. |
| **Background** | `background` | `#FFF8F2` | The base "paper" texture of the application. |
| **Muted Header** | `tertiary` | `#98471B` | Specifically for sophisticated, low-contrast headings. |

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. Use `surface-container-low` to sit on a `background` to create a section. If you feel the need for a line, increase your padding instead.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine, handmade paper.
- **Base Layer:** `background` (#FFF8F2).
- **Secondary Sections:** `surface-container-low` (#F9F2EC).
- **Floating Cards:** `surface-container-lowest` (#FFFFFF).
By nesting a `lowest` surface inside a `low` container, you create a natural lift that feels architectural rather than digital.

### The Glass & Gradient Rule
To prevent a "flat" or "bootstrap" look, use **Glassmorphism** for floating navigation bars or booking summaries. Use `surface` at 80% opacity with a `20px` backdrop-blur. For main CTAs, use a subtle linear gradient from `primary` to `primary-container` at a 135-degree angle to add "soul" and dimension.

---

## 3. Typography: Editorial Authority
We use **Plus Jakarta Sans** for its modern geometric clarity and exceptional Vietnamese diacritic support.

*   **Display (Large/Medium):** Reserved for hero island names or pricing. Use `-0.02em` letter spacing to give it a high-fashion, "tight" editorial feel.
*   **Headline (Small/Medium):** Use the `tertiary` (Muted Terracotta) color for these. This lowers the visual "noise" and makes the app feel peaceful rather than demanding.
*   **Body (Large/Medium):** The workhorse. Always use `on-surface` (#1E1B18) for maximum readability against the warm background.
*   **Label:** Used for metadata (e.g., "Per Night" or "Check-in"). Use `secondary` for these to create a distinct color-coded hierarchy that guides the eye.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often too heavy. In this system, we use light to define space.

*   **The Layering Principle:** Avoid shadows for static elements. A `surface-container-high` element placed on a `surface` provides all the "elevation" required.
*   **Ambient Shadows:** For floating Modals or Action Sheets, use a tinted shadow: `0 12px 32px rgba(171, 53, 0, 0.05)`. The hint of Coral in the shadow mimics how light bounces off tropical wood and sand.
*   **The "Ghost Border" Fallback:** If a divider is functionally required for accessibility, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.
*   **Tactile Texture:** Apply a very fine noise grain (SVG filter) at 2% opacity over the `background` to simulate a paper-textured feel.

---

## 5. Components: Tactile & Interactive

### Buttons (The "Pill" Aesthetic)
*   **Primary:** Fully rounded (`xl`), `primary` background, `on-primary` text. Use a subtle internal glow (top-down white gradient at 10% opacity) for a 3D tactile feel.
*   **Secondary:** `surface-container-highest` background with `primary` text. No border.
*   **Interactive Receipt:** Booking summaries should use a `dashed` bottom border (the only exception to the "No-Line" rule) to mimic a physical tear-off slip.

### Cards & Lists
*   **Cards:** 16px corner radius (`DEFAULT`). No borders. Use `surface-container-lowest` to pop against the `background`.
*   **Lists:** Forbid the use of divider lines. Separate list items using `16px` of vertical white space. Use a `primary` color icon (Lucide React) as a leading element to draw the eye.

### Input Fields
*   **Default State:** `surface-container-high` background, rounded `sm` (0.5rem).
*   **Focus State:** A `2px` ghost border using `primary` at 30% opacity and a subtle `4px` outer glow.

### Interactive Service Receipt (Signature Component)
A floating element that tracks the user's booking progress. It should use the **Glassmorphism** effect with a subtle `tertiary` color header to maintain the "premium invoice" vibe.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetric Padding:** Allow photos of the island to bleed off one edge of the screen while keeping text aligned to a generous margin.
*   **Embrace White Space:** If the content feels cramped, double the spacing. Premium brands "waste" space intentionally.
*   **Tint Your Neutrals:** Always ensure your greys have a hint of amber or coral. Never use #000000 or pure #808080.

### Don’t:
*   **Don’t Use Box Shadows on Cards:** Use background color shifts (`surface` vs `surface-container`) instead. 
*   **Don’t Use High-Contrast Borders:** This breaks the "Peaceful" vibe.
*   **Don’t Use Standard Transitions:** Use a "Soft Spring" animation (0.5s, easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`) for modals to mimic the gentle bounce of a hammock.

---
**Director's Note:** Remember, we are not building a utility; we are building an invitation to a destination. Every pixel should feel like a warm breeze.