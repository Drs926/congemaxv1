# DATA_MODEL_CONTRACT

Projet : CongéMax
Version : V1
Statut : GELÉ
Date : 2026-02-15

## 1. Objet
Ce document définit la structure officielle des données persistées et manipulées par CongéMax V1.
Il garantit :
- Cohérence moteur ↔ base
- Absence de duplication logique
- Séparation stricte UI / moteur / persistance
- Traçabilité des simulations
Aucune structure non décrite ici ne peut être ajoutée en V1.

## 2. Entités principales

### 2.1 Users
Champs obligatoires :
- id (UUID)
- email (unique)
- password_hash
- created_at
- is_premium
- premium_expiry
Invariants :
- email unique
- premium_expiry null si non premium

### 2.2 Profiles
Un utilisateur possède un seul profil actif.
Champs :
- id
- user_id (FK)
- convention_code
- work_type ('horaire' | 'forfait')
- seniority_years
- forfait_granularity ('day' | 'half_day' | null)
- created_at
Invariants :
- convention_code doit exister dans conventions
- forfait_granularity obligatoire si work_type = forfait

### 2.3 Planning
Représentation annuelle normalisée.
Champs :
- id
- profile_id (FK)
- date
- worked_unit (0 | 0.5 | 1)
- posable (boolean)
- blocked (boolean)
Invariants :
- Un enregistrement par date
- Année complète obligatoire (365/366)
- worked_unit ∈ {0, 0.5, 1}
- blocked → posable = false

### 2.4 Capital
Champs :
- id
- profile_id (FK)
- cp_remaining
- rtt_remaining
- calculated (boolean)
- updated_at
Invariants :
- cp_remaining ≥ 0
- rtt_remaining ≥ 0
- calculated = true → capital issu moteur

### 2.5 Conventions
Champs :
- code (PK)
- data (JSONB)
- version
- updated_at
Structure JSON obligatoire :
{
  "annual_cap_days": {},
  "cp_base": number,
  "continuous_service": boolean,
  "night_work_allowed": boolean
}
Invariants :
- version incrémentée à chaque modification
- data validée par schéma interne

### 2.6 Simulations
Champs :
- id
- profile_id (FK)
- type ('local' | 'annual')
- parameters (JSONB)
- created_at
Invariants :
- parameters non vide
- type obligatoire

### 2.7 Results
Champs :
- id
- simulation_id (FK)
- strategy_type (nullable si local)
- metrics (JSONB)
- allocation (JSONB)
Invariants :
- metrics doit contenir métriques officielles
- allocation traçable jour par jour

### 2.8 Subscriptions
Champs :
- id
- user_id
- store ('apple' | 'google')
- receipt
- valid_until
- status
Invariants :
- valid_until > now si actif
- status ∈ {active, expired, cancelled}

## 3. Relations officielles
users
  └── profiles
        ├── planning
        ├── capital
        ├── simulations
              └── results

## 4. Séparation logique
- UI ne manipule jamais directement conventions.data.
- Le moteur ne modifie jamais planning.
- Les simulations sont immuables.
- Les résultats sont recalculables à partir des paramètres.

## 5. Interdictions V1
- Pas de multi-profil par utilisateur.
- Pas de multi-convention.
- Pas de stockage d’interprétation juridique.
- Pas de dépendance externe RH.

## 6. Versioning
Toute modification de structure :
- Mise à jour document obligatoire.
- Classification correctif / ajustement / extension.
- Extension = V2 minimum.

## 7. Consistance moteur ↔ base
Le moteur dépend uniquement de :
- planning
- capital
- convention.data
Aucune logique métier ne doit être stockée dans UI.
