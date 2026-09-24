# Plan de navigation v2 — notes de cadrage (pas encore implémenté)

Ce document capture les instructions données pour la prochaine grosse évolution de
l'app : une refonte de la structure et du menu de gauche, avec des espaces en
lecture seule et un accès différencié par rôle. **Rien de ce document n'est
implémenté** — c'est un cadrage à reprendre plus tard, phase par phase.

## 1. Tronc commun (avant le cloisonnement par rôle)

Menu de gauche, dans cet ordre :

- **Dashboard général**
- **Projets et Roadmap** — tout ce sous-menu est en **lecture seule**
  - Un calendrier style **Gantt** avec les MEP (mises en production), sur le
    modèle de l'outil montré en référence (colonnes Resources / Type / Start
    Date / End Date / Duration / Actions)
  - Toutes les roadmaps de tous les projets, en lecture seule
- **Gestion des ressources** — tout ce sous-menu est en **lecture seule**
  - Calendrier : affichage par équipe des congés de chacun, par mois
    - Un slider pour basculer entre deux modes d'affichage : **Calendrier**
      et **Liste** (la vue Liste doit ressembler à la table de ressources
      façon Gantt donnée en référence : Resources / Type / dates / durée)
  - Liste des ressources par équipe
- **Administration**
  - Une liste déroulante des éléments paramétrables (sur le principe de
    l'outil de référence montré, mais **pas la même liste** — à définir
    précisément le moment venu)
  - Ce qu'on sait déjà en faire partie : **création et administration des
    équipes** (déjà existant dans l'app actuelle, à rattacher ici)
- **Timesheet** — présent dans l'outil de référence, pertinence à confirmer
  pour nous (voir section 4 ci-dessous)

## 2. Séparateur, puis menu par rôle

Après ce tronc commun, un **séparateur visuel**, puis un menu dont le
contenu dépend du **rôle** de la personne connectée. Rôles identifiés :

- Admin
- Directeur
- Responsable
- PO technique
- PO fonctionnel
- Technicien

Chaque rôle a des droits d'accès différents (lecture/écriture différente,
contenu différent). **Un même utilisateur peut cumuler plusieurs rôles** — le
premier cas concret (le profil de l'utilisateur qui a donné ces
instructions) est hybride **PO technique + PO fonctionnel**, donc son
tableau de bord personnel affichera les deux rôles.

## 3. Détail du rôle "PO technique" (premier rôle à cadrer)

Contexte donné : une équipe de 2 personnes, deux projets gérés — **CDO**
(déjà en place dans l'app) et **IA** (nouveau, pas encore créé).

Sous "**Mon dashboard**" (dashboard personnel scopé au rôle) :

- **Projets et Roadmap**
  - Calendrier Gantt avec les MEP — **en écriture** cette fois : doit
    pouvoir ajouter / modifier / supprimer des MEP pour ses projets
    (la fonctionnalité Suivi MEP existe déjà dans l'app — c'est cette
    même brique, mais scopée à ses projets)
  - Le tableau de roadmap — **deux sous-menus** puisqu'il gère deux
    projets (CDO et IA) ; CDO existe déjà, IA reste à créer
- **Gestion des ressources** — en **écriture**, pour ses équipes et
  projets (contrairement à la version générique en lecture seule du
  tronc commun) :
  - Calendrier — reprendre **exactement** le Planning déjà construit
    (grille congés éditable)
  - Liste des ressources par équipe, avec ajout / modification /
    suppression
  - Jours de congés — reprendre **exactement** l'onglet déjà construit
  - Capacité de l'équipe par mois — reprendre **exactement** l'onglet
    déjà construit
- **Administration**
  - Configuration Projets et roadmap
  - Configuration Gestion des ressources
  - Configuration de mon Dashboard
  - Trucs et astuces

Les rôles PO fonctionnel, Admin, Directeur, Responsable et Technicien
restent à cadrer de la même manière (contenu + droits) quand on y arrivera.

## 4. Le bloc "Timesheet" — à clarifier

Dans l'outil de référence (image 3), "Timesheet" est un dashboard de suivi
des **feuilles de temps** (heures déclarées par chaque personne, par
semaine) : filtres par période / équipe / ressource / projet ; indicateurs
(ressources attendues, taux de déclarants, feuilles approuvées/rejetées,
en attente d'approbation, jours déclarés) ; répartition par équipe ;
tendance du taux d'approbation ; et une liste des feuilles de temps qui
nécessitent une action (à approuver, en retard, etc.), avec workflow
Brouillon → Soumis → Approuvé/Rejeté/Réouvert.

Pertinence potentielle pour nous : si l'objectif est de suivre le temps
réellement passé par personne/équipe sur chaque item (US, incident, bug...),
il y a un recoupement naturel avec **Azure DevOps** (chaque work item a des
champs Effort/Remaining Work/Completed Work, et des itérations/sprints) —
on pourrait soit (a) laisser Azure DevOps être la source de vérité du temps
passé et se contenter d'un lien/rapport en lecture, soit (b) construire un
vrai module de saisie de temps ici et le pousser vers Azure DevOps via son
API. Les deux sont des chantiers distincts avec des implications
différentes (b) est plus gros. **Décision à prendre plus tard** — à
rediscuter avant de cadrer ce bloc plus précisément.

## 5. Ce qui existe déjà et qu'on réutilise tel quel

- Suivi MEP (ajout/modification/suppression de mises en production, liées
  aux équipes) → base du calendrier Gantt "Projets et Roadmap"
- Planning (grille congés éditable par mois) → "Gestion des ressources
  > Calendrier"
- Jours de congés (récap annuel) → à reprendre à l'identique
- Capacité par sprint → "Capacité de l'équipe par mois"
- Administration générale (création/gestion des équipes, désormais
  unifiée Planning + Roadmap) → brique "Administration > création des
  équipes"

## 6. Prochaines étapes (quand on reprendra ce chantier)

1. Valider avec l'utilisateur la liste exacte des éléments paramétrables
   dans "Administration" (tronc commun).
2. Décider du sort du bloc "Timesheet" (le garder ou pas, lien Azure
   DevOps ou saisie native).
3. Construire le cloisonnement par rôle (Admin/Directeur/Responsable/PO
   technique/PO fonctionnel/Technicien) et la gestion des droits d'accès
   (lecture seule vs écriture selon le rôle et le périmètre équipe/projet).
4. Créer le projet "IA" et cadrer son propre Suivi MEP + Roadmap.
5. Cadrer le rôle "PO fonctionnel" pour compléter le dashboard hybride de
   l'utilisateur.
