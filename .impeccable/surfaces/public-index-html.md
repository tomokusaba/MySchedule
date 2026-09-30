---
version: 1
slug: "public-index-html"
primary_target: "public/index.html"
related_targets: ["public/styles.css","public/app.js"]
---

# Connpass Event Record

## Scope and mode

The public event-record page is a Read surface for connpass activity.

## Audience and task

Audience is inferred because the product interview was skipped: a visitor wants to understand the account's public participation, organizing, and speaking history without interpreting the connpass profile directly.

## Evidence and action

Activity categories, event dates, names, and original connpass links form the evidence. Visitors scan the year-marked sequence, filter by role, search, sort, and open a source event.

## Direction and memorable moment

The page reads like an architectural section through years: one continuous chronology with a clearly identified newest record. The three roles remain explicit at every event.

## Constraints and unresolved decisions

The page is static, refreshed daily from connpass API v2, and its structure must not change with each dataset. Public event information only; WCAG 2.2 AA. The API key and Azure Static Web Apps deployment token are not configured yet. Visitor audience and public-facing name beyond the connpass account are unconfirmed.
