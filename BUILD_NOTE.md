# Build note — After the needle

Evidence cutoff used on screen: 27 September 2026.

## Palette comparison

Both directions were rendered on the cover at 1920×1080 in Chrome, with the same pen and tablet cutouts.

| Role | Paper (not shipped) | Clinic (shipped) |
|---|---|---|
| Stage | `#E7E0D4` | `#E4EBF1` |
| Ink | `#1C1814` | `#14202B` |
| Muted type | `#655D54` | `#526272` |
| Rules | `#CBBFAE` | `#C5D0DA` |
| 2025 forecast | `#1F5C57` | `#1E4F86` |
| 2026 forecast | `#6E4A2E` | `#6A4D86` |
| Wait cue | `#8A4030` | `#8D3D24` |

The shipped stage is the cool clinic gray. The Wegovy tablet is a very light oval and Foundayo is a pale pink round tablet. The warm paper stage sat closer to both tablets. The cool gray keeps the tablet faces and pen plastics readable without a texture or a glow.

Forecast colors encode the year of the estimate. They are not a winner scale. The 30-minute cue uses the wait color only on the Wegovy scene.

The rejected paper stage is not switchable on the public site. Product stills are composited on `#E4EBF1` so the cutout sits on the stage without a box.

## Assets

Official stills, background removed, served as WebP. Masters and source URLs are in `references/`. No generated lookalike tablets or pens. MariTide is a dashed empty slot because no approved device exists.

Foundayo’s still is the pale pink round tablet with the Lilly mark. It was not recolored and it is not shown on the Wegovy scene.

## Claims kept off the stage

Checked on 27 September 2026: Foundayo’s FDA approval is for weight management, not type 2 diabetes. The site does not say it is approved for diabetes.

ATTAIN-1 figures on screen are the brief’s 72-week means: −7.5 / −8.4 / −11.2% versus −2.1% placebo. OASIS 4 is not printed, so it cannot be mistaken for a head-to-head.

2030 figures are labeled forecasts, with the prior $130B drawn as an open mark, May 2025 at $95B, and the 2026 public range at $102–114B.

## Interaction

Space or a click on the focal object advances one scene. R returns to the cover. Input is ignored for 480ms while a scene settles (280ms when reduced motion is on) so a held or repeated key does not skip a scene. Nothing auto-advances. `prefers-reduced-motion` removes the entrance animation.
