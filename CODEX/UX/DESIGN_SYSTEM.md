# DESIGN_SYSTEM — CongéMax (v1)

## 1) Intent
CongéMax est un outil décisionnel. Design sobre, dense, non décoratif.
Aucune valeur “au feeling”. Tout doit provenir des scales ci-dessous.

## 2) Color Tokens (noms fermés)
### Brand
- color.primary
- color.onPrimary

### Semantic
- color.success
- color.onSuccess
- color.danger
- color.onDanger
- color.warning
- color.onWarning
- color.info
- color.onInfo

### Neutrals
- color.bg
- color.surface
- color.surface2
- color.border
- color.textPrimary
- color.textSecondary
- color.textMuted
- color.disabled
- color.focus

## 3) Typography Tokens (noms fermés)
- font.family.primary
- font.weight.regular
- font.weight.medium
- font.weight.semibold
- font.weight.bold

### Sizes / line-heights
- type.h1.size = 24 ; type.h1.line = 30 ; weight=semibold
- type.h2.size = 18 ; type.h2.line = 24 ; weight=semibold
- type.body.size = 14 ; type.body.line = 20 ; weight=regular
- type.caption.size = 12 ; type.caption.line = 16 ; weight=regular
- type.kpi.size = 30 ; type.kpi.line = 34 ; weight=semibold

## 4) Spacing Scale (valeurs autorisées uniquement)
spacing = { 0, 4, 8, 12, 16, 24, 32 }

## 5) Radius Scale (valeurs autorisées uniquement)
radius = { 0, 10, 12, 16, 999 }
- card = 12
- input = 10
- chip = 999

## 6) Elevation / Shadow (niveaux autorisés)
- elevation.none
- elevation.card
- elevation.sheet
Interdit: plus de 2 niveaux.

## 7) Icon Sizes
icon = { 16, 20, 24 }

## 8) Touch Targets
- touch.min = 44

## 9) Motion (règles)
- motion.duration.fast = 120ms
- motion.duration.base = 180ms
- motion.duration.slow = 240ms
Interdit: animations décoratives. Seulement feedback/transition.

## 10) States (obligatoires)
Tout élément interactif doit exposer:
- default
- pressed
- disabled
Si action async:
- loading

## 11) Anti-dérive (bloquant)
Interdit :
- nouvelle couleur hors color.*
- tailles typo hors type.*
- spacing hors scale
- radius hors scale
- shadow hors elevation.*
Toute dérogation => BLOCK + correction du DESIGN_SYSTEM avant toute nouvelle génération.
