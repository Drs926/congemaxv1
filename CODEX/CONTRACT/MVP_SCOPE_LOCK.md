# MVP_SCOPE_LOCK

Projet : CongéMax
Version : V1
Statut : GELÉ
Date : 2026-02-15

## 1. Objectif V1
Livrer une application mobile permettant :
- Optimisation locale gratuite
- Optimisation annuelle premium
- Convention pilote IDCC 1801
- Double profil (horaire / forfait jours)
- Audit double niveau
Aucun élargissement hors de ce périmètre.

## 2. Inclus dans V1

### 2.1 Authentification
- Compte obligatoire
- Email + mot de passe
- JWT
- Abonnement annuel

### 2.2 Convention
- Une seule convention : IDCC 1801
- Règles modélisées injectables
- Versionnée
Aucune autre convention.

### 2.3 Profils
- Horaire
- Forfait jours
Granularité forfait : jour / demi-journée

### 2.4 Planning
- Planning annuel normalisé
- Édition jour par jour
- worked_unit : 0 / 0.5 / 1
- posable / non posable
- blocked

### 2.5 Optimisation locale (Gratuit)
- Date cible
- Strict / Flexible
- Δ paramétrable
- Classement Repos / Rendement
- Audit simplifié

### 2.6 Optimisation annuelle (Premium)
- 3–5 stratégies types
- Multi-métriques
- Audit détaillé
- Comparaison
- Historique illimité
- Export PDF

### 2.7 Invariants techniques
- Unité interne calendaire
- Moteur serveur
- Performance annuelle < 3 s
- ConstraintResolver centralisé

## 3. Exclu formellement de V1
- Multi-conventions
- Multi-pays
- Social login
- Intégration RH automatique
- Partage manager
- Notifications intelligentes
- Prédiction comportementale
- API publique
- Mode hors-ligne moteur

## 4. Classification des modifications
Toute modification future doit être classée :

### Correctif
- Bug
- Erreur calcul
- Problème UX bloquant
Autorisé en V1.

### Ajustement
- Amélioration mineure UI
- Optimisation performance
- Clarification wording
Autorisé si non structurel.

### Extension
- Nouvelle convention
- Nouvelle métrique
- Nouveau mode
- Nouveau profil
- Nouvelle intégration
Extension → BLOCK automatique en V1 (V2 uniquement).

## 5. Règle de gel
Aucun ajout fonctionnel non listé ne peut être intégré à V1.
Toute tentative → BLOCK.

## 6. Définition de “Terminé V1”
V1 est terminé lorsque :
- Optimisation locale fiable
- Optimisation annuelle stable
- Audit complet opérationnel
- Abonnement fonctionnel
- Tests moteurs validés

## 7. Protection contre dérive
Toute proposition future doit répondre :
1) Est-ce dans MVP_SCOPE_LOCK.md ?
2) Si non → extension ?
3) Si extension → V2 uniquement.
