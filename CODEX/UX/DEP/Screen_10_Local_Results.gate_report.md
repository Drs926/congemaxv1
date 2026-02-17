# Screen_10_Local_Results.gate_report

VERDICT: PASS
RAISON UNIQUE: All blocking checks passed for Screen_10_Local_Results

PREUVES:
- no additional properties: PASS
  - root keys=blocks, bottom_nav, screen_id
- block order strict: PASS
  - order=Header > PageTitle > Sort_Control_Block > Results_List_Block
- text exactness: PASS
  - header=CongéMax ; title=Optimisation locale ; sort=Trier par: Repos maximal (défaut) | Rendement
- no premium text: PASS
  - No premium text found
- bottom nav exact: PASS
  - items=Dashboard, Local, Annuel, Compte ; active=Local
- token conformance: PASS
  - All tokens in allowed contract
- interactive aria labels: PASS
  - All component aria_label present
- elevation levels <=2: PASS
  - elevation levels used=elevation.none,elevation.card
- no extra metrics: PASS
  - Only Dates/Icône mode/Posés/Repos/Rendement on 3 cards
