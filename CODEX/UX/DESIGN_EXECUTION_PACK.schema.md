\# DESIGN\_EXECUTION\_PACK — Schema v1

Mode: PROVECCO\_STRICT\_B

Statut: GELÉ



\## 1. Objectif

Définir le seul format autorisé transmis à Stitch.

Tout écran doit être précédé d’un DEP.



\## 2. Structure obligatoire



dep\_version: 1

screen\_id: <string>

mode: PROVECCO\_STRICT\_B

source\_docs:

&#x20; - path string (repo relatif)



layout\_contract:

&#x20; blocks\_order\_strict: \[liste ordonnée]

&#x20; no\_other\_blocks: true|false

&#x20; no\_global\_premium\_status: true|false

&#x20; no\_decorative\_elements: true|false



content\_exact:

&#x20; bloc\_par\_bloc: texte + valeurs exactes



component\_set\_allowed:

&#x20; - liste fermée



token\_contract:

&#x20; colors\_allowed: \[color.\*]

&#x20; type\_allowed: \[type.\*]



scales:

&#x20; spacing\_allowed: \[0,4,8,12,16,24,32]

&#x20; radius\_allowed: \[0,10,12,16,999]

&#x20; elevation\_allowed: \[elevation.none,elevation.card,elevation.sheet]

&#x20; max\_elevation\_levels\_used: 2

&#x20; icon\_sizes\_allowed: \[16,20,24]

&#x20; touch\_target\_min: 44



motion:

&#x20; durations\_allowed\_ms: \[120,180,240]

&#x20; rule: feedback\_only



prohibitions:

&#x20; - liste bloquante



output\_stage:

&#x20; DESIGN\_SPEC\_JSON\_ONLY | FINAL\_RENDER



