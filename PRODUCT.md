# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is inferred because the user skipped the product interview: visitors who want to understand Tomo Kusaba's public event participation, event organizing, and speaking activity.

## Product Purpose

Present a clear, browsable summary of the activity publicly associated with the connpass account `tomo_kusaba`. Success means visitors can distinguish attending, organizing, and speaking activity and follow links to the original connpass events.

## Positioning

The site's record is derived from the specified connpass profile and its official API rather than manually authored biography claims. The source account remains the authority for event facts.

## Operating Context

The site is a static web app whose event data is refreshed daily. Visitors primarily read and browse event history; the layout and visual system must remain stable across data updates.

## Capabilities and Constraints

- Publish public event participation, organization, and speaking information only.
- Use the connpass API v2; API requests require an API key and are limited to one request per second per key.
- Do not scrape connpass pages; connpass prohibits scraping in its API documentation.
- Keep API credentials out of the static site and source repository; the key must be supplied as a deployment secret.
- User selected building the site first and adding the API key later.
- The exact hosting provider and public display name/bio are not yet confirmed. The implementation may target Azure Static Web Apps as a practical static-host deployment.
- If daily data retrieval fails, do not replace published data with an empty or success-shaped result.

## Evidence on Hand

- Source profile: https://connpass.com/user/tomo_kusaba/
- Official API v2 documentation: https://connpass.com/about/api/v2/
- API documentation lists user attended-event and presenter-event endpoints and event search by owner nickname.
- No API key was supplied. No event data has been imported yet.

## Product Principles

- Keep connpass event facts attributable to their original event pages.
- Separate attendance, organization, and speaking rather than conflating them.
- Preserve a consistent presentation when the daily data changes.
- Publish only public information and never expose the API credential.

## Accessibility & Inclusion

The site must conform to WCAG 2.2 AA.
