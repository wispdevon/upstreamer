# Upstream design contract

Reference: `docs/design/concept.png` and the supplied screenshot. Preserve the calm editorial composition, while using the approved lesson titles and accurate contribution language rather than image-generated copy.

- Palette: warm paper #f8f7f3, ink #292b24, muted #62665b, rust #ae432a, fine border #ddded5, panel #efede5. Dark mode keeps the same warm palette, follows the system by default, and allows a saved local override.
- Type: Georgia for editorial headings and quotations; system sans-serif for navigation, forms, and body. Fluid hero 42–68px, with the diagram stacking before its column becomes cramped; body 16–18px, line-height 1.6.
- Shell: full-width brand header with five pill-shaped primary navigation buttons and an icon-only theme button. Do not add a breadcrumb row beneath the header. Navigation wraps into a small grid on phone screens so every destination remains visible.
- Start screen: two-column hero with the headline and actions on the left, and the native SVG branch diagram above a compact learning-path card on the right. The card uses labeled native radios for the saved path and one start/continue link to its first incomplete lesson (or its first lesson when complete). Follow with five step titles beside the verified fork-to-PR case study; do not repeat the path choices below. On tablets, place the diagram beside the card after the headline. On phones, stack headline/actions, diagram, path card, five steps, and featured PR in that DOM order. Keep the paper, rust, and serif identity, visible radio focus, and touch-sized labels.
- Contribution studio: place the review checklist beside the editable handoff draft on desktop and stack them on smaller screens. Keep checklist inputs native and the draft preview text-only.
- Shared motifs: numbered rules, rust arrows, fine separators, off-white quote panels. No gradients, decorative photos, or fabricated metrics.
- Accessibility: visible focus, skip link, meaningful headings, route focus, native controls, status announcements, reduced-motion support, no horizontal overflow at 360px.
