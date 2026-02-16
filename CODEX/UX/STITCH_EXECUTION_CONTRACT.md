STITCH\_EXECUTION\_CONTRACT



Projet : CongéMax
Version : V1
Statut : EN COURS
Date : 2026-02-15





\# STITCH\_EXECUTION\_CONTRACT — CongéMax (PROVECCO + Skills UX)



\## Rôle

Contrat d’exécution de la phase UX via Stitch MCP.

Aucune création ou modification d’écran n’est autorisée hors de ce cadre.



\## Périmètre

\- Uniquement: création / modification d’écrans via Stitch MCP

\- Hors périmètre: refactor, implémentation mobile, changements backend



\## Entrées contractuelles obligatoires

\- CODEX/CONTRACT/SCREEN\_CONTRACT.md

\- CODEX/UX/DESIGN\_SYSTEM.md

\- CODEX/UX/COMPONENT\_LIBRARY.md

\- CODEX/CHECKLIST/DESIGN\_VALIDATION\_CRITERIA.md



Si une entrée est manquante ou contradictoire → BLOCK.



\## Séquence obligatoire (Skills UX)

Toute génération Stitch suit strictement l’ordre ci-dessous, écran par écran:



\### 1) clarity-gate

Définir:

\- objectif fonctionnel exact

\- résultat utilisateur attendu

\- non-objectifs (ce que l’écran ne fait pas)



\### 2) c4-context

Définir:

\- position dans le flux

\- entrée(s) (données requises)

\- sortie(s) (actions/états produits)

\- dépendances (backend/stockage)



\### 3) core-components

Définir:

\- composants requis (issus de COMPONENT\_LIBRARY)

\- états obligatoires: default / loading / empty / error

\- interactions: pressed / disabled (si applicable)



\### 4) design-md (Stitch MCP)

Générer l’écran via Stitch MCP en respectant strictement:

\- DESIGN\_SYSTEM (tokens uniquement)

\- COMPONENT\_LIBRARY (composants existants uniquement)

\- SCREEN\_CONTRACT (champs + comportements uniquement)



\### 5) wcag-audit-patterns

Vérifier:

\- contraste lisible

\- tailles tactiles min 44px

\- états pressed/focus/disabled visibles si interactif

\- erreurs lisibles (si formulaire)



\### 6) context-degradation

Vérifier cohérence avec les écrans déjà générés:

\- même hiérarchie typographique

\- mêmes espacements (spacing scale)

\- mêmes composants / patterns

\- absence de nouveaux tokens



\## Règle de suspension

Si une incohérence est détectée:

\- STOP immédiat

\- identifier la cause (contrat incomplet / token manquant / composant manquant / divergence écran)

\- corriger la cause en amont (docs contractuels)

\- reprendre depuis clarity-gate



\## Interdiction

Interdit: générer → corriger → régénérer sans reprise complète depuis clarity-gate.



\## Traçabilité (preuve obligatoire par écran)

Pour chaque écran, produire une trace écrite (dans un fichier de preuve):

\- clarity-gate

\- c4-context

\- core-components

\- résultat Stitch (exports)

\- mini-audit wcag

\- check context-degradation

\- verdict PASS/BLOCK



Sans trace → BLOCK.



\## Sorties attendues

\- Exports écran (PNG) + variantes d’états si possible

\- Liste composants utilisés

\- Mise à jour de l’inventaire écrans (si un fichier de mapping existe)



\## Autorité

En cas de conflit:

SCREEN\_CONTRACT > DESIGN\_SYSTEM > COMPONENT\_LIBRARY > DESIGN\_VALIDATION\_CRITERIA > output Stitch



