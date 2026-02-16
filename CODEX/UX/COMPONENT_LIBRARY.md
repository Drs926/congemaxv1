---
# COMPONENT_LIBRARY — CongéMax (v1)

## 0) Règles (bloquantes)
- Tous les composants utilisent uniquement les tokens et scales de DESIGN_SYSTEM.md.
- Tout composant interactif expose: default / pressed / disabled (+ loading si async).
- Interdiction d’introduire un pattern non listé ici sans mise à jour de ce document.

---

## 1) Layout / Structure

### 1.1 AppShell
- Fond: color.bg
- Zone contenu: padding spacing.16
- Sections verticales: spacing.12 à spacing.16
- Gestion états écran: Loading / Empty / Error (voir 6)

### 1.2 TopBar
- Titre: type.h2 + color.textPrimary
- Action droite optionnelle: icon 20/24, touch.min=44
- Séparateur bas: color.border

### 1.3 Card (base)
- Background: color.surface
- Border: 1px color.border
- Radius: radius.12
- Padding: spacing.16
- Elevation: elevation.card (optionnel, jamais plus)

---

## 2) Typographies d’usage

### 2.1 ScreenTitle
- type.h1, color.textPrimary

### 2.2 SectionTitle
- type.h2, color.textPrimary

### 2.3 BodyText
- type.body, color.textPrimary / color.textSecondary

### 2.4 Caption
- type.caption, color.textMuted

### 2.5 KPIValue
- type.kpi, color.textPrimary
- Interdit: tailles “au feeling”

---

## 3) Composants de décision (cœur CongéMax)

### 3.1 KPI_Card
But: afficher une métrique dominante (ex: CP restants, RTT, repos obtenus, efficacité).
Structure:
- label (Caption)
- value (KPIValue)
- delta optionnel (Caption)
Règles:
- label: color.textSecondary
- delta:
  - positif -> color.success
  - négatif -> color.danger
  - neutre -> color.textMuted

### 3.2 MetricRow
But: afficher une paire label/valeur.
- label: BodyText (secondary)
- value: BodyText (primary) ou semi-bold
- séparateur optionnel: color.border

### 3.3 OptionCard (résultat optimisation)
But: comparer des options.
Structure minimale:
- header: période (dates) + badge efficacité
- corps: repos_total, cp_posés, ratio/efficacité
- footer: CTA “Détails”
États:
- selected (si sélection): bordure color.primary
- disabled: color.disabled, texte atténué

### 3.4 AllocationList (détails d’option)
Liste des jours avec raison (WORKED_UNIT_0 / BLOCKED / NOT_POSABLE / CP_USED)
- reasonTag (voir 5.3) obligatoire.

---

## 4) Formulaires / Saisie (profil, capital, filtres)

### 4.1 TextInput
- container: radius.10, border color.border
- padding: spacing.12
- label: Caption
- value: BodyText
États:
- default: border color.border
- focused: border color.focus
- error: border color.danger + helper text color.danger
- disabled: bg color.disabled, texte atténué

### 4.2 SelectRow (picker)
But: sélectionner un élément (ex: convention, work_type, granularity).
- Row cliquable (touch.min=44)
- label gauche, valeur droite, chevron icon 20
États: default/pressed/disabled

### 4.3 ToggleRow
But: activer/désactiver (ex: posable, blocked).
- label + switch
- Règle: si blocked=true => posable=false (déjà backend), UI doit refléter.

### 4.4 NumberInput
But: capital CP/RTT, années ancienneté.
- Même règles que TextInput
- Validation visuelle: helper si invalide

---

## 5) Planning (calendrier)

### 5.1 DayCell
But: représenter un jour dans une grille.
Données: date, worked_unit (0/0.5/1), posable, blocked
Affichage:
- default: surface
- non-posables: atténué (textMuted)
- blocked: indicateur danger (sans agressivité)
- worked_unit=0: indicateur info
Contraintes:
- touch.min=44
- états pressed/selected obligatoires

### 5.2 Legend
But: expliquer couleurs/états (blocked / non-posables / worked_unit=0)
- Chips statiques (voir 5.3)

### 5.3 Tag / Chip
But: état court (Blocked, Non posable, 0 travaillé, CP utilisé)
- radius.999
- padding horizontal spacing.12, vertical spacing.4/8
- texte: Caption
Couleurs:
- blocked -> danger (bg léger) + onDanger
- info -> info + onInfo
- neutral -> surface2 + textSecondary

---

## 6) États d’écran (obligatoires partout)

### 6.1 LoadingState
- spinner + texte Caption
- pas d’animation décorative

### 6.2 EmptyState
- titre SectionTitle
- texte BodyText
- CTA optionnel (Button)

### 6.3 ErrorState
- message clair (BodyText)
- CTA “Réessayer”
- pas de jargon technique

### 6.4 Toast / InlineAlert
- succès -> success
- erreur -> danger
- info -> info
Règle: messages courts, actionnable.

---

## 7) Actions

### 7.1 ButtonPrimary
- bg color.primary, texte color.onPrimary
- radius.12
- height >= 44
États:
- pressed: assombrissement léger
- disabled: color.disabled
- loading: spinner + texte inchangé

### 7.2 ButtonSecondary
- bg transparent, border color.border, texte color.textPrimary

### 7.3 IconButton
- icon 20/24, touch.min=44
- pressed state obligatoire

---

## 8) Anti-dérive (bloquant)
- Interdit d’utiliser une couleur, un radius, un spacing, une typo hors DESIGN_SYSTEM.md.
- Interdit d’inventer un nouveau composant “similaire” : on étend ce doc d’abord.
---
