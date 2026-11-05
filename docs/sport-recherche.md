# Recherche : méthodes d'entraînement sportif (calisthénie, course à pied, natation)

Document de référence préparé pour construire le futur onglet **Sport** de
l'application. Objectif validé avec l'utilisateur :

- **Format cible** : banque de séances/exercices par discipline (sur le
  modèle de l'onglet Culture G) **+** un suivi de progression par discipline
  (comme `lesson_progress` pour les leçons).
- **Public** : les deux comptes de l'app, niveau **multi-niveaux** (débutant
  à avancé).
- **Objectifs** : santé générale/forme physique **et** progression mesurable
  (force, endurance, technique).
- **Contrainte matériel** : accès salle de sport possible (pas uniquement du
  poids du corps en extérieur).

Ce document ne contient que de la recherche et des pistes — aucune
implémentation n'a encore été faite. Chaque section cite ses sources ; celles
marquées « non vérifié directement » proviennent de résumés tiers et
devraient être recoupées avec la source primaire avant d'être publiées comme
contenu dans l'app (même logique que `editorial_status = 'a_verifier'` pour
Culture G).

## 1. Principes transversaux (toutes disciplines)

- **Volume d'activité recommandé (OMS, lignes directrices 2020)** : 150 à
  300 min/semaine d'activité aérobie d'intensité modérée, OU 75 à 150
  min/semaine d'intensité élevée, OU une combinaison équivalente des deux ;
  plus un travail de renforcement musculaire des groupes musculaires
  principaux au moins 2 jours/semaine.
- **Règle de surcharge progressive** : ne pas augmenter le volume ou
  l'intensité de plus de ~10 %/semaine (règle très répandue dans les guides
  dérivés de l'ACSM, non vérifiée directement dans le texte source officiel
  — à recouper avant de la citer comme "recommandation officielle").
- **Mesure de l'intensité perçue** : l'échelle RPE (Rating of Perceived
  Exertion) est l'outil le plus simple pour faire varier l'intensité sans
  matériel de mesure — pertinent pour un onglet où on ne demandera pas aux
  utilisateurs de porter un cardiofréquencemètre.
- **Progression = un seul levier à la fois** : qu'il s'agisse de course, de
  natation ou de calisthénie, le principe qui revient dans toutes les
  sources est de ne faire varier qu'une seule variable à la fois (volume,
  intensité, repos, fréquence) plutôt que plusieurs en même temps.

## 2. Calisthénie (poids du corps)

### Le système "Big Six" (Convict Conditioning, Paul Wade)

Référence la plus structurée trouvée pour une progression poids du corps
pure, du débutant à l'avancé. Principe général (sources secondaires : revue
Bodybuilding.com, résumé Blinkist, StrongFirst — le livre lui-même n'a pas pu
être consulté directement, donc les paliers exacts sont à vérifier) :

- 6 mouvements fondamentaux, chacun couvrant un groupe de muscles/un pattern
  moteur : **pompe** (push-up), **squat**, **traction** (pull-up),
  **relevé de jambes** (leg raise), **pont** (bridge), **pompe en appui
  renversé** (handstand push-up).
- Chaque mouvement est découpé en **10 paliers progressifs**, du plus facile
  au plus difficile (ex. pour la traction : tirages verticaux → tirages
  horizontaux → tirages "jackknife" → tractions partielles → traction
  complète → traction resserrée, etc. — liste à confirmer palier par
  palier).
- Règle d'avancement citée par plusieurs sources : passer au palier suivant
  une fois un objectif de répétitions atteint sur le palier courant (ex. 2
  séries de 50 répétitions selon une source — à vérifier, le nombre exact
  variant probablement par palier et par mouvement).
- Avantage pour notre cas d'usage : la logique "palier + objectif de reps
  pour avancer" se transpose très naturellement en **banque d'exercices +
  critère de progression**, exactement la structure de données qu'on
  envisage.

### Approche complémentaire (type GMB Fitness / guides généralistes)

Pas de méthode officielle GMB trouvée directement (leur site n'est pas
remonté dans les résultats), mais le principe général revient dans plusieurs
guides indépendants et est cohérent avec Convict Conditioning :

- Débuter par des **régressions** (négatives, holds statiques, surface
  instable → stable, angle de levier plus favorable → moins favorable)
  plutôt que par le mouvement final.
- Travailler les mouvements de **compétence/skill** (ex. handstand,
  muscle-up) en début de séance à froid, et le travail de **volume/force**
  après.
- Limiter les mouvements les plus exigeants (planche, front lever) à 2
  séances/semaine maximum pour la récupération.
- Repères de progression grossiers (une source, à traiter comme illustratif
  et non comme vérité générale) : bases en 0-3 mois, mouvements
  intermédiaires (muscle-up, handstand) en 3-10 mois, mouvements avancés
  (front lever, planche) en 10-34 mois.

## 3. Course à pied

### Les 5 intensités d'entraînement (Jack Daniels, VDOT)

Référence la plus citée et la plus structurée pour organiser des séances par
niveau et par objectif :

- **VDOT** : indice de forme aérobie calculé à partir d'une performance
  récente sur course (pas d'un test de laboratoire) — permet de calibrer les
  allures d'entraînement sans matériel.
- 5 types de séances, de la plus facile à la plus intense : **footing facile
  (easy)**, **allure marathon**, **seuil (threshold)**, **intervalles
  (interval)**, **répétitions (repetition)**.
- Plans organisés par niveau : débutant, intermédiaire, avancé, élite
  (étiquetés "white/red/blue/gold" dans le livre). Le plan "élite" n'est
  explicitement pas adapté à un débutant.
- Un plan "novice" existe avec une approche **course/marche** sur la
  première moitié du plan — pertinent pour notre palier "débutant".

### Plans par distance et par niveau (Hal Higdon)

- Organisation en grille **distance × niveau** (5K, 10K, semi, marathon ×
  débutant/intermédiaire/avancé), ce qui correspond bien à une structuration
  en "catégories" façon Culture G (discipline = distance visée, difficulté =
  niveau).
- Le plan semi-marathon "novice" démarre volontairement facile et monte
  progressivement ; l'"avancé" est pensé pour des coureurs qui courent déjà
  régulièrement des 5K/10K/semi/marathon.

### Initiation pure (NHS Couch to 5K)

Référence utile spécifiquement pour le palier "grand débutant" :

- Programme de **9 semaines**, 3 séances/semaine, un jour de repos entre
  chaque séance de course.
- Progression en 3 phases :
  - Semaines 1-3 : alternance course/marche sur de courts intervalles (ex.
    60 s de course / 90 s de marche, répété ~20-30 min).
  - Semaines 4-6 : allongement progressif des intervalles de course,
    réduction de la marche.
  - Semaines 7-9 : course continue, objectif 5 km sans pause marche.
- Plusieurs sources notent qu'on peut répéter une semaine autant que
  nécessaire avant de passer à la suivante — logique de "critère de passage"
  plutôt que de calendrier rigide, cohérente avec une banque de séances où
  l'utilisateur progresse à son rythme plutôt que suivre un calendrier figé.

## 4. Natation

### École de Natation Française (Fédération Française de Natation)

Référence officielle française la plus pertinente pour structurer des
niveaux :

- **3 niveaux de progression officiels** : Bronze (découverte), Argent
  (intermédiaire), Or (confirmé) — correspond presque directement à une
  structuration difficulté débutant/intermédiaire/avancé pour la banque de
  séances.
- Programme national **"Aisance Aquatique"** porté par le ministère des
  Sports et la FFN, centré sur la mise à l'aise dans l'eau avant la
  technique de nage pure — pertinent pour les tout premiers paliers.
- Niveau confirmé (référence municipale Paris, non officielle FFN mais
  cohérente) : maîtrise des 4 nages (brasse, crawl, dos crawlé, papillon) +
  travail d'endurance.

### Structuration des séances par intervalles (guides généralistes)

Pas de méthodologie officielle US Masters Swimming / Swim England trouvée
directement dans les résultats ; principes recoupés sur plusieurs guides
indépendants et cohérents entre eux :

- **Débutant** : séances courtes structurées en échauffement / éducatifs
  (drills) / répétitions courtes / retour au calme (ex. séance de 500 m).
  Doubler la distance continue nageable sur les 2-3 premières semaines.
- **Intervalles à repos fixe** : ex. 8 × 25 m avec 15 s de repos, pour
  habituer progressivement à l'entraînement fractionné.
- **Travail technique** : séances dédiées en alternant longueur
  "éducatif"/longueur "nage", en changeant l'éducatif à chaque série ; fin
  de séance toujours en aisance technique, pas en fatigue.
- **Règle de progression** : ne faire varier qu'une seule variable à la fois
  (distance, vitesse de l'intervalle, temps de repos, fréquence
  hebdomadaire) — et revenir en arrière dès que la technique se dégrade.
- **Avancé** : plans périodisés classiques — base d'endurance, seuil et
  vitesse, affûtage, simulation d'allure de course.

## 5. Synthèse : ce qui se transpose bien à notre structure de données

Points communs aux 3 disciplines qui confirment que le modèle "banque de
séances + suivi de progression" (plutôt qu'un calendrier figé) est le bon
choix :

- Les 3 disciplines ont des **référentiels de niveaux déjà établis**
  (paliers Convict Conditioning, grille distance × niveau Higdon/VDOT,
  Bronze/Argent/Or FFN) → directement réutilisables comme `difficulty` sur le
  modèle de Culture G.
- Toutes insistent sur une **progression par critère de réussite** (objectif
  de reps, temps, distance) plutôt que par calendrier strict, et sur le fait
  de répéter une étape autant que nécessaire avant d'avancer → cohérent avec
  un suivi "séance faite / à refaire" plutôt qu'un plan figé semaine par
  semaine.
- Toutes recommandent de **ne faire varier qu'un seul paramètre à la fois**
  → utile comme règle de conception quand on écrira les séances (chaque
  séance ne devrait introduire qu'une seule progression par rapport à la
  précédente).

## 6. Prochaines étapes (non faites, pour mémoire)

- Choisir un modèle de données (probablement calqué sur `lessons` /
  `lesson_progress` : une table `workouts` avec `discipline`, `difficulty`,
  `objectif`, contenu de séance, et une table `workout_progress` par
  compte).
- Rédiger un premier lot de séances par discipline × niveau, avec le même
  statut `editorial_status = 'a_verifier'` que pour Culture G (contenu
  généré ici sans accès réseau de vérification croisée fiable à 100 %).
- Définir les icônes/couleurs de discipline et l'UI de l'onglet une fois le
  premier lot de contenu validé.

## Sources

- [Calisthenics Skills: The Complete Progression Guide](https://www.underarmour.com/en-us/t/playbooks/training/calisthenics-skills/)
- [No Weights, No Limits: An Interview With Paul Wade](https://www.bodybuilding.com/fun/no-weights-no-limits-an-interview-with-paul-wade.html)
- [Convict Conditioning — book summary](https://www.blinkist.com/books/convict-conditioning-en)
- [StrongFirst community discussion on Convict Conditioning](https://www.strongfirst.com/community/goto/post?id=334489)
- [Jack Daniels' Running Formula — Fellrnr](https://fellrnr.com/wiki/Jack_Daniels)
- [I'm Using VDOT to Plan a Year of Running](https://myhealthsciences.com/blog-posts/fitness/im-using-vdot-to-plan-a-year-of-running)
- [Hal Higdon — TrainingPeaks coach profile](https://www.trainingpeaks.com/coach/hal-higdon)
- [Pros and Cons of Hal Higdon Half Marathon Training Plans](https://runningwithrock.com/hal-higdon-half-marathon-plans/)
- [Hal Higdon: The Godfather of Marathon Training Plans](https://marathonhandbook.com/hal-higdon/)
- [How to get started with Couch to 5k — Nuffield Health](https://nuffieldhealth.com/article/how-to-get-started-with-couch-to-5k)
- [What is Couch to 5k — British Dietetic Association](https://bda.org.uk/what-is-couch-to-5k/)
- [Free 2-week swim interval training plan for beginners — 220 Triathlon](https://www.220triathlon.com/training/training-plans/free-2-week-swim-interval-training-plan-for-beginners)
- [Beginner's Guide to Swim Training — TrainingPeaks](https://www.trainingpeaks.com/blog/beginners-guide-to-swimming/)
- [Interval swim training: Boost endurance and performance](https://swimcamp.com/blog/interval-swim-training-boost-endurance-and-performance/)
- [L'école de natation française — FFN](https://www.ffnatation.fr/lecole-de-natation-francaise)
- [Académie de la natation — FFN](https://www.ffnatation.fr/academie-de-la-natation)
- [La natation, un sport complet et ludique — Paris.fr](https://www.paris.fr/activites/la-natation-un-sport-complet-et-ludique-pour-les-enfants-de-6-ans-et-plus-43826)
- [World Health Organization 2020 guidelines on physical activity and sedentary behaviour — PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7719906/)
