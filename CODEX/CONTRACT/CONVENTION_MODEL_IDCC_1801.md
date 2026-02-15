# CONVENTION_MODEL_IDCC_1801

Projet : CongéMax
Version : V1
Statut : GELÉ
Date : 2026-02-15

## 1) Source
- Fichier: CODEX/SOURCES/convention des assistances.pdf
- Méthode: extraction texte + repérage pages (preuves internes)

## 2) Périmètre (V1)
On ne modélise ici que les éléments nécessaires au moteur CongéMax V1:
- Forfait jours (plafonds/conditions) si présents
- Base congés payés (CP) si présente
- Règles/mentions impactant la planification (repos/contraintes) si présentes
Tout le reste est hors périmètre V1.

## 3) Règles extraites (100% sourcées)

### 3.1 Forfait jours (si présent)
- Plafond annuel: 213 jours (212 après 1 an de présence) — Source: p. 30 (Article 55 c, renvoi art. 63)
- Conditions / population: Forfait annuel en jours pour les cadres; en dessous du niveau H, accord d'entreprise requis pour préciser population et limites — Source: p. 30 (Article 55 c)
- Particularités (ancienneté, etc.): Seuil réduit à 212 après 1 an de présence — Source: p. 30 (Article 55 c, renvoi art. 63)

### 3.2 Congés payés (si présent)
- Base annuelle CP: 25 jours ouvrés — Source: p. 32 (Article 63), p. 29 (Article 55 a)
- Règle de calcul/référence: Après 1 an de présence, durée portée à 26 jours ouvrés; le jour supplémentaire s'ajoute au droit de la période complète — Source: p. 32 (Article 63)

### 3.3 Organisation du travail (si présent)
- Travail de nuit: Travail de nuit possible pour les services opérationnels; majoration de nuit encadrée conventionnellement — Source: p. 30 (Article 57), p. 31 (Article 60)
- Travail week-end/jours fériés: Travail dimanche/jour férié possible selon activité; majorations minimales prévues — Source: p. 30 (Article 57), p. 31 (Article 60)
- Continuité 24/7 / astreintes: Continuité de service tous les jours de l'année, 24h/24; contraintes/astreintes et compensations renvoyées aux accords d'entreprise — Source: p. 30 (Article 56, Article 55 b)

### 3.4 Contraintes “planning” (si présent)
- Repos/obligations qui impactent "blocked/posable": Référence à 2 jours de repos hebdomadaire consécutifs dans le cadre annuel; règle explicite de marquage "blocked/posable" NON TROUVÉ (à compléter) — Source: p. 29 (Article 55 a), p. 30 (Article 55 b)

## 4) Mapping moteur (format injecté)
Ci-dessous, construire le JSON "convention.data" injecté dans le moteur UNIQUEMENT avec les valeurs prouvées.
Tout champ non prouvé doit être null + commentaire "NON TROUVÉ".

```json
{
  "annual_cap_days": {
    "first_year": 213,
    "after_1_year": 212,
    "notes": "Article 55 c (p.30): 213 puis 212 après 1 an de présence (renvoi art. 63)"
  },
  "cp_base": 25,
  "continuous_service": true,
  "night_work_allowed": true,
  "weekend_holiday_work_context": "Article 57 (p.30) + Article 60 (p.31): travail dimanche/jours fériés possible avec majorations; modalités détaillées par accords d'entreprise",
  "sources": {
    "annual_cap_days": "p.30 (Article 55 c)",
    "cp_base": "p.32 (Article 63), p.29 (Article 55 a)",
    "continuous_service": "p.30 (Article 56)",
    "night_work_allowed": "p.30 (Article 57), p.31 (Article 60)"
  }
}
```
