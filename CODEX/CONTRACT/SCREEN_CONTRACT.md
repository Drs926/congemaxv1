# SCREEN_CONTRACT

Projet : CongéMax
Version : V1
Statut : GELÉ
Date : 2026-02-15

## 1. Objet
Ce document définit :
- La liste officielle des écrans V1
- Leur rôle exact
- Leur hiérarchie
- Les éléments obligatoires
- Les interactions autorisées
Aucun écran supplémentaire ne peut être ajouté en V1.

## 2. Navigation principale
Navigation par onglets bas (4 maximum) :
1) Dashboard
2) Local
3) Annuel (Premium)
4) Compte
Aucune navigation latérale.

## 3. Liste officielle des écrans

### 3.1 Onboarding

#### Screen_01_Landing
Contient :
- Baseline officielle : « Faites de vos congés une décision stratégique. »
- Bouton Créer un compte
- Bouton Se connecter

#### Screen_02_SignUp
- Email
- Mot de passe
- Validation
- Acceptation CGU

#### Screen_03_Login
- Email
- Mot de passe
- Connexion

### 3.2 Configuration initiale

#### Screen_04_Convention
- Sélection unique : IDCC 1801
- Résumé court règles clés

#### Screen_05_ProfileType
- Horaire
- Forfait jours
Si forfait :
- Ancienneté
- Granularité (jour / demi-journée)

#### Screen_06_Planning
- Vue calendrier annuel
- Modification jour par jour
- worked_unit
- posable
- blocked

#### Screen_07_Capital
- CP restants
- RTT restants
- Indicateur calcul auto / override

### 3.3 Dashboard

#### Screen_08_Dashboard
Affiche :
- Capital restant
- Convention active
- Raccourci optimisation locale
- Raccourci optimisation annuelle
- Statut premium

### 3.4 Optimisation locale (Gratuit)

#### Screen_09_Local_Input
- Sélection date cible
- Toggle Strict / Flexible
- Δ si Flexible
- Bouton Optimiser

#### Screen_10_Local_Results
Liste cartes séquences.
Chaque carte contient :
- Dates
- Jours posés
- Jours repos
- Rendement
- Icône mode
Tri :
- Repos maximal
- Rendement

#### Screen_11_Local_Audit
Sections collapsibles :
- Hypothèses
- Jours convertis
- Vérifications contraintes
- Référence convention

### 3.5 Optimisation annuelle (Premium)

#### Screen_12_Annual_Input
- Rappel capital
- Paramètres stratégiques simples
- Bouton Simuler

#### Screen_13_Annual_Strategies
Cartes :
- Grande coupure
- Rendement maximal
- Équilibre
- Fragmentée
- Contraintes fortes
Chaque carte affiche :
- Repos total
- Bloc maximal
- Rendement
- Dispersion
- Charge max continue

#### Screen_14_Annual_Comparison
Tableau comparatif multi-métriques.

#### Screen_15_Annual_Audit
Sections :
1) Résumé
2) Allocation détaillée
3) Contraintes appliquées
4) Vérifications
5) Métriques complètes
Export PDF accessible.

### 3.6 Compte

#### Screen_16_Profile
- Convention
- Profil
- Planning
- Capital

#### Screen_17_Subscription
- Statut premium
- Date expiration
- Gestion abonnement

## 4. Règles UX obligatoires
1) Audit toujours accessible mais non intrusif.
2) Aucune métrique masquée.
3) Aucune gamification.
4) Aucun wording juridique complexe.
5) Pas de surcharge visuelle.
6) Temps de chargement visible si > 500ms.

## 5. Interdictions V1
- Pas de notifications push.
- Pas de partage externe.
- Pas de messagerie.
- Pas de recommandations automatiques intrusives.
- Pas d’onglet supplémentaire.

## 6. Cohérence moteur ↔ UX
- Toute donnée affichée doit provenir du moteur.
- Aucune métrique calculée côté UI.
- Aucune hypothèse implicite.

## 7. Gel UX
Tout ajout écran → extension → BLOCK V1.
