# InterBridge Trans & Trade - Design Guidelines

## Design Approach
**Professional B2B Service Platform** - Drawing from industry leaders like Stripe (for trust/clarity) and modern SaaS platforms (for conversion-focused layouts). Emphasizes credibility, transparency, and direct communication for import/export services.

## Typography Hierarchy
- **Headings**: Bold, extrabold weights for impact
  - H1: `text-5xl lg:text-6xl font-extrabold` (Hero headlines)
  - H2: `text-3xl md:text-4xl font-bold` (Section titles)
  - H3: `text-xl font-bold` (Card/component titles)
- **Body**: `text-sm` to `text-lg` with `leading-relaxed` for readability
- **Labels**: Uppercase tracking-wide for section tags (`text-sm font-semibold tracking-wider uppercase`)

## Layout System
**Spacing Units**: Tailwind primitives of 2, 4, 6, 8, 12, 16, 20, 24, 32
- Section padding: `py-20 lg:py-24` to `py-32`
- Card padding: `p-8`
- Element spacing: `space-y-4`, `space-y-6`, `space-y-8`, `gap-8`, `gap-12`
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

## Component Library

### Navigation
- Fixed header with backdrop blur: `bg-white/95 backdrop-blur-md`
- Height: `h-20`
- Logo: Icon + two-line text (brand name + tagline)
- Mobile hamburger menu with full-width dropdown
- CTA button: `rounded-full` with shadow

### Hero Section
- Full-width gradient background: `from-slate-900 via-blue-900 to-slate-900`
- Two-column layout on desktop (content + feature card)
- Status badge with animated pulse dot
- Large headline with gradient text accent
- Dual CTA buttons (primary solid + secondary outlined)
- Feature visualization card with icon + title + description rows

### Service Cards
- Grid: `md:grid-cols-2 lg:grid-cols-3 gap-8`
- Card style: `bg-slate-50 p-8 rounded-xl border border-slate-100`
- Hover: `hover:border-blue-200 hover:shadow-lg`
- Icon container: `w-12 h-12 rounded-lg` with background
- Icon hover effect: Background and text color transition

### Process/Timeline
- Horizontal step indicators with connecting lines
- Numbered circles with icons
- Descriptive text beneath each step
- Responsive: Stack vertically on mobile

### FAQ Accordion
- Clickable question rows with chevron indicator
- Expand/collapse animation
- Border separation between items
- Background highlight on hover

### Contact Section
- Two-column layout: Form + contact information
- Form fields: Full-width inputs with labels
- Contact details: Icon + text pairs in vertical stack
- Submit button: Full-width primary CTA

### Testimonial Cards
- Grid layout with star ratings
- Quote icon visual
- Client name and role labels
- Photo placeholder (circular avatar)

## Visual Treatment
- **Primary gradient**: Blue-900 to Slate-900 for hero backgrounds
- **Card backgrounds**: Slate-50 for subtle contrast
- **Borders**: Slate-100 default, Blue-200 on hover
- **Shadows**: Subtle `shadow-sm` to `shadow-2xl` for depth hierarchy
- **Blur effects**: `backdrop-blur-md` for glassmorphic navigation
- **Border radius**: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-full` for pills/buttons

## Icons
- **Library**: Lucide React (already implemented via import)
- **Sizes**: 20px, 24px, 32px depending on context
- **Usage**: Service cards, navigation, feature highlights, process steps

## Responsive Behavior
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`
- Single column on mobile, 2-3 columns on desktop
- Hamburger menu below `lg:` breakpoint
- Stack hero columns on mobile

## Images
**No large hero background image** - Uses gradient background with SVG pattern overlay instead. Focus on clean, professional presentation with icon-based visual hierarchy rather than photography. Icons serve as primary visual elements throughout.

## Key Interactions
- Smooth scroll navigation between sections
- Mobile menu slide-in/out
- FAQ accordion expand/collapse
- Button hover states (background darkening)
- Card hover elevations (border color + shadow)
- Form input focus states