\# TOKEN\_CONFORMANCE\_GATE — v1

Statut: BLOQUANT



Un DESIGN\_SPEC est PASS uniquement si :



1\. Nombre de blocs exact et ordre strict respecté.

2\. Aucun bloc supplémentaire.

3\. Aucun texte non présent dans content\_exact.

4\. Premium uniquement dans bloc annuel.

5\. bottom\_nav items exacts.

6\. Tous les tokens respectent les listes autorisées.

7\. spacing/radius/elevation/icon strictement dans scales.

8\. max 2 niveaux elevation.

9\. Tous les éléments interactifs ont aria\_label.

10\. Aucune propriété JSON supplémentaire.



Si un seul critère échoue :

→ BLOCK

→ Raison unique

→ Preuve (extrait JSON fautif)



