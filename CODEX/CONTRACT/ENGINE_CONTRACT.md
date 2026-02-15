# ENGINE_CONTRACT

Projet : CongéMax
Version : V1
Statut : GELÉ
Date : 2026-02-15

## 1. Objet du moteur
Le moteur CongéMax est un système d’optimisation sous contraintes permettant :
- Optimisation locale
- Optimisation annuelle
- Respect strict des règles conventionnelles injectées
- Respect strict du capital utilisateur
Le moteur est exécuté côté serveur exclusivement.

## 2. Principes fondamentaux
1) Aucune solution invalide ne peut être retournée.
2) Toute solution doit être vérifiable.
3) Le moteur ne suppose jamais qu’un week-end est un repos.
4) Le moteur ne dépasse jamais le plafond forfait.
5) Le moteur ne modifie jamais les données utilisateur.
6) Toute allocation passe par ConstraintResolver.

## 3. Unité interne
Toutes les conventions sont converties en unité interne :
Jour calendaire normalisé.
Chaque jour possède :
- date
- worked_unit (0 | 0.5 | 1)
- posable (boolean)
- blocked (boolean)

## 4. Entrées moteur obligatoires

### 4.1 Optimisation locale
- profile
- planning (année complète)
- capital
- convention
- targetDate
- anchorMode
- maxShiftDays (si flexible)

### 4.2 Optimisation annuelle
- profile
- planning
- capital
- convention
- preferences (optionnel)

## 5. ConstraintResolver (obligatoire)
Toute tentative d’allocation passe par validateAllocation().
Le résolveur vérifie :
1) Capital suffisant
2) Plafond forfait respecté
3) Jours posables uniquement
4) Pas de jour blocked
5) Respect règles convention injectées
Retour :
- valid: true
- valid: false + motif
Aucune allocation ne bypass ce module.

## 6. Optimisation locale

### 6.1 Mode strict
Condition obligatoire : targetDate ∈ solution

### 6.2 Mode flexible
Condition obligatoire : distance(solution, targetDate) ≤ maxShiftDays

### 6.3 Classement
Deux classements obligatoires :
- Repos maximal
- Rendement maximal
Rendement = totalRestDays / daysPosed

## 7. Optimisation annuelle

### 7.1 Étape heuristique
Identification de :
- Fenêtres potentielles
- Ponts naturels
- Zones à fort rendement

### 7.2 Génération stratégies types
- Grande coupure
- Rendement maximal
- Équilibre
- Fragmentée
- Contraintes fortes

### 7.3 Vérification exhaustive locale
Chaque stratégie est validée via ConstraintResolver.

## 8. Métriques officielles
Obligatoires :
- totalRestDays
- longestBlock
- averageRendement
- dispersionIndex
- maxContinuousWork
Aucune métrique unique agrégée n’est imposée.

## 9. Performance
Objectifs :
- Local < 1 seconde
- Annuel < 3 secondes
Si dépassement :
- Logging obligatoire
- Optimisation nécessaire

## 10. Auditabilité
Chaque solution doit pouvoir produire :
- Dates exactes
- Jours convertis
- Règle conventionnelle impactée
- Vérifications contraintes
Aucune boîte noire.

## 11. Interdictions formelles
- Pas d’approximation non documentée.
- Pas de bypass du résolveur.
- Pas de génération brute-force non bornée.
- Pas de dépendance à une unité juridique externe.
- Pas de logique UI dans moteur.

## 12. Évolution future
Toute modification moteur :
- Doit mettre à jour ce document.
- Doit être classée correctif / ajustement / extension.
- Extension = V2 minimum.
