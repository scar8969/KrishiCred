# Design System Specification: The Earth-Bound Authority

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Agronomist"**

This design system rejects the "corporate blue" tech aesthetic in favor of something more grounded, tactile, and authoritative. We are building for the farmer who stands in a sun-drenched field; the interface must feel like a natural extension of the landscape—robust, clear, and essential.

To break the "template" look, we utilize **Asymmetric Information Density**. Instead of a uniform grid, we use oversized editorial headers paired with compact, high-utility data widgets. We embrace wide margins and "Rural Modernism"—a style that prioritizes extreme legibility under harsh sunlight through high-contrast tonal shifts rather than thin lines or complex gradients.

---

## 2. Colors & Surface Architecture

The palette is rooted in the earth, using the **Emerald Green** of a healthy harvest and the **Amber** of sunset earnings.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Visual boundaries must be achieved through **Background Tonal Shifts**. 
*   *Implementation:* Use `surface-container-low` for a card sitting on a `surface` background. If further nesting is needed, use `surface-container-high`. Lines create visual clutter; color blocks create clarity.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of heavy, organic paper.
*   **Base:** `surface` (#f8f9ff)
*   **In-Page Sections:** `surface-container-low` (#eef4ff)
*   **Floating Actions/Cards:** `surface-container-lowest` (#ffffff) for maximum "pop" and sunlight readability.

### Signature Textures & Gradients
Standard flat buttons are for utilities; **Value-Driven Actions** (like withdrawing carbon credits) must use a subtle **Signature Gradient**:
*   *Primary Gradient:* `primary` (#006c49) to `primary_container` (#10b981) at a 135-degree angle. This adds "soul" and a premium tactile feel.

---

## 3. Typography: The Editorial Voice

We pair **Plus Jakarta Sans** (Display/Headline) with **Inter** (Body) to balance modernity with extreme functional clarity. This combination ensures that Gurmukhi script (Punjabi) renders with the same weight and dignity as the English counterpart.

*   **Display (Large/Medium):** Used for financial totals and carbon credit balances. It should feel monumental.
*   **Headline (Small/Medium):** Used for field names and alert types.
*   **Body (Medium/Large):** The workhorse. Must never be smaller than `1rem` for critical field data to ensure accessibility in outdoor environments.
*   **Label (Small):** Reserved for metadata (e.g., "Last updated 2 mins ago").

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows feel "digital" and fake. We use **Ambient Layering**.

### The Layering Principle
Depth is achieved by stacking the `surface-container` tiers. 
*   *Example:* A Punjabi weather alert card uses `surface-container-highest` to sit atop the `surface` background. The contrast is the shadow.

### Ambient Shadows
When a floating element (like a Bottom Sheet) is required:
*   **Shadow Blur:** 40px to 60px.
*   **Shadow Opacity:** 6% of the `on-surface` color.
*   **Effect:** A soft, natural glow that mimics ambient light in a wide-open field.

### Glassmorphism & Depth
For persistent navigation bars or "Sticky" headers, use:
*   **Fill:** `surface` at 80% opacity.
*   **Backdrop-blur:** 20px.
*   This keeps the user grounded in their current task while maintaining a high-end, premium transparency.

---

## 5. Components: Tactile & Thumb-First

All touch targets must be a minimum of **48px** to accommodate outdoor use and varying levels of digital literacy.

### Buttons (The "Pill" Standard)
*   **Primary:** `xl` (3rem) rounded corners. Uses the Signature Gradient. No border.
*   **Secondary:** `surface-container-high` background with `on-surface` text.
*   **Tertiary:** No background, `primary` bold text, high-contrast focus state.

### Input Fields (The Rural Input)
*   **Style:** Instead of a thin line, use a filled `surface-container-low` background.
*   **Corner Radius:** `xl` (3rem) to match buttons.
*   **Focus State:** A "Ghost Border" (outline-variant at 20% opacity) and a 2px `primary` accent on the bottom only.

### Cards & Lists (The Borderless List)
*   **Rule:** Forbid divider lines.
*   **Separation:** Use 16px or 24px of vertical whitespace.
*   **Grouping:** Group related items (e.g., all fire alerts) inside a single `surface-container-low` wrapper with `xl` rounded corners.

### Specialized Agri-Tech Components
*   **The Fire Detection Banner:** Uses `tertiary_container` (#ff7a73) with an `on-tertiary_container` (#79000e) bold headline. This is the only place where high-saturation red is permitted.
*   **The Credit Progress Wheel:** Uses `secondary` (Amber/Gold) to represent accumulating value.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `xl` (3rem) corner radius for almost everything—it feels friendly and "WhatsApp-familiar."
*   **Do** maximize contrast for outdoor use (High `on-surface` contrast ratios).
*   **Do** provide ample padding (minimum 24px) around text to prevent "crowding" on small screens.

### Don't
*   **Don't** use 1px dividers. If you feel the need for a line, use a background color change instead.
*   **Don't** use small icons. All icons should be 24px minimum within a 48px touch target.
*   **Don't** use pure black (#000000). Use `on-background` (#121c28) for a softer, more premium "midnight" feel.