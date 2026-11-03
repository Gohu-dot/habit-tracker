-- Quatrième lot de la banque de culture générale (voir
-- 017_lessons_banque_culture_generale.sql pour le contexte complet) :
-- comble 6 domaines déjà suggérés dans DOMAIN_SUGGESTIONS (lib/lessons.ts)
-- mais jusqu'ici vides (Technologies et société, Psychologie et sciences
-- cognitives, Mathématiques et logique, Sociologie et économie, Histoire
-- des sciences et des techniques, Corps humain et neurosciences), et
-- ajoute un nouveau domaine 'Sport', absent de la banque jusqu'ici alors
-- qu'il ressort comme un thème classique des quiz/applis de culture
-- générale (recherche web : Wooclap, Quizia, doquizzes, treasure quiz).
-- 7 domaines x 4 leçons. Même format et même statut 'a_verifier' que les
-- lots précédents (contenu généré par Claude, pas vérifié par une source
-- externe faute d'accès réseau sortant depuis cet environnement).
--
-- Idempotent comme les migrations précédentes : chaque insert est gardé
-- par un "where not exists" sur le titre.

-- Technologies et société

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''intelligence artificielle expliquée simplement',
  'Technologies et société',
  'Comment des machines peuvent sembler ''comprendre'' le langage ou reconnaître des images, sans pour autant penser comme nous.',
  'L''intelligence artificielle (IA) désigne des programmes informatiques capables de réaliser des tâches qui semblaient jusque-là réservées à l''intelligence humaine : reconnaître une image, traduire un texte, jouer aux échecs ou générer du texte. Contrairement à l''image qu''en donne la science-fiction, la plupart des IA actuelles ne "pensent" pas et ne comprennent pas le monde comme un être humain : elles repèrent des régularités statistiques dans d''immenses quantités de données.

Une grande partie des IA récentes, notamment celles qui génèrent du texte ou des images, reposent sur des "réseaux de neurones artificiels", des structures de calcul vaguement inspirées du fonctionnement des neurones biologiques, mais bien plus simples. Ces réseaux sont "entraînés" en leur montrant des millions d''exemples, ce qui leur permet d''ajuster progressivement des milliards de paramètres internes jusqu''à produire des résultats cohérents.

Ce principe d''apprentissage à partir de données, appelé "apprentissage automatique", existe depuis plusieurs décennies, mais les progrès récents viennent surtout de la combinaison de trois facteurs : des quantités de données bien plus grandes (grâce à Internet), une puissance de calcul informatique bien supérieure, et de nouvelles architectures de réseaux de neurones, comme les "transformeurs" apparus en 2017, à l''origine des assistants conversationnels actuels.

L''IA pose aussi de nombreuses questions de société, encore débattues : son impact sur certains emplois, les biais qu''elle peut reproduire si les données d''entraînement en contiennent, la difficulté à vérifier l''exactitude de ce qu''elle produit, ou les enjeux de régulation à l''échelle des États. Ces débats ne sont pas nouveaux dans l''histoire des technologies, mais prennent une ampleur particulière avec la rapidité de diffusion de ces outils ces dernières années.',
  'intermediaire', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''intelligence artificielle expliquée simplement');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Comment un projet militaire américain est devenu Internet',
  'Technologies et société',
  'D''un réseau conçu pour résister à une attaque nucléaire au web que nous utilisons chaque jour.',
  'Les origines d''Internet remontent à la fin des années 1960, avec ARPANET, un réseau développé par une agence de recherche du ministère de la Défense américain. L''objectif initial était de permettre à quelques ordinateurs de centres de recherche universitaires de communiquer entre eux et de partager des ressources de calcul, à une époque où les ordinateurs étaient énormes, rares et très coûteux.

Un principe technique central a permis à ce réseau de grandir : la "commutation de paquets", qui consiste à découper les informations envoyées en petits morceaux, chacun pouvant emprunter un chemin différent à travers le réseau avant d''être réassemblé à l''arrivée. Ce principe rend le réseau plus robuste : si une partie tombe en panne, les paquets peuvent passer par un autre chemin.

Dans les décennies suivantes, de plus en plus de réseaux universitaires et nationaux se sont connectés entre eux grâce à des protocoles de communication communs (notamment TCP/IP, normalisé au début des années 1980), donnant naissance à ce qu''on appelle aujourd''hui "Internet" : un réseau de réseaux. Mais Internet, à cette époque, restait réservé aux chercheurs et aux institutions.

C''est l''invention du World Wide Web par l''informaticien britannique Tim Berners-Lee, en 1989-1991, qui a rendu Internet accessible au grand public, grâce à des pages reliées entre elles par des liens cliquables et consultables avec un simple navigateur. Berners-Lee a choisi de ne jamais faire breveter son invention, la rendant librement utilisable par tous — une décision souvent citée comme l''une des raisons de l''essor rapide du web dans les années 1990.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Comment un projet militaire américain est devenu Internet');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Comment fonctionne un smartphone, cet ordinateur qui tient dans la poche',
  'Technologies et société',
  'Un petit tour des composants qui permettent à un smartphone de téléphoner, naviguer sur Internet et prendre des photos.',
  'Un smartphone est avant tout un petit ordinateur, organisé autour d''une puce centrale appelée processeur, qui exécute les instructions de toutes les applications. Contrairement aux ordinateurs des débuts de l''informatique, qui remplissaient des salles entières, les progrès de la miniaturisation électronique permettent aujourd''hui de faire tenir une puissance de calcul considérable sur un circuit de quelques centimètres carrés.

Pour se connecter à Internet et téléphoner, un smartphone communique avec des antennes relais disposées à travers le territoire, en utilisant des ondes radio. Selon la disponibilité du réseau, l''appareil bascule entre différentes technologies (la 4G, la 5G, ou le Wi-Fi), chacune offrant des vitesses de transfert de données différentes.

L''écran tactile, l''une des innovations qui a permis l''essor des smartphones modernes à partir de la fin des années 2000, détecte le contact d''un doigt grâce à de fines grilles électriques invisibles intégrées sous la surface en verre : le doigt, légèrement conducteur, modifie le champ électrique à l''endroit où il touche l''écran, ce qui permet à l''appareil de localiser précisément le point de contact.

Les appareils photo intégrés, de plus en plus performants, reposent sur un petit capteur qui convertit la lumière en signal électrique, puis en image numérique grâce à des traitements informatiques très sophistiqués. Un smartphone moderne combine ainsi, dans un objet tenant dans une main, des technologies qui occupaient autrefois des appareils séparés et bien plus volumineux : téléphone, appareil photo, ordinateur, lecteur de musique, boussole, carte routière...',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Comment fonctionne un smartphone, cet ordinateur qui tient dans la poche');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''exploration spatiale moderne, entre stations orbitales et fusées réutilisables',
  'Technologies et société',
  'Comment l''exploration de l''espace est passée d''une rivalité entre deux superpuissances à un secteur porté aussi par des entreprises privées.',
  'Depuis le lancement du premier satellite artificiel, Spoutnik 1, par l''Union soviétique en 1957, l''exploration spatiale a connu plusieurs grandes phases. La première, marquée par la rivalité entre les États-Unis et l''Union soviétique pendant la guerre froide, a culminé avec les missions Apollo, qui ont permis à des astronautes américains de marcher sur la Lune entre 1969 et 1972.

Depuis 1998, la Station spatiale internationale (ISS), construite et exploitée conjointement par plusieurs agences spatiales, accueille en permanence des astronautes en orbite autour de la Terre, à environ 400 kilomètres d''altitude, où ils mènent des expériences scientifiques impossibles à réaliser sur Terre, notamment en micropesanteur.

Depuis les années 2010, des entreprises privées, en particulier SpaceX, fondée par Elon Musk, ont profondément transformé le secteur spatial en développant des fusées partiellement réutilisables : leurs premiers étages reviennent se poser verticalement après le lancement, au lieu d''être perdus en mer comme auparavant, ce qui réduit considérablement le coût des missions spatiales.

Plusieurs agences et entreprises visent aujourd''hui un retour habité sur la Lune (notamment le programme américain Artemis) comme étape vers un objectif plus lointain : l''envoi d''astronautes sur Mars, un voyage qui reste l''un des plus grands défis techniques de l''exploration spatiale en raison de sa durée et des risques liés aux radiations cosmiques.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''exploration spatiale moderne, entre stations orbitales et fusées réutilisables');

-- Psychologie et sciences cognitives

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Les biais cognitifs, ces raccourcis de pensée qui nous trompent',
  'Psychologie et sciences cognitives',
  'Pourquoi notre cerveau se trompe parfois de façon systématique et prévisible.',
  'Un biais cognitif est une tendance systématique de notre esprit à dévier d''un raisonnement parfaitement logique ou objectif, souvent sans que l''on s''en rende compte. Loin d''être de simples erreurs aléatoires, ces biais sont des mécanismes de pensée récurrents, identifiés et étudiés par la psychologie cognitive depuis les années 1970, notamment par les chercheurs Daniel Kahneman et Amos Tversky.

Le "biais de confirmation" est l''un des plus connus : il désigne notre tendance naturelle à rechercher, interpréter et retenir en priorité les informations qui confirment ce que l''on croit déjà, tout en négligeant celles qui le contredisent. Ce biais explique en partie pourquoi il est si difficile de faire changer d''avis quelqu''un de convaincu, même face à des preuves contraires.

L''"effet de halo" est un autre biais fréquent : il nous pousse à généraliser une impression positive (ou négative) sur une personne à partir d''une seule caractéristique visible, par exemple en jugeant quelqu''un de beau comme probablement compétent, sans aucun lien logique réel entre ces qualités. Ce biais influence, souvent à notre insu, nos jugements sur les autres au quotidien.

Ces biais ne sont pas des défauts à éliminer entièrement : ce sont des raccourcis mentaux que notre cerveau utilise pour prendre des décisions rapides avec une énergie limitée, et qui fonctionnent plutôt bien dans la majorité des situations du quotidien. Les connaître permet surtout de rester vigilant dans les situations où ils peuvent nous induire en erreur, par exemple lors d''une décision importante.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Les biais cognitifs, ces raccourcis de pensée qui nous trompent');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Pourquoi on rêve, un mystère encore partiellement non résolu',
  'Psychologie et sciences cognitives',
  'Ce que la science sait, et ne sait pas encore, sur les rêves que nous oublions presque tous en quelques minutes.',
  'Le rêve désigne l''activité mentale, souvent faite d''images et de scénarios plus ou moins cohérents, qui se produit pendant le sommeil, en particulier lors d''une phase appelée sommeil paradoxal. Durant cette phase, l''activité électrique du cerveau ressemble étonnamment à celle de l''éveil, alors même que le corps est presque entièrement paralysé, probablement pour nous empêcher de mimer physiquement ce que l''on rêve.

Plusieurs théories scientifiques tentent d''expliquer la fonction des rêves, sans qu''aucune ne fasse aujourd''hui l''unanimité complète. Certains chercheurs pensent que le rêve participe à la consolidation de la mémoire, en aidant le cerveau à trier et à renforcer certains souvenirs de la journée. D''autres avancent une fonction de régulation émotionnelle, le rêve permettant de "digérer" des émotions fortes vécues récemment.

Une autre hypothèse, dite de simulation des menaces, suggère que le rêve aurait pu avoir, au cours de l''évolution, un rôle d''entraînement : en simulant des situations dangereuses pendant le sommeil, notre cerveau se préparerait à mieux y réagir une fois éveillé. Cette théorie resterait cohérente avec le fait que de nombreux rêves comportent des éléments de menace ou de poursuite.

La plupart des rêves sont oubliés en quelques minutes après le réveil, probablement parce que certaines substances chimiques nécessaires à la formation de souvenirs durables sont moins présentes dans le cerveau pendant le sommeil paradoxal. C''est aussi pourquoi les personnes qui se réveillent directement au milieu ou juste après un rêve ont davantage de chances de s''en souvenir clairement.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Pourquoi on rêve, un mystère encore partiellement non résolu');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La mémoire et l''oubli, un système plus fragile et reconstructif qu''on ne le croit',
  'Psychologie et sciences cognitives',
  'Pourquoi nos souvenirs ne sont pas enregistrés comme une vidéo, mais reconstruits à chaque fois qu''on s''en souvient.',
  'Contrairement à une idée répandue, la mémoire humaine ne fonctionne pas comme une caméra qui enregistrerait fidèlement chaque instant vécu pour le restituer plus tard à l''identique. Chaque souvenir est plutôt reconstruit activement par le cerveau au moment où l''on s''en souvient, à partir de fragments épars, ce qui le rend susceptible d''être légèrement modifié, voire déformé, à chaque rappel.

Les scientifiques distinguent plusieurs types de mémoire : la mémoire à court terme, qui ne retient qu''un nombre très limité d''informations pendant quelques dizaines de secondes, et la mémoire à long terme, capable de conserver des informations durant des années, voire toute une vie, grâce à un processus appelé consolidation.

L''oubli n''est pas uniquement une défaillance du système : il joue aussi un rôle utile, en permettant au cerveau de ne pas saturer de détails inutiles. La fameuse "courbe de l''oubli", décrite dès la fin du XIXe siècle par le psychologue allemand Hermann Ebbinghaus, montre que l''essentiel de l''oubli d''une information nouvelle se produit dans les heures et les jours qui suivent son apprentissage, avant de ralentir fortement.

C''est précisément ce constat qui a inspiré le principe de la répétition espacée (voir comment fonctionne la révision dans l''onglet Leçons) : revoir une information à intervalles progressivement plus longs permet de "rafraîchir" le souvenir juste avant qu''il ne s''efface, ce qui le consolide bien plus efficacement que de le répéter plusieurs fois d''affilée le même jour.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'La mémoire et l''oubli, un système plus fragile et reconstructif qu''on ne le croit');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''effet placebo, quand croire à un traitement suffit parfois à se sentir mieux',
  'Psychologie et sciences cognitives',
  'Comment une simple pilule de sucre peut parfois produire de vrais effets mesurables sur le corps.',
  'L''effet placebo désigne une amélioration réelle et mesurable de l''état d''une personne après l''administration d''un traitement dépourvu de principe actif, simplement parce que cette personne croit recevoir un vrai traitement. Ce phénomène, documenté depuis des décennies en médecine, n''est pas une simple "illusion" sans effet réel : des mesures physiologiques objectives montrent parfois de véritables changements, notamment sur la perception de la douleur.

Une partie de l''effet placebo s''expliquerait par la capacité du cerveau à libérer lui-même certaines substances, comme les endorphines, de puissants antidouleurs naturels, en réaction à l''attente positive d''un soulagement. Le contexte joue aussi un rôle important : la relation de confiance avec le soignant, le rituel de la prise de traitement, ou même la couleur et la taille du comprimé peuvent influencer l''intensité de l''effet observé.

C''est précisément pour neutraliser ce phénomène que les essais cliniques testant l''efficacité réelle d''un nouveau médicament comparent systématiquement ses effets à ceux d''un placebo, sans que les patients ne sachent qui reçoit le vrai traitement — une méthode appelée "double aveugle". Un médicament n''est considéré comme réellement efficace que s''il fait mieux que ce simple effet placebo.

Il existe aussi un phénomène inverse, appelé "effet nocebo" : des effets négatifs ou des douleurs peuvent apparaître simplement parce qu''une personne s''attend à un effet indésirable. Ensemble, ces deux effets montrent à quel point les attentes et les croyances peuvent influencer, dans une certaine mesure, des sensations bien réelles du corps.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''effet placebo, quand croire à un traitement suffit parfois à se sentir mieux');

-- Mathématiques et logique

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''invention du zéro, le chiffre qui a mis des siècles à s''imposer',
  'Mathématiques et logique',
  'Comment représenter ''rien'' a longtemps posé un vrai problème mathématique et philosophique.',
  'Compter sans le zéro paraît aujourd''hui presque impensable, et pourtant ce chiffre, qui semble si simple, a mis beaucoup de temps à s''imposer dans l''histoire des mathématiques. De nombreuses civilisations anciennes, comme les Égyptiens ou les Romains, n''ont jamais ressenti le besoin d''inventer un symbole dédié à l''absence de quantité.

Le concept de zéro en tant que nombre à part entière, utilisable dans des calculs, est généralement attribué aux mathématiciens indiens, en particulier à Brahmagupta au VIIe siècle, qui a posé les premières règles claires pour additionner, soustraire et multiplier avec le zéro. Avant cela, certaines civilisations, comme les Babyloniens ou les Mayas, utilisaient bien un symbole pour marquer une position vide dans l''écriture des nombres, mais sans en faire un véritable nombre manipulable dans des calculs.

Ce concept s''est ensuite diffusé vers le monde arabo-musulman, où des mathématiciens comme Al-Khwarizmi (dont le nom a donné le mot "algorithme") l''ont intégré à un système de numération complet, avant d''être introduit en Europe autour du XIIe-XIIIe siècle, notamment grâce au mathématicien italien Fibonacci, qui en a vanté les mérites pratiques pour le commerce face aux chiffres romains.

Au-delà de son usage pratique, le zéro a aussi soulevé des questions philosophiques profondes : comment un symbole peut-il représenter "rien" tout en étant lui-même "quelque chose" qu''on manipule dans un calcul ? Cette tension a valu au zéro une certaine méfiance dans plusieurs civilisations anciennes, avant qu''il ne devienne un pilier incontournable des mathématiques modernes, notamment pour l''écriture positionnelle des grands nombres (distinguer 103 de 13, par exemple).',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''invention du zéro, le chiffre qui a mis des siècles à s''imposer');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Les nombres premiers, les briques de base de tous les nombres',
  'Mathématiques et logique',
  'Pourquoi ces nombres divisibles uniquement par 1 et par eux-mêmes fascinent les mathématiciens depuis l''Antiquité.',
  'Un nombre premier est un nombre entier supérieur à 1 qui n''est divisible que par 1 et par lui-même, comme 2, 3, 5, 7, 11 ou 13. Tous les autres nombres entiers, dits "composés", peuvent être obtenus en multipliant entre eux des nombres premiers : par exemple, 60 peut se décomposer en 2 × 2 × 3 × 5. Les nombres premiers jouent ainsi un rôle comparable à celui des briques élémentaires de construction de tous les autres nombres.

Le mathématicien grec Euclide a démontré, il y a plus de 2 300 ans, qu''il existe une infinité de nombres premiers, grâce à un raisonnement par l''absurde particulièrement élégant : si l''on supposait qu''il n''en existait qu''un nombre fini, on pourrait toujours en construire un nouveau à partir de ceux déjà connus, ce qui contredit l''hypothèse de départ.

Trouver si un très grand nombre est premier, ou décomposer un grand nombre composé en ses facteurs premiers, devient extrêmement difficile et long à mesure que les nombres grandissent, même pour un ordinateur puissant. Cette difficulté est directement utilisée en cryptographie moderne, notamment pour sécuriser les transactions bancaires et les communications sur Internet.

Certaines questions sur les nombres premiers restent non résolues malgré des siècles de recherche, comme la conjecture de Goldbach (tout nombre pair supérieur à 2 serait la somme de deux nombres premiers), vérifiée sur d''innombrables exemples mais jamais formellement démontrée pour tous les cas. Ces questions, simples à formuler mais redoutablement difficiles à prouver, continuent de fasciner les mathématiciens du monde entier.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Les nombres premiers, les briques de base de tous les nombres');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le paradoxe de Zénon, ou comment ''prouver'' qu''on ne peut jamais bouger',
  'Mathématiques et logique',
  'Un casse-tête vieux de 2 500 ans qui a longtemps résisté à une explication mathématique satisfaisante.',
  'Zénon d''Élée, philosophe grec du Ve siècle avant notre ère, est resté célèbre pour une série de paradoxes destinés à démontrer, de façon volontairement provocante, que le mouvement serait en réalité impossible. Le plus connu met en scène le héros Achille, réputé très rapide, face à une tortue partie avec une petite avance.

Zénon raisonne ainsi : pour rattraper la tortue, Achille doit d''abord atteindre le point où elle se trouvait au départ. Mais pendant ce temps, la tortue a avancé un peu plus loin. Achille doit alors atteindre ce nouveau point, pendant lequel la tortue avance encore un peu, et ainsi de suite, une infinité de fois. Zénon en conclut, de façon délibérément absurde, qu''Achille ne pourra jamais rattraper la tortue.

Ce raisonnement, bien que manifestement contredit par l''expérience quotidienne, a longtemps posé un vrai défi mathématique : comment une somme contenant une infinité de termes pourrait-elle donner, malgré tout, un résultat fini ? La réponse moderne vient du concept de "série convergente" : une addition d''une infinité de termes de plus en plus petits peut très bien converger vers une valeur finie, un peu comme 1/2 + 1/4 + 1/8 + 1/16... se rapproche indéfiniment de 1 sans jamais le dépasser.

Ce paradoxe illustre bien pourquoi certaines idées qui semblent logiques à première vue peuvent pourtant mener à des conclusions absurdes si l''on ne manipule pas correctement des concepts comme l''infini. Il a fallu attendre le développement du calcul infinitésimal, au XVIIe siècle, avec notamment Newton et Leibniz, pour disposer des outils mathématiques permettant de traiter rigoureusement ce genre de situations.',
  'intermediaire', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le paradoxe de Zénon, ou comment ''prouver'' qu''on ne peut jamais bouger');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Pourquoi π ne s''arrête jamais, ce nombre qu''on ne finira jamais d''écrire entièrement',
  'Mathématiques et logique',
  'Le rapport entre le tour d''un cercle et son diamètre cache un nombre aux propriétés mathématiques fascinantes.',
  'Le nombre π (pi) représente le rapport constant entre la circonférence d''un cercle et son diamètre, quelle que soit la taille du cercle considéré. Sa valeur commence par 3,14159... mais ne s''arrête jamais et ne se répète jamais selon un motif régulier, ce qui en fait ce que les mathématiciens appellent un nombre "irrationnel" — une propriété démontrée formellement par le mathématicien suisse Johann Lambert en 1761.

π est aussi un nombre dit "transcendant" (démontré en 1882 par le mathématicien allemand Ferdinand von Lindemann), ce qui signifie qu''il ne peut jamais être la solution exacte d''une équation algébrique simple à coefficients entiers. Cette propriété a définitivement clos une question vieille de plus de deux mille ans, héritée des mathématiciens grecs : il est mathématiquement impossible de construire, avec seulement une règle et un compas, un carré ayant exactement la même aire qu''un cercle donné.

Bien que π apparaisse d''abord dans la géométrie du cercle, il surgit aussi, de façon parfois surprenante, dans de nombreux autres domaines des mathématiques et de la physique qui n''ont a priori rien à voir avec des cercles, comme certains calculs de probabilités ou l''étude des ondes. Cette omniprésence inattendue en fait l''une des constantes mathématiques les plus fondamentales, aux côtés du nombre d''Euler (e).

Grâce aux ordinateurs, les mathématiciens ont calculé des dizaines de milliers de milliards de décimales de π, un exercice qui dépasse largement tout besoin pratique réel, mais qui sert surtout de test de performance pour les superordinateurs et continue de fasciner, au point qu''une journée internationale, le "jour de π" (le 14 mars, écrit 3/14 en notation américaine), lui est dédiée chaque année.',
  'intermediaire', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Pourquoi π ne s''arrête jamais, ce nombre qu''on ne finira jamais d''écrire entièrement');

-- Sociologie et économie

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''inflation, pourquoi les prix montent et l''argent perd de sa valeur',
  'Sociologie et économie',
  'Comprendre pourquoi un même billet achète progressivement de moins en moins de choses au fil du temps.',
  'L''inflation désigne une hausse générale et durable des prix des biens et services dans une économie, ce qui a pour conséquence de réduire le pouvoir d''achat de la monnaie : avec la même somme d''argent, on peut acheter progressivement moins de choses qu''auparavant. Elle se mesure généralement par un indicateur appelé indice des prix à la consommation, qui suit l''évolution du prix d''un large panier de produits représentatifs de la consommation courante.

L''inflation peut avoir plusieurs origines. Elle peut venir d''une demande trop forte par rapport à l''offre disponible, ou d''une hausse des coûts de production (le prix de l''énergie ou des matières premières, par exemple), que les entreprises répercutent ensuite sur leurs prix de vente pour préserver leurs marges.

Une inflation modérée est généralement considérée par les économistes comme plutôt saine pour une économie, car elle encourage la consommation et l''investissement plutôt que la thésaurisation pure de l''argent. C''est pourquoi la plupart des banques centrales (comme la Banque centrale européenne) visent une cible d''inflation précise, autour de 2% par an.

Une inflation trop forte et incontrôlée pénalise particulièrement les ménages dont les revenus n''augmentent pas aussi vite que les prix, creusant les inégalités, tandis que son contraire, la déflation, pose elle aussi des problèmes : les consommateurs ont tendance à reporter leurs achats en espérant des prix encore plus bas demain, ce qui peut ralentir toute l''économie. Trouver le bon équilibre reste l''un des principaux défis de la politique économique des États et des banques centrales.',
  'intermediaire', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''inflation, pourquoi les prix montent et l''argent perd de sa valeur');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Comment fonctionne une bourse, ce marché où s''échangent des bouts d''entreprises',
  'Sociologie et économie',
  'Pourquoi acheter une action, c''est devenir (un tout petit peu) propriétaire d''une entreprise.',
  'Une bourse est un marché organisé où s''échangent des actions, c''est-à-dire des parts de propriété d''une entreprise. Quand une entreprise "entre en bourse", elle propose au public d''acheter une partie de son capital en échange d''un financement, ce qui lui permet de lever des fonds pour se développer, tandis que les acheteurs deviennent, en proportion de leurs actions, copropriétaires de l''entreprise.

Le prix d''une action évolue en permanence selon la loi de l''offre et de la demande : s''il y a plus d''acheteurs que de vendeurs intéressés à un prix donné, le prix monte ; s''il y a plus de vendeurs que d''acheteurs, il baisse. Ce prix reflète en théorie les anticipations des investisseurs sur la santé actuelle et future de l''entreprise, mais aussi, en pratique, des facteurs bien plus psychologiques comme la confiance générale du marché ou des rumeurs.

Posséder une action peut rapporter de deux façons principales : par une éventuelle plus-value si on la revend plus cher qu''on ne l''a achetée, et par les dividendes, une part des bénéfices de l''entreprise parfois reversée régulièrement à ses actionnaires. Mais le prix d''une action peut tout aussi bien baisser, faisant perdre de l''argent à ceux qui l''ont achetée.

Au-delà des actions individuelles, de nombreux investisseurs particuliers préfèrent aujourd''hui des fonds qui regroupent automatiquement des centaines ou des milliers d''actions différentes (comme les fonds indiciels), une façon de répartir le risque plutôt que de miser sur la réussite d''une seule entreprise en particulier.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Comment fonctionne une bourse, ce marché où s''échangent des bouts d''entreprises');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La mondialisation expliquée simplement',
  'Sociologie et économie',
  'Comment les économies du monde se sont progressivement interconnectées, avec ses avantages et ses critiques.',
  'La mondialisation désigne le processus par lequel les économies, les sociétés et les cultures du monde entier sont devenues de plus en plus interconnectées, notamment à travers le commerce international, les flux financiers, les migrations et la circulation rapide de l''information. Si des échanges commerciaux existent depuis l''Antiquité, le phénomène s''est fortement accéléré depuis la seconde moitié du XXe siècle.

Plusieurs facteurs ont favorisé cette accélération : la baisse spectaculaire du coût du transport maritime, notamment grâce à la généralisation des conteneurs standardisés à partir des années 1960 ; la réduction progressive des droits de douane entre de nombreux pays ; et les progrès des télécommunications, qui permettent de coordonner instantanément une production répartie sur plusieurs continents.

Cette interconnexion a permis une baisse générale des prix de nombreux produits de consommation, et a contribué à sortir de la pauvreté des centaines de millions de personnes dans des pays auparavant moins industrialisés, notamment en Asie de l''Est. Elle a aussi permis une diversification considérable des produits disponibles pour les consommateurs des pays riches.

La mondialisation fait aussi l''objet de critiques importantes et bien documentées : la délocalisation de nombreux emplois industriels vers des pays à bas coût de main-d''œuvre, des conditions de travail parfois très dégradées dans certaines usines, et un impact environnemental significatif lié au transport de marchandises sur de très longues distances. Ces débats alimentent, depuis plusieurs années, des réflexions sur une possible relocalisation partielle de certaines productions jugées stratégiques.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'La mondialisation expliquée simplement');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''offre et la demande, le mécanisme qui fixe la plupart des prix',
  'Sociologie et économie',
  'Pourquoi le prix d''un même produit peut varier fortement selon le moment ou le lieu, sans que rien d''autre ne change vraiment.',
  'La loi de l''offre et de la demande est l''un des principes les plus fondamentaux de l''économie de marché : elle décrit comment le prix d''un bien ou d''un service tend à se fixer au point d''équilibre entre la quantité que les vendeurs sont prêts à proposer (l''offre) et la quantité que les acheteurs sont prêts à acquérir (la demande), à un prix donné.

Quand la demande pour un produit augmente sans que l''offre suive immédiatement, le prix a tendance à monter, car les acheteurs sont prêts à payer davantage pour s''assurer d''obtenir le produit plutôt qu''un concurrent. À l''inverse, quand l''offre dépasse largement la demande, les prix ont tendance à baisser pour inciter les acheteurs à absorber ce surplus.

Ce mécanisme explique de nombreuses variations de prix observées au quotidien : les fruits et légumes de saison, plus abondants, sont généralement moins chers que hors saison ; les billets d''avion ou d''hôtel coûtent souvent plus cher pendant les vacances scolaires ; et le prix de certaines matières premières, comme le pétrole, fluctue fortement selon les tensions géopolitiques qui affectent sa production ou son transport.

Ce modèle reste une simplification utile mais incomplète de la réalité économique : certains biens essentiels voient leur demande rester stable quel que soit le prix, et certains marchés sont fortement influencés par un petit nombre d''acteurs dominants capables d''imposer leurs prix plutôt que de simplement les subir, ce qui nuance l''application de cette loi dans de nombreuses situations réelles.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''offre et la demande, le mécanisme qui fixe la plupart des prix');

-- Histoire des sciences et des techniques

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Marie Curie et la découverte de la radioactivité',
  'Histoire des sciences et des techniques',
  'Comment une scientifique polonaise immigrée en France a ouvert tout un champ de la physique moderne, au prix de sa propre santé.',
  'Marie Curie (1867-1934), née Maria Skłodowska en Pologne, est une physicienne et chimiste installée en France dès 1891 pour poursuivre des études alors difficilement accessibles aux femmes dans son pays d''origine. Avec son mari Pierre Curie, elle mène des recherches sur un phénomène récemment découvert par le physicien français Henri Becquerel : certains matériaux émettent spontanément un rayonnement invisible, sans source d''énergie extérieure apparente.

En étudiant ce phénomène, qu''elle baptise elle-même "radioactivité", Marie Curie découvre, avec Pierre, deux nouveaux éléments chimiques jusqu''alors inconnus : le polonium, en hommage à son pays natal, et le radium, bien plus radioactif que l''uranium déjà connu. Isoler suffisamment de radium pur a nécessité de traiter, à la main, plusieurs tonnes de minerai dans des conditions de travail extrêmement pénibles.

Marie Curie reçoit le prix Nobel de physique en 1903 (partagé avec Pierre Curie et Henri Becquerel), puis devient la première personne à recevoir un second prix Nobel, cette fois de chimie, en 1911 — elle reste à ce jour la seule personne à avoir reçu des prix Nobel dans deux disciplines scientifiques différentes.

Les travaux de Marie Curie ont ouvert la voie à de nombreuses applications encore utilisées aujourd''hui, notamment en médecine (la radiothérapie pour traiter certains cancers). Elle est morte en 1934 d''une maladie du sang très probablement causée par une exposition prolongée aux radiations, à une époque où leurs dangers n''étaient pas encore bien compris — ses carnets de laboratoire, conservés aujourd''hui, restent d''ailleurs si radioactifs qu''ils ne peuvent être consultés qu''avec des précautions particulières.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Marie Curie et la découverte de la radioactivité');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Galilée face à l''Église, le procès qui a marqué l''histoire des sciences',
  'Histoire des sciences et des techniques',
  'Comment un astronome italien s''est retrouvé en conflit avec l''autorité religieuse de son époque pour avoir défendu une théorie aujourd''hui bien établie.',
  'Galileo Galilei, dit Galilée (1564-1642), est un astronome, physicien et mathématicien italien qui a notablement perfectionné la lunette astronomique, lui permettant d''observer le ciel avec une précision inédite : les montagnes de la Lune, les satellites de Jupiter, ou les phases de Vénus, des observations qui apportaient un soutien solide à la théorie selon laquelle la Terre tourne autour du Soleil, déjà proposée plus tôt par l''astronome polonais Nicolas Copernic.

Cette théorie héliocentrique entrait en contradiction avec l''interprétation alors dominante de certains textes religieux et avec la vision du monde héritée de l''Antiquité, selon laquelle la Terre immobile se trouvait au centre de l''Univers. En défendant publiquement cette théorie, Galilée s''est progressivement attiré l''hostilité d''une partie de l''Église catholique de son époque.

En 1633, Galilée est jugé par l''Inquisition romaine, contraint publiquement de renier ses positions sur le mouvement de la Terre, et assigné à résidence pour le reste de sa vie. Selon une anecdote célèbre, probablement apocryphe mais souvent citée, il aurait murmuré après son abjuration forcée : "Et pourtant, elle tourne".

Ce procès est resté un symbole marquant des tensions historiques entre science et autorité religieuse ou politique. L''Église catholique a officiellement reconnu, bien plus tard, en 1992, que le jugement porté contre Galilée avait été une erreur — une réhabilitation tardive qui illustre à quel point les idées scientifiques nouvelles ont parfois mis des siècles à être pleinement acceptées par les institutions de leur temps.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Galilée face à l''Église, le procès qui a marqué l''histoire des sciences');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La découverte de la pénicilline, un accident de laboratoire qui a sauvé des millions de vies',
  'Histoire des sciences et des techniques',
  'Comment une boîte de culture oubliée et moisie a donné naissance au premier antibiotique moderne.',
  'En 1928, le médecin et biologiste britannique Alexander Fleming revient de vacances dans son laboratoire de Londres et remarque, sur une boîte de culture de bactéries qu''il avait laissée par mégarde ouverte sur sa paillasse, la présence d''une moisissure qui avait contaminé l''expérience. Plutôt que de jeter simplement la boîte, il observe un détail frappant : tout autour de cette moisissure, les bactéries présentes avaient disparu.

Fleming identifie la moisissure responsable comme appartenant au genre Penicillium, et baptise la substance qu''elle sécrète "pénicilline". Il publie ses observations en 1929, mais la découverte reste alors largement ignorée par la communauté scientifique de l''époque, notamment parce qu''isoler et produire cette substance en quantité suffisante semblait extrêmement difficile.

Ce n''est qu''au tout début des années 1940, dans le contexte urgent de la Seconde Guerre mondiale (voir la leçon dédiée), que les chercheurs britanniques Howard Florey et Ernst Boris Chain parviennent à purifier et produire la pénicilline en quantités suffisantes pour traiter de véritables patients, avec des résultats spectaculaires. Les trois chercheurs partagent le prix Nobel de médecine en 1945 pour cette découverte.

La pénicilline marque le début de l''ère des antibiotiques modernes, qui ont permis de traiter efficacement de nombreuses infections bactériennes auparavant mortelles, et ont considérablement allongé l''espérance de vie moyenne au XXe siècle. Elle est aussi à l''origine d''un enjeu de santé publique toujours actuel : l''usage parfois excessif des antibiotiques favorise l''apparition de bactéries résistantes.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'La découverte de la pénicilline, un accident de laboratoire qui a sauvé des millions de vies');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Isaac Newton et la loi de la gravitation universelle',
  'Histoire des sciences et des techniques',
  'Comment un même principe explique aussi bien la chute d''une pomme que le mouvement des planètes.',
  'Isaac Newton (1642-1727) est un physicien et mathématicien anglais dont les travaux ont profondément marqué la physique moderne. Selon une anecdote célèbre, popularisée après sa mort, l''observation d''une pomme tombant d''un arbre lui aurait inspiré une question fondamentale : pourquoi les objets tombent-ils toujours vers le sol, et cette même force pourrait-elle aussi expliquer le mouvement de la Lune autour de la Terre ?

Newton formule, dans son ouvrage majeur publié en 1687 (les "Principia"), la loi de la gravitation universelle : tout objet possédant une masse attire tout autre objet massif, avec une force d''autant plus grande que les masses sont importantes et que la distance qui les sépare est petite. Cette loi unique permet d''expliquer, avec la même formule mathématique, aussi bien la chute d''une pomme que les orbites des planètes autour du Soleil.

Cette découverte représente une avancée majeure car elle unifie, pour la première fois de façon rigoureuse, la physique "terrestre" et la physique "céleste", deux domaines que l''on pensait auparavant régis par des lois totalement différentes, héritées notamment de la physique d''Aristote dans l''Antiquité.

La théorie de Newton a dominé la physique pendant plus de deux siècles, jusqu''à ce qu''Albert Einstein propose, au début du XXe siècle, la théorie de la relativité générale, qui décrit la gravitation de façon encore plus précise. La gravitation newtonienne reste malgré tout parfaitement suffisante et largement utilisée aujourd''hui pour la plupart des calculs pratiques, y compris pour envoyer des sondes spatiales vers d''autres planètes.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Isaac Newton et la loi de la gravitation universelle');

-- Corps humain et neurosciences

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le sommeil, une activité essentielle et loin d''être passive',
  'Corps humain et neurosciences',
  'Ce qui se passe réellement dans le corps et le cerveau pendant qu''on dort, bien plus qu''un simple repos.',
  'Contrairement à l''idée d''un cerveau simplement "en pause" pendant la nuit, le sommeil est une activité biologique complexe et activement régulée, indispensable au bon fonctionnement du corps et de l''esprit. Une nuit de sommeil se compose de plusieurs cycles successifs d''environ 90 minutes chacun, alternant différentes phases aux fonctions distinctes.

Le sommeil profond, qui domine surtout en première partie de nuit, joue un rôle central dans la récupération physique : c''est durant cette phase que le corps libère le plus d''hormone de croissance, répare les tissus et consolide le système immunitaire. Le sommeil paradoxal, plus présent en fin de nuit (voir la leçon sur les rêves), est quant à lui essentiel à la consolidation de la mémoire et à la régulation des émotions.

Le manque de sommeil chronique a des conséquences bien documentées sur la santé : des capacités de concentration et de mémorisation réduites, un système immunitaire affaibli, un risque accru de prise de poids, et à plus long terme, un risque plus élevé de maladies cardiovasculaires. Les besoins en sommeil varient selon l''âge, les adolescents et les enfants ayant généralement besoin de davantage d''heures que les adultes.

Le cerveau profite aussi du sommeil pour éliminer certains déchets métaboliques accumulés pendant l''éveil, grâce à un système de nettoyage découvert plus récemment par la recherche (le "système glymphatique"), nettement plus actif pendant le sommeil que pendant l''éveil — une découverte qui renforce l''idée que dormir n''est en rien un temps "perdu", mais une fonction biologique à part entière, aussi essentielle que manger ou respirer.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le sommeil, une activité essentielle et loin d''être passive');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le système immunitaire, l''armée invisible qui nous protège en permanence',
  'Corps humain et neurosciences',
  'Comment le corps détecte et élimine en continu des menaces microscopiques, le plus souvent sans qu''on s''en aperçoive.',
  'Le système immunitaire est l''ensemble des cellules, organes et mécanismes qui protègent le corps contre les agents infectieux (virus, bactéries, champignons, parasites) et certaines cellules anormales. Il agit en permanence, la plupart du temps sans qu''on s''en rende compte, en détectant et en éliminant des menaces potentielles bien avant qu''elles ne causent le moindre symptôme perceptible.

On distingue généralement deux grandes lignes de défense. L''immunité "innée" constitue une première barrière rapide mais peu spécifique (la peau, les muqueuses, certaines cellules qui attaquent immédiatement tout ce qui semble étranger), tandis que l''immunité "adaptative", plus lente à se mettre en place mais beaucoup plus précise, développe une réponse ciblée contre un agent infectieux particulier, grâce notamment aux lymphocytes.

C''est cette immunité adaptative qui explique le principe de la vaccination : en exposant le corps à une version inoffensive ou affaiblie d''un agent infectieux, le système immunitaire apprend à le reconnaître et conserve une "mémoire immunitaire", lui permettant de réagir beaucoup plus vite en cas d''exposition future au véritable agent infectieux, souvent avant même l''apparition des premiers symptômes.

Le système immunitaire peut aussi mal fonctionner : il peut être affaibli, ou au contraire devenir hyperactif et se retourner contre les propres cellules du corps, ce qu''on appelle une maladie auto-immune. Maintenir cet équilibre délicat entre vigilance suffisante et tolérance envers son propre corps reste l''un des grands défis biologiques du système immunitaire.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le système immunitaire, l''armée invisible qui nous protège en permanence');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Les cinq sens, et quelques autres que l''on oublie souvent de citer',
  'Corps humain et neurosciences',
  'Comment le corps perçoit le monde extérieur, et pourquoi la liste classique des cinq sens est en réalité incomplète.',
  'La vue, l''ouïe, l''odorat, le goût et le toucher forment la liste classique des cinq sens, popularisée depuis l''Antiquité, notamment par le philosophe grec Aristote. Chacun repose sur des cellules sensorielles spécialisées, capables de convertir une forme d''énergie extérieure en signaux électriques transmis au cerveau, où ils sont interprétés.

Le goût, souvent perçu comme assez simple, est en réalité étroitement lié à l''odorat : une grande partie de ce qu''on croit "goûter" provient en fait des arômes perçus par le nez pendant la mastication — c''est pourquoi un rhume qui bouche le nez réduit aussi fortement la perception des saveurs des aliments.

Contrairement à la liste classique des cinq sens, les scientifiques en reconnaissent aujourd''hui plusieurs autres, tout aussi essentiels mais moins intuitifs : la proprioception, qui permet de savoir où se trouvent les différentes parties de son corps les yeux fermés, l''équilibre, géré notamment par l''oreille interne, ou encore la perception de la douleur et de la température, qui reposent sur des récepteurs spécifiques distincts du simple toucher.

Ces sens ne fonctionnent jamais vraiment isolément : le cerveau combine en permanence les informations provenant de plusieurs sens à la fois pour construire une perception cohérente du monde environnant. C''est ce qui explique certaines illusions étonnantes, comme le fait de voir ses lèvres articuler un son différent de celui réellement entendu, ce qui peut modifier la perception auditive elle-même (l''effet McGurk).',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Les cinq sens, et quelques autres que l''on oublie souvent de citer');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le cœur, une pompe infatigable au service de tout le corps',
  'Corps humain et neurosciences',
  'Comment un muscle de la taille d''un poing fait circuler le sang dans l''ensemble du corps, sans jamais s''arrêter.',
  'Le cœur est un muscle creux, de la taille approximative d''un poing fermé, qui se contracte en moyenne entre 60 et 100 fois par minute chez un adulte au repos, soit plus de 100 000 battements par jour, pour faire circuler le sang dans l''ensemble du corps. Il est divisé en quatre cavités, qui travaillent de façon coordonnée pour propulser le sang dans deux circuits distincts mais complémentaires.

Le circuit dit "pulmonaire" envoie le sang pauvre en oxygène vers les poumons, où il se recharge en oxygène et se débarrasse du dioxyde de carbone accumulé, tandis que le circuit dit "systémique" envoie ce sang fraîchement oxygéné vers l''ensemble des organes et des muscles du corps, avant de revenir, appauvri en oxygène, vers le cœur pour recommencer le cycle.

L''ensemble du réseau de vaisseaux sanguins du corps humain s''étendrait, mis bout à bout, sur environ 100 000 kilomètres, soit plus de deux fois le tour de la Terre — une illustration frappante de la densité du réseau nécessaire pour irriguer chaque cellule du corps en oxygène et en nutriments.

Le rythme et la force des battements cardiaques sont finement régulés par le système nerveux et certaines hormones, en fonction des besoins du moment : un effort physique, une émotion forte ou une montée de stress peuvent ainsi accélérer significativement le rythme cardiaque, parfois bien avant même que l''on en prenne pleinement conscience. C''est aussi pourquoi une activité physique régulière contribue à rendre le cœur plus efficace et plus résistant sur le long terme.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le cœur, une pompe infatigable au service de tout le corps');

-- Sport (nouveau domaine)

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Les Jeux olympiques antiques, l''origine d''une tradition sportive vieille de presque 3000 ans',
  'Sport',
  'Comment une compétition religieuse organisée en l''honneur de Zeus est devenue l''ancêtre des Jeux olympiques modernes.',
  'Les Jeux olympiques antiques se déroulaient tous les quatre ans à Olympie, en Grèce, en l''honneur du dieu Zeus, et auraient été organisés pour la première fois en 776 avant notre ère selon la tradition. Ils constituaient l''un des événements les plus importants du monde grec antique, rassemblant des athlètes venus de nombreuses cités, parfois rivales ou même en guerre les unes contre les autres.

Pour permettre aux athlètes et aux spectateurs de voyager en sécurité jusqu''à Olympie, une "trêve olympique" était proclamée avant chaque édition des Jeux, suspendant temporairement les conflits armés entre les cités grecques participantes — un principe qui a d''ailleurs directement inspiré la trêve olympique symbolique des Jeux modernes aujourd''hui.

Les épreuves antiques comprenaient notamment la course à pied, la lutte, le lancer de disque et de javelot, le saut en longueur, ou des courses de chars, réunies dans une épreuve combinée appelée le pentathlon. Contrairement aux Jeux modernes, seuls les hommes grecs libres pouvaient participer, souvent entièrement nus selon la tradition, et les femmes mariées n''étaient même pas autorisées à assister aux compétitions.

Les Jeux antiques ont perduré pendant près de 12 siècles, jusqu''à leur interdiction en 393 de notre ère par l''empereur romain chrétien Théodose Ier, qui jugeait cette tradition trop liée aux cultes païens. Il faudra attendre 1896, soit plus de 1500 ans plus tard, pour que le baron français Pierre de Coubertin fasse renaître les Jeux olympiques sous une forme moderne, à Athènes.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Les Jeux olympiques antiques, l''origine d''une tradition sportive vieille de presque 3000 ans');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''histoire du football, du jeu de rue anglais au sport le plus populaire au monde',
  'Sport',
  'Comment des règles fixées dans un pub londonien en 1863 ont donné naissance au sport le plus regardé de la planète.',
  'Des jeux impliquant de donner des coups de pied dans une balle existent dans de nombreuses cultures depuis l''Antiquité, mais le football tel qu''on le connaît aujourd''hui trouve ses règles modernes en Angleterre, au XIXe siècle, dans les collèges et universités britanniques, où chaque établissement appliquait initialement ses propres règles, parfois très différentes les unes des autres.

En 1863, des représentants de plusieurs clubs anglais se réunissent à Londres pour fonder la Football Association et fixer un règlement commun, en particulier l''interdiction d''utiliser les mains pour jouer le ballon — une règle qui distingue définitivement le football de sa variante "rugby". Cette codification marque la naissance officielle du football moderne.

Le football s''est ensuite diffusé rapidement à travers le monde, porté notamment par les marins, les ouvriers et les étudiants britanniques qui voyageaient à l''étranger, trouvant un écho particulièrement fort en Amérique du Sud et dans toute l''Europe.

La Coupe du monde de football, créée en 1930 à l''initiative de la FIFA, est aujourd''hui l''événement sportif le plus suivi au monde, rassemblant devant les écrans plusieurs milliards de téléspectateurs cumulés sur toute sa durée — un succès qui a fait du football, à l''origine un simple jeu de rue britannique codifié dans un pub londonien, le sport le plus pratiqué et le plus populaire de la planète.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''histoire du football, du jeu de rue anglais au sport le plus populaire au monde');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Les records du corps humain en sport, aux limites de la performance physique',
  'Sport',
  'Pourquoi les records sportifs progressent de moins en moins vite, à mesure que le corps humain approche de ses limites physiologiques.',
  'Les records sportifs reposent sur une combinaison complexe de facteurs physiologiques : la capacité des muscles à se contracter rapidement et puissamment, l''efficacité du système cardiovasculaire à apporter de l''oxygène aux muscles en effort, et la capacité du corps à évacuer la chaleur produite par l''effort intense. Un sprinteur a surtout besoin de puissance musculaire explosive sur quelques secondes, tandis qu''un marathonien dépend avant tout de son endurance cardiovasculaire sur plusieurs heures.

Le record du monde du 100 mètres, détenu depuis 2009 par le Jamaïcain Usain Bolt en 9,58 secondes, illustre les limites physiques extrêmes de la vitesse humaine : à sa vitesse de pointe, il dépassait les 44 km/h, un rythme que même des athlètes très entraînés peinent à approcher, les derniers progrès du record se comptant aujourd''hui en centièmes de seconde plutôt qu''en secondes entières comme au début du XXe siècle.

Dans les sports d''endurance comme le marathon, la progression des records s''explique à la fois par de meilleures méthodes d''entraînement, une nutrition sportive plus précise, et des équipements plus performants (comme certaines chaussures à plaque de carbone), non sans susciter des débats sur l''équité de la compétition face à ces innovations technologiques.

Les scientifiques du sport s''accordent largement sur le fait que le corps humain approche, dans de nombreuses disciplines, d''une limite physiologique difficilement dépassable sans modification artificielle ou avancée technologique majeure des équipements — ce qui explique pourquoi les records progressent aujourd''hui de façon beaucoup plus marginale qu''au cours du XXe siècle.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Les records du corps humain en sport, aux limites de la performance physique');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le marathon, une course née d''une légende grecque',
  'Sport',
  'Pourquoi la distance mythique de 42,195 kilomètres doit son origine à un messager grec... et à un détail organisationnel bien plus tardif.',
  'Le marathon tire son nom d''un épisode légendaire de l''Antiquité grecque : selon la tradition, un messager nommé Phidippidès aurait couru d''une traite depuis la plaine de Marathon jusqu''à Athènes, soit une quarantaine de kilomètres, pour annoncer la victoire grecque sur les Perses en 490 avant notre ère, avant de s''effondrer et de mourir d''épuisement juste après avoir délivré son message.

Lorsque les Jeux olympiques modernes sont relancés en 1896 à Athènes (voir la leçon sur les Jeux antiques), les organisateurs décident de créer une épreuve inédite en hommage à cette légende : une course d''environ 40 kilomètres reliant Marathon à Athènes, remportée lors de cette première édition par un coureur grec, Spyrídon Loúis, devenu immédiatement un héros national.

La distance exacte de 42,195 kilomètres, universellement utilisée aujourd''hui, n''a toutefois été fixée qu''en 1908, lors des Jeux olympiques de Londres, pour des raisons bien plus pratiques que symboliques : le parcours avait été allongé afin que la ligne d''arrivée se trouve exactement devant la loge royale du stade, permettant à la famille royale britannique d''assister confortablement à l''arrivée de la course.

Depuis, le marathon s''est largement démocratisé bien au-delà du sport de haut niveau : de grandes courses urbaines comme celles de New York, Boston ou Paris rassemblent aujourd''hui des dizaines de milliers de coureurs amateurs chaque année, faisant de cette distance autrefois réservée à une poignée d''athlètes d''élite l''un des défis sportifs personnels les plus recherchés par le grand public.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le marathon, une course née d''une légende grecque');
