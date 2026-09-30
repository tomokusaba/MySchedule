---
name: connpass Event Record
description: A quiet, year-marked public record of connpass activity, grounded in limewash, graphite, amber, and shadow-blue.
colors:
  paper: "#f4f6f2"
  surface: "#ffffff"
  ink: "#182329"
  muted: "#43545d"
  placeholder: "#52616a"
  rule: "#737e82"
  rule-light: "#d3d9d7"
  amber: "#e9c965"
  amber-ink: "#3b2c00"
  shadow-blue: "#dce8ec"
  shadow-ink: "#203d4a"
  focus: "#173f58"
  organizing-surface: "#fbf3d8"
  organizing-rule: "#765000"
  speaking-rule: "#45616e"
  speaking-ink: "#183744"
typography:
  display:
    fontFamily: '"Segoe UI", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif'
    fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)"
    fontWeight: 650
    lineHeight: 1.12
    letterSpacing: "-0.045em"
  title:
    fontFamily: '"Segoe UI", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif'
    fontSize: "clamp(1.05rem, 1.8vw, 1.3rem)"
    fontWeight: 650
    lineHeight: 1.45
  body:
    fontFamily: '"Segoe UI", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: '"Segoe UI", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif'
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.65
    letterSpacing: "0.1em"
rounded:
  none: "0"
components:
  filter-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.45rem 0.85rem"
    height: "2.75rem"
  filter-button-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.none}"
    padding: "0.45rem 0.85rem"
    height: "2.75rem"
  search-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.45rem 0.7rem"
    height: "2.75rem"
---

# Design System: connpass Event Record

## Overview

**Creative North Star: "A Daylight Section Through Time"**

This is a public record to read, not a collection of promotional tiles. Its visual language takes the opening brief literally: limewash-white space, graphite rules, a shadow-blue chronology, and one warm amber cue for the newest event. A restrained system sans keeps Japanese and Latin text at home together; dates use tabular numerals so the timeline can be scanned as a sequence.

The page moves from a left-aligned title and source attribution through three distinct role totals and compact controls into one continuous timeline, divided by year. Event facts remain connected to their connpass source. The page is intentionally quiet and structural; the event record itself supplies the content and variation.

**Key Characteristics:**
- Light limewash canvas and crisp graphite separators.
- One year-marked timeline, not a stack of interchangeable cards.
- Explicit attending, organizing, and speaking labels alongside role color.
- Amber marks the newest event; shadow-blue carries chronology and links.
- Responsive single-column reading with visible keyboard focus.

## Colors

The palette is a pale, slightly green-white ground with graphite text and rules, offset by a small amber highlight and cool shadow-blue chronology.

### Primary
- **Shadow Blue** (`#dce8ec`): A cool chronological field and hover surface; the deeper **Shadow Ink** (`#203d4a`) carries links, attendance totals, and year headings.
- **Amber Beam** (`#e9c965`): A focused highlight for the newest timeline marker and source-note mark; do not spread it across the interface.

### Secondary
- **Amber Ink** (`#3b2c00`): Legible dark contrast for the amber cue and organizing role.

### Neutral
- **Limewash** (`#f4f6f2`): Main page background and timeline marker fill.
- **White Surface** (`#ffffff`): Filter buttons, inputs, and unselected role labels.
- **Graphite** (`#182329`): Main text, headings, and selected filter background.
- **Reading Gray** (`#43545d`): Supporting copy, labels, event metadata, and dates.
- **Placeholder Gray** (`#52616a`): Search placeholder text.
- **Graphite Rule** (`#737e82`): Structural borders and timeline spine.
- **Soft Rule** (`#d3d9d7`): Subtle section and masthead dividers.
- **Focus Blue** (`#173f58`): High-visibility keyboard outline.
- **Organizing Tint** (`#fbf3d8`) and **Organizing Edge** (`#765000`): Secondary organizing label treatment.
- **Speaking Edge** (`#45616e`) and **Speaking Ink** (`#183744`): Secondary speaking label treatment.

### Named Rules
**The One Warm Signal Rule.** Amber marks the latest record and a small source cue; keep it a signal rather than a broad decorative fill.

## Typography

**Display Font:** Segoe UI (with Yu Gothic UI, Hiragino Kaku Gothic ProN, Meiryo, and sans-serif fallbacks)  
**Body Font:** Segoe UI (same system stack)  
**Label/Mono Font:** No separate mono face; dates use tabular numerals in the system sans.

**Character:** A practical system-sans stack gives Japanese and Latin content a consistent, native-feeling voice. Strong, compact headings establish hierarchy without changing type families.

### Hierarchy
- **Display** (650, `clamp(2.25rem, 5.5vw, 4.5rem)`, 1.12 line-height): Left-aligned page title.
- **Headline** (650, `1.75rem`, normal line-height): The 年表 section heading.
- **Title** (650, `clamp(1.05rem, 1.8vw, 1.3rem)`, 1.45 line-height): Connpass event titles.
- **Body** (400, `1rem`, 1.65 line-height): Introductory and general reading copy; supporting event catch copy is capped at 72ch.
- **Label** (700, `0.75rem`, `0.1em` tracking): Wordmark/source-note labels. Control labels are smaller, semibold system sans.

### Named Rules
**The Tabular Date Rule.** Keep dates and totals aligned with tabular numerals; do not switch dates to a decorative or proportional display face.

## Layout

The content uses a centered container capped at `1120px`, with a `3rem` desktop side inset that becomes `2rem` below `760px`. The opening pairs the title/summary with a source note in two columns, then the role totals span three equal columns plus a wider update-date area. The records section leads into labeled filters, search, and sort controls above a full-width ruled timeline.

Each timeline year is a two-column architectural section: a year heading at left, and an ordered event list with a vertical graphite spine at right. Each event aligns its date beside the event content on wider screens. At `760px`, the introduction and event rows simplify; at `480px`, the controls and each year section become single-column, and the year heading stops sticking. Spacing is generous around the opening and sections, while event rows remain compact enough to scan.

## Elevation & Depth

The system is flat: there are no box shadows. Separation comes from tonal contrast, whitespace, thin graphite rules, the timeline spine, and the small offset outline around the source-note mark. The newest record is signaled with an amber timeline node rather than a floating card or shadow.

### Named Rules
**The Rule-Over-Shadow Rule.** Use borders, tonal surfaces, and position to explain structure; do not introduce elevation shadows.

## Shapes

Controls, labels, and section edges are square-cornered (`border-radius: 0`). One circular timeline node is the exception: it is a positional marker, not a chip or badge shape language. Rules are thin and architectural; role labels are outlined rectangular text tags with explicit names. Keep the event content in the continuous timeline rather than boxing each row.

## Components

### Buttons
- **Character:** Compact, square-edged controls that read as filters rather than calls to action.
- **Shape:** Square corners (`0` radius), `1px` graphite border.
- **Default:** White surface, graphite text, `0.45rem 0.85rem` padding, and `2.75rem` minimum height.
- **Selected:** Graphite fill with white text and `aria-pressed="true"`.
- **Hover / Focus:** Unselected hover shifts to shadow-blue; visible keyboard focus uses a `3px` solid focus-blue outline with `3px` offset.

### Chips
- **Style:** Role labels are small rectangular outlined tags, in white by default; organizing uses a pale amber tint, speaking uses shadow-blue.
- **State:** The words 参加, 主催, and 登壇 remain present so color is never the only role cue.

### Inputs / Fields
- **Style:** Search and sort fields use white backgrounds, `1px` graphite borders, square corners, `0.45rem 0.7rem` padding, and `2.75rem` minimum height.
- **Focus:** Shared `3px` focus-blue outline with `3px` offset.
- **Search:** Placeholder text names the searchable event/group fields; the field has a visible label.

### Navigation
- **Style:** A quiet masthead with a bordered TK monogram and compact EVENT RECORD wordmark at left; connpass profile link at right. A thin soft-rule border separates it from the page.
- **Mobile:** Retains the horizontal wordmark/profile relationship at narrow widths.

### Timeline (signature component)
- **Structure:** One ordered event list per year, inside continuous ruled year sections.
- **Chronology:** Graphite vertical spine and outlined circular event nodes; the newest event node alone receives the amber fill and amber-ink edge.
- **Content:** Date, explicit role labels, linked title, optional group/place and catch copy, plus a direct connpass source link.
- **Responsiveness:** Date/content align in two columns on wide screens and stack on narrow screens; year heading moves above its event list on the smallest screens.

## Do's and Don'ts

### Do:
- **Do** keep the page on the limewash `#f4f6f2` ground with graphite `#182329` text and thin rules.
- **Do** preserve the year headings, ordered event lists, and uninterrupted timeline spine.
- **Do** label every activity role in text and link each event to its connpass source.
- **Do** reserve amber `#e9c965` for the newest-event marker and small source cue.
- **Do** retain visible focus outlines and the compact, square-edged control treatment.

### Don't:
- **Don't** convert the timeline into a grid or stack of independent event cards.
- **Don't** make role distinctions depend on color alone or weaken the explicit Japanese labels.
- **Don't** add drop shadows, rounded control pills, or a second display font; none are part of the shipped system.
- **Don't** allow the timeline to remain multi-column on small screens.
