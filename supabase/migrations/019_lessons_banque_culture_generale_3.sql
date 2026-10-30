-- Troisième lot de la banque de culture générale (voir
-- 017_lessons_banque_culture_generale.sql pour le contexte complet) :
-- - 5 leçons sur la philosophie et ses grands penseurs (domaine déjà
--   suggéré : 'Philosophie') ;
-- - 5 leçons "profil de pays" (capitale, gastronomie, paysages), nouveau
--   domaine 'Pays et cultures du monde' (ajouté à DOMAIN_SUGGESTIONS,
--   lib/lessons.ts) ;
-- - 2 leçons de plus sur chacun des 9 thèmes déjà amorcés par 017/018
--   (astronomie, littérature, arts, histoire, géographie, mythologie,
--   physique/chimie, biologie/évolution, cinéma).
-- Même format et même statut 'a_verifier' que les lots précédents, pour
-- les mêmes raisons (pas d'accès réseau sortant depuis cet environnement
-- pour vérifier les faits au moment de l'écriture).
--
-- Idempotent comme les migrations précédentes : chaque insert est gardé
-- par un "where not exists" sur le titre.

-- Philosophie

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Socrate et l''art de questionner pour faire naître la pensée',
  'Philosophie',
  'Comment un philosophe qui n''a jamais rien écrit est devenu l''un des penseurs les plus influents de l''histoire.',
  'Socrate (470-399 avant notre ère) est un philosophe grec considéré comme l''un des fondateurs de la philosophie occidentale, bien qu''il n''ait laissé aucun écrit : tout ce que l''on sait de sa pensée nous vient des textes de ses élèves, en particulier Platon, qui l''a mis en scène dans de nombreux dialogues.

Sa méthode, aujourd''hui appelée "méthode socratique" ou maïeutique (du grec désignant l''art de la sage-femme), consiste à questionner sans relâche son interlocuteur sur ses propres certitudes, jusqu''à lui faire découvrir par lui-même les contradictions ou les limites de ce qu''il croyait savoir. Socrate ne prétendait pas transmettre un savoir tout fait, mais "accoucher" les esprits de vérités qu''ils portaient déjà en eux sans le savoir.

Cette démarche lui a valu autant d''admirateurs que d''ennemis : en remettant sans cesse en question les certitudes des puissants et des notables d''Athènes, il a fini accusé de corrompre la jeunesse et de ne pas respecter les dieux de la cité. Condamné à mort en 399 avant notre ère, il aurait pu s''exiler pour y échapper, mais a choisi de respecter la décision de la justice athénienne et de boire la ciguë, le poison utilisé pour l''exécution.

Sa célèbre phrase "Je sais que je ne sais rien" résume bien sa posture philosophique : plutôt qu''une prétention au savoir, c''est la reconnaissance honnête de l''ignorance comme point de départ nécessaire à toute recherche sincère de la vérité — une idée qui continue d''inspirer la pensée critique aujourd''hui.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Socrate et l''art de questionner pour faire naître la pensée');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Platon et le mythe de la caverne',
  'Philosophie',
  'Une allégorie vieille de 2400 ans sur la différence entre les apparences et la réalité.',
  'Platon (428-348 avant notre ère) est un philosophe grec, élève de Socrate, qui a fondé l''Académie à Athènes, l''une des premières institutions d''enseignement de la philosophie. Son œuvre la plus connue, "La République", contient l''une des images les plus célèbres de toute l''histoire de la philosophie : le mythe de la caverne.

Dans cette allégorie, des prisonniers vivent enchaînés depuis leur naissance dans une caverne, ne voyant que les ombres projetées sur une paroi par des objets passant devant un feu derrière eux. N''ayant jamais rien connu d''autre, ils prennent ces ombres pour la réalité tout entière.

Platon imagine alors qu''un prisonnier parvient à se libérer et à sortir de la caverne : d''abord aveuglé par la lumière du soleil, il découvre progressivement le monde réel, bien plus riche que les simples ombres qu''il prenait auparavant pour la vérité. S''il retourne ensuite dans la caverne pour informer les autres, ceux-ci refusent de le croire, persuadés que leurs ombres sont la seule réalité possible.

Pour Platon, cette histoire illustre sa théorie des Idées : le monde que nous percevons avec nos sens (les "ombres") ne serait qu''un reflet imparfait d''un monde supérieur de vérités parfaites et immuables (les "Idées"), auquel seule la réflexion philosophique permettrait d''accéder. Cette image continue d''être utilisée aujourd''hui pour parler, plus largement, de la difficulté à remettre en question ses certitudes ou les illusions collectives.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Platon et le mythe de la caverne');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'René Descartes et le doute méthodique',
  'Philosophie',
  'Comment douter de tout, méthodiquement, pour trouver une vérité sur laquelle tout reconstruire.',
  'René Descartes (1596-1650) est un philosophe et mathématicien français, souvent considéré comme l''un des fondateurs de la philosophie moderne. Il cherche, dans son œuvre, une méthode permettant d''atteindre des connaissances parfaitement certaines, à une époque où de nombreuses idées héritées de l''Antiquité et du Moyen Âge commençaient à être remises en question par les débuts de la science moderne.

Sa méthode, exposée notamment dans le "Discours de la méthode" (1637), consiste à douter systématiquement de tout ce qui peut être mis en doute, y compris ce que nos sens nous font percevoir (qui peuvent nous tromper) ou même les vérités mathématiques les plus simples, pour ne garder que ce qui résiste absolument à ce doute radical.

En poursuivant ce raisonnement jusqu''au bout, Descartes identifie une chose dont on ne peut absolument pas douter : le fait même de douter prouve qu''il existe une pensée en train de douter, et donc un être pensant. C''est l''origine de sa formule la plus célèbre : "Je pense, donc je suis" (Cogito, ergo sum, en latin), qui lui sert de fondation certaine pour reconstruire ensuite le reste de sa connaissance.

Descartes est aussi connu pour sa distinction entre le corps, matériel et mesurable, et l''esprit, immatériel et pensant — une séparation appelée le "dualisme cartésien", qui a profondément influencé la philosophie et, plus largement, la façon dont la pensée occidentale a longtemps conçu la relation entre le corps et l''esprit.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'René Descartes et le doute méthodique');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Friedrich Nietzsche et la critique des vérités absolues',
  'Philosophie',
  'Un philosophe qui a bousculé les certitudes morales et religieuses de son époque, souvent mal compris depuis.',
  'Friedrich Nietzsche (1844-1900) est un philosophe allemand dont la pensée, souvent provocatrice et exprimée dans un style littéraire très personnel, a profondément marqué la philosophie des XXe et XXIe siècles, bien qu''elle ait aussi donné lieu à de nombreuses déformations et récupérations, notamment par les nazis après sa mort, alors qu''il avait lui-même critiqué le nationalisme et l''antisémitisme de son époque.

Sa phrase la plus célèbre, "Dieu est mort", ne constitue pas une déclaration d''athéisme triomphant, mais plutôt un constat inquiet : selon Nietzsche, les sociétés occidentales modernes ont perdu la croyance sincère dans les fondements religieux qui donnaient autrefois un sens et des valeurs morales à l''existence, sans avoir encore trouvé de quoi les remplacer — une situation qu''il appelle le "nihilisme".

Face à ce vide, Nietzsche appelle à une transformation radicale : plutôt que de subir passivement cette perte de sens, l''être humain devrait créer lui-même ses propres valeurs, à partir d''un élan qu''il nomme la "volonté de puissance" — non pas une simple soif de domination sur les autres, mais une force créatrice et affirmative qui pousse à se dépasser soi-même.

Il développe aussi l''idée du "surhumain" (Übermensch), une figure capable d''assumer pleinement cette liberté de créer ses propres valeurs sans se reposer sur des vérités toutes faites, et celle de "l''éternel retour", l''idée de vivre chaque instant comme si on devait le revivre indéfiniment — une manière, pour lui, de prendre pleinement la mesure et la responsabilité de sa propre existence.',
  'intermediaire', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Friedrich Nietzsche et la critique des vérités absolues');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Confucius et l''art de bien vivre ensemble',
  'Philosophie',
  'La pensée chinoise qui a façonné, pendant plus de deux mille ans, les rapports entre les individus et la société.',
  'Confucius (551-479 avant notre ère) est un penseur chinois dont l''enseignement, appelé confucianisme, a profondément marqué la civilisation chinoise ainsi que plusieurs autres pays d''Asie de l''Est, comme la Corée, le Japon ou le Vietnam, pendant plus de deux mille ans. Contrairement à de nombreux philosophes occidentaux, sa pensée s''intéresse moins aux grandes questions métaphysiques qu''à une préoccupation très concrète : comment bien vivre ensemble en société.

Au cœur de sa pensée se trouve l''idée que l''harmonie sociale repose sur le respect de rôles et de relations bien définis — entre parents et enfants, entre dirigeants et sujets, entre amis — chacun devant se conduire avec vertu dans la position qui est la sienne. Il insiste particulièrement sur la piété filiale, le respect dû aux parents et aux ancêtres, comme fondement de toutes les autres relations sociales.

Confucius accorde aussi une grande importance à l''exemple personnel plutôt qu''à la contrainte : pour lui, un bon dirigeant gouverne avant tout par sa propre vertu et son exemple moral, qui inspirent naturellement le respect et l''obéissance, plutôt que par la peur des punitions. Cette idée a durablement influencé la conception du pouvoir et de l''autorité dans plusieurs sociétés d''Asie de l''Est.

Son enseignement nous est parvenu principalement à travers les "Entretiens", un recueil de ses paroles et dialogues rassemblés par ses disciples après sa mort. Longtemps critiqué en Chine au XXe siècle, notamment pendant la révolution culturelle, le confucianisme a depuis connu un regain d''intérêt officiel, étant aujourd''hui de nouveau présenté comme une part importante de l''identité culturelle chinoise.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Confucius et l''art de bien vivre ensemble');

-- Pays et cultures du monde

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La France, entre patrimoine, gastronomie et diversité des paysages',
  'Pays et cultures du monde',
  'Un tour d''horizon de l''Hexagone : sa capitale, sa cuisine et ses paysages très variés pour un seul pays.',
  'La France est un pays d''environ 68 millions d''habitants, dont la capitale, Paris, est aussi l''une des villes les plus visitées au monde, connue pour des monuments comme la tour Eiffel, le Louvre ou Notre-Dame de Paris. Le pays est parfois appelé "l''Hexagone" en raison de la forme géométrique approximative de son territoire métropolitain.

La gastronomie française est mondialement réputée, au point que le "repas gastronomique des Français" est inscrit depuis 2010 au patrimoine culturel immatériel de l''humanité par l''UNESCO. Chaque région y apporte ses spécialités : le fromage et le vin bien sûr, mais aussi la bouillabaisse en Provence, la choucroute en Alsace, les crêpes en Bretagne ou le cassoulet dans le Sud-Ouest.

Le pays présente aussi une grande diversité de paysages sur un territoire somme toute modeste à l''échelle mondiale : les falaises d''Étretat en Normandie, les plages de sable fin de la Côte d''Azur, les volcans d''Auvergne, les sommets enneigés des Alpes et des Pyrénées, ou encore les champs de lavande de Provence, qui attirent chaque été des visiteurs du monde entier.

Avec plus de 90 millions de visiteurs internationaux par an avant la pandémie de Covid-19, la France est régulièrement classée comme la destination touristique la plus visitée au monde, portée à la fois par son patrimoine historique, sa gastronomie et la diversité de ses paysages, du littoral atlantique aux massifs montagneux.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'La France, entre patrimoine, gastronomie et diversité des paysages');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le Japon, entre tradition, modernité et nature spectaculaire',
  'Pays et cultures du monde',
  'Un archipel où se mêlent temples séculaires, gratte-ciels et volcans emblématiques.',
  'Le Japon est un archipel d''Asie de l''Est composé de plus de 6 800 îles, dont les quatre principales (Hokkaido, Honshu, Shikoku et Kyushu) concentrent la quasi-totalité de sa population d''environ 125 millions d''habitants. Sa capitale, Tokyo, est l''agglomération la plus peuplée du monde, avec plus de 37 millions d''habitants dans sa zone urbaine élargie.

La gastronomie japonaise, reconnue elle aussi au patrimoine culturel immatériel de l''UNESCO, est connue dans le monde entier pour des plats comme les sushis, les ramens ou la tempura, mais aussi pour un art culinaire très soigné où la présentation visuelle des plats compte presque autant que leur goût, et où le respect de la saisonnalité des produits reste central.

Le pays se distingue également par des paysages spectaculaires et contrastés : le mont Fuji, volcan emblématique culminant à 3 776 mètres, les forêts de bambous de Kyoto, les sources d''eau chaude naturelles (onsen) nichées dans les montagnes, ou encore les cerisiers en fleurs (sakura) qui, chaque printemps, attirent des foules immenses dans les parcs à travers tout le pays.

Le Japon est aussi connu pour son contraste marqué entre tradition et modernité : des temples bouddhistes et sanctuaires shintoïstes vieux de plusieurs siècles côtoient des métropoles ultramodernes truffées de technologie, et le pays reste régulièrement frappé par des séismes du fait de sa position sur plusieurs plaques tectoniques, ce qui a conduit à des normes de construction antisismiques parmi les plus avancées au monde.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le Japon, entre tradition, modernité et nature spectaculaire');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''Italie, berceau de la Renaissance et de la gastronomie méditerranéenne',
  'Pays et cultures du monde',
  'Un pays en forme de botte, entre art, cuisine emblématique et paysages contrastés du nord au sud.',
  'L''Italie est un pays d''Europe du Sud, facilement reconnaissable sur une carte à sa forme de botte s''avançant dans la mer Méditerranée. Sa capitale, Rome, abrite à elle seule un patrimoine exceptionnel : le Colisée, le Forum romain, et, en plein cœur de la ville, un État indépendant, le Vatican, siège de l''Église catholique.

La gastronomie italienne, l''une des plus connues et appréciées au monde, varie fortement selon les régions : les pâtes et les pizzas, originaires respectivement du nord et de Naples dans le sud, le risotto et la polenta dans le nord, ou encore une grande diversité de fromages (parmesan, mozzarella) et de charcuteries régionales, souvent protégés par des appellations d''origine strictes.

Les paysages italiens sont tout aussi variés : les canaux de Venise, construite sur une lagune, les collines viticoles de Toscane couvertes de vignobles et de cyprès, la côte amalfitaine aux falaises abruptes surplombant la mer, ou encore des volcans actifs comme le Vésuve près de Naples et l''Etna en Sicile, l''un des volcans les plus actifs d''Europe.

L''Italie est aussi considérée comme l''un des berceaux de la Renaissance (voir la leçon dédiée), ce qui lui vaut de posséder, selon l''UNESCO, le plus grand nombre de sites classés au patrimoine mondial de l''humanité de tous les pays du monde — un héritage artistique et architectural exceptionnel concentré sur un territoire relativement restreint.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''Italie, berceau de la Renaissance et de la gastronomie méditerranéenne');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le Brésil, géant d''Amérique du Sud entre forêt, plages et carnaval',
  'Pays et cultures du monde',
  'Le plus grand pays d''Amérique du Sud, entre Amazonie, plages mythiques et culture festive.',
  'Le Brésil est le plus grand pays d''Amérique du Sud et le cinquième plus grand du monde par sa superficie, avec une population d''environ 215 millions d''habitants. Sa capitale est Brasília, une ville entièrement planifiée et construite à partir de 1956 pour devenir capitale en 1960, reconnaissable à son architecture moderniste très particulière — mais la ville la plus connue à l''étranger reste Rio de Janeiro, avec ses plages de Copacabana et d''Ipanema et sa célèbre statue du Christ Rédempteur.

La gastronomie brésilienne mélange des influences portugaises, africaines et indigènes : la feijoada (un ragoût de haricots noirs et de viandes), le churrasco (barbecue brésilien) ou l''açaí, ce petit fruit violet originaire d''Amazonie devenu populaire dans le monde entier, en sont quelques exemples emblématiques.

Une grande partie de la forêt amazonienne (voir la leçon dédiée) se trouve sur le territoire brésilien, mais le pays offre aussi d''autres paysages très différents : les plages interminables du littoral atlantique, les chutes d''Iguaçu, l''une des plus grandes cascades du monde partagée avec l''Argentine, ou encore le Pantanal, la plus grande zone humide tropicale de la planète, riche d''une faune exceptionnelle.

Le Brésil est aussi connu pour son carnaval, en particulier celui de Rio de Janeiro, l''un des plus grands événements festifs du monde, mêlant défilés d''écoles de samba, costumes spectaculaires et plusieurs millions de participants et de spectateurs chaque année dans les rues et les arènes dédiées de la ville.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le Brésil, géant d''Amérique du Sud entre forêt, plages et carnaval');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le Maroc, entre désert, montagnes et médinas colorées',
  'Pays et cultures du monde',
  'Un pays d''Afrique du Nord qui concentre désert, montagnes et côtes sur un territoire restreint.',
  'Le Maroc est un pays d''Afrique du Nord, situé à la pointe nord-ouest du continent, séparé de l''Europe par le détroit de Gibraltar, large d''à peine 14 kilomètres à son point le plus étroit. Sa capitale politique est Rabat, mais sa plus grande ville et son centre économique restent Casablanca, tandis que Marrakech et Fès sont réputées pour leurs médinas historiques classées au patrimoine mondial de l''UNESCO.

La gastronomie marocaine est réputée pour ses plats mijotés longuement et ses épices parfumées : le couscous, plat traditionnel du vendredi, le tajine (à la fois le nom du plat et celui du récipient en terre cuite dans lequel il cuit), ou encore le thé à la menthe, servi en toute occasion comme symbole d''hospitalité.

Le pays présente une diversité de paysages remarquable sur un territoire pourtant restreint : les montagnes de l''Atlas, dont certains sommets dépassent 4 000 mètres et se couvrent de neige en hiver, les dunes du désert du Sahara au sud et à l''est, et de longues côtes bordées à la fois par l''océan Atlantique et la mer Méditerranée.

Les médinas marocaines, ces quartiers anciens aux ruelles étroites et labyrinthiques entourées de remparts, comme celle de Marrakech ou de Fès (l''une des plus grandes zones piétonnes du monde), sont un élément central de l''identité urbaine du pays, mêlant souks animés, palais historiques et riads traditionnels aujourd''hui souvent transformés en hébergements touristiques.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le Maroc, entre désert, montagnes et médinas colorées');

-- Astronomie (suite)

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Mars, la planète rouge qui fascine les explorateurs de l''espace',
  'Cosmologie et astronomie',
  'Pourquoi Mars est devenue la cible privilégiée de la recherche de vie extraterrestre et des futurs voyages habités.',
  'Mars est la quatrième planète du système solaire en partant du Soleil, et la planète la plus semblable à la Terre parmi celles du système solaire, bien que son atmosphère soit beaucoup plus fine et sa température moyenne très inférieure (environ -60°C). Sa couleur rougeâtre caractéristique, visible même à l''œil nu depuis la Terre, vient de la présence d''oxyde de fer (une forme de rouille) à sa surface.

Mars possède les deux plus grandes structures géologiques connues du système solaire : Olympus Mons, un volcan éteint d''environ 22 kilomètres de hauteur (soit près de deux fois et demie l''Everest), et Valles Marineris, un système de canyons qui s''étend sur plus de 4 000 kilomètres, bien plus grand que le Grand Canyon américain.

Plusieurs indices suggèrent que de l''eau liquide a coulé à la surface de Mars dans un passé lointain : des lits de rivières asséchées, des minéraux qui ne se forment qu''en présence d''eau, et de la glace d''eau toujours présente sous la surface et aux pôles aujourd''hui. Cette possibilité ancienne d''un environnement plus hospitalier alimente l''intérêt des scientifiques pour une éventuelle trace de vie microbienne passée.

Mars est devenue la destination privilégiée de nombreuses missions spatiales, avec plusieurs rovers (petits véhicules robotisés) actuellement à sa surface, et l''objectif affiché par plusieurs agences spatiales et entreprises privées d''y envoyer un jour des astronautes — un voyage qui, compte tenu des distances et de la durée du trajet (plusieurs mois), reste l''un des plus grands défis techniques de l''exploration spatiale actuelle.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Mars, la planète rouge qui fascine les explorateurs de l''espace');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Jupiter et Saturne, les géantes gazeuses du système solaire',
  'Cosmologie et astronomie',
  'Les deux plus grosses planètes du système solaire n''ont même pas de surface solide sur laquelle se poser.',
  'Jupiter est la plus grosse planète du système solaire : son diamètre est environ 11 fois celui de la Terre, et sa masse est plus importante que celle de toutes les autres planètes du système solaire réunies. Contrairement à la Terre, Jupiter n''a pas de surface solide : c''est une boule de gaz, principalement d''hydrogène et d''hélium, qui devient progressivement plus dense et plus chaude vers son centre.

Sa caractéristique la plus visible est la Grande Tache rouge, une tempête géante en forme de cyclone, plus large que la Terre entière, qui fait rage dans son atmosphère depuis au moins plusieurs siècles d''observation continue. Jupiter possède aussi plus de 90 lunes connues, dont Europe, qui pourrait cacher un océan d''eau liquide sous sa surface glacée, l''un des endroits les plus prometteurs pour chercher une éventuelle vie extraterrestre dans le système solaire.

Saturne, la deuxième plus grosse planète, est surtout connue pour son spectaculaire système d''anneaux, composés de milliards de petits morceaux de glace et de roche, qui s''étendent sur des centaines de milliers de kilomètres mais ne font, par endroits, que quelques dizaines de mètres d''épaisseur. Ces anneaux sont visibles depuis la Terre avec un simple télescope amateur.

Saturne est aussi si légère pour sa taille (sa densité moyenne est inférieure à celle de l''eau) qu''elle flotterait, en théorie, si on pouvait la placer dans un océan suffisamment grand. L''une de ses lunes, Titan, possède une atmosphère épaisse et des lacs de méthane liquide à sa surface, ce qui en fait l''un des mondes les plus étranges et les plus étudiés du système solaire.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Jupiter et Saturne, les géantes gazeuses du système solaire');

-- Littérature (suite)

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Fiodor Dostoïevski et les tourments de l''âme humaine',
  'Littérature',
  'Comment un écrivain russe ancien condamné à mort a exploré, dans ses romans, les zones les plus sombres de la conscience humaine.',
  'Fiodor Dostoïevski (1821-1881) est un romancier russe dont l''œuvre explore avec une intensité rare les tourments psychologiques, moraux et spirituels de ses personnages. Avant de devenir l''un des plus grands écrivains russes, il a été arrêté pour des activités politiques jugées subversives et condamné à mort, avant d''être gracié au tout dernier moment sur l''échafaud et envoyé en exil au bagne en Sibérie.

Cette expérience du bagne et de la peur de la mort a profondément marqué son œuvre, visible dans des romans comme "Crime et Châtiment" (1866), qui suit un jeune étudiant pauvre après qu''il a commis un meurtre, rongé par la culpabilité et la peur d''être découvert, ou "Les Frères Karamazov" (1880), qui met en scène trois frères aux tempéraments opposés et une réflexion profonde sur la foi, le doute et la morale.

Dostoïevski s''intéresse particulièrement aux personnages en crise, tiraillés entre le bien et le mal, la raison et la passion, la foi et le doute — une exploration psychologique très en avance sur son époque, qui a souvent été rapprochée, après coup, des découvertes ultérieures de la psychanalyse sur l''inconscient et les conflits intérieurs.

Son influence dépasse largement la littérature russe : des philosophes comme Nietzsche, et de nombreux écrivains du XXe siècle, ont reconnu une dette envers son exploration sans concession des contradictions et des souffrances intérieures de l''être humain, qui continue de résonner avec des lecteurs de toutes les cultures.',
  'intermediaire', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Fiodor Dostoïevski et les tourments de l''âme humaine');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Gabriel García Márquez et le réalisme magique',
  'Littérature',
  'Comment un écrivain colombien a mêlé la réalité et le merveilleux pour raconter l''Amérique latine.',
  'Gabriel García Márquez (1927-2014) est un écrivain colombien, Prix Nobel de littérature en 1982, surtout connu pour son roman "Cent ans de solitude" (1967), qui raconte sur plusieurs générations l''histoire de la famille Buendía dans le village imaginaire de Macondo, en Amérique latine.

Son style est devenu emblématique d''un courant littéraire appelé le "réalisme magique", qui mêle, sans les opposer, des événements tout à fait ordinaires et des éléments surnaturels ou extraordinaires racontés avec le même ton naturel et détaché — un personnage qui vit plus de cent ans, des pluies qui durent quatre années, ou des fantômes qui discutent tranquillement avec les vivants, tout cela traité comme allant simplement de soi.

Cette approche permettait à García Márquez d''évoquer, à travers la fiction, l''histoire tumultueuse de la Colombie et de l''Amérique latine dans son ensemble — guerres civiles, dictatures, exploitation économique par des puissances étrangères — tout en conservant une dimension poétique et universelle qui a séduit des lecteurs bien au-delà du continent latino-américain.

"Cent ans de solitude" s''est vendu à plus de 50 millions d''exemplaires dans le monde et a profondément influencé toute une génération d''écrivains, en Amérique latine et ailleurs, qui ont à leur tour exploré ce mélange du quotidien et du merveilleux pour raconter leurs propres cultures et leur propre histoire.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Gabriel García Márquez et le réalisme magique');

-- Arts (suite)

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Vincent van Gogh, la couleur et la tourmente',
  'Arts, peinture, architecture et musique',
  'Comment un peintre quasiment invendu de son vivant est devenu l''un des artistes les plus célèbres et les plus chers du monde.',
  'Vincent van Gogh (1853-1890) est un peintre néerlandais dont l''œuvre, aujourd''hui l''une des plus célèbres et des plus reproduites au monde, n''a presque pas été reconnue de son vivant : il n''aurait vendu qu''un seul tableau avant sa mort, et comptait presque uniquement sur le soutien financier de son frère Théo pour vivre et continuer à peindre.

Van Gogh développe un style très personnel, avec des couleurs vives et contrastées et des coups de pinceau épais et visibles qui donnent à ses toiles une impression de mouvement et d''intensité émotionnelle, visibles dans des œuvres aujourd''hui mondialement connues comme "La Nuit étoilée" (1889) ou "Les Tournesols", une série de tableaux représentant ces fleurs dans des teintes de jaune éclatant.

Sa vie a aussi été marquée par une grave instabilité mentale, aujourd''hui généralement associée à des troubles psychiatriques (les hypothèses des historiens varient), qui l''a conduit à se couper lui-même une partie de l''oreille en 1888 et à se faire interner volontairement dans un asile. Il s''est donné la mort en 1890, à seulement 37 ans, après une décennie seulement de carrière artistique intensive.

La reconnaissance de son talent n''est venue qu''après sa mort, portée notamment par sa belle-sœur qui a fait connaître son œuvre et sa correspondance. Aujourd''hui, ses tableaux comptent parmi les plus chers jamais vendus aux enchères, un contraste saisissant avec la pauvreté et l''incompréhension qu''il a connues de son vivant.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Vincent van Gogh, la couleur et la tourmente');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Antoni Gaudí et l''architecture organique de Barcelone',
  'Arts, peinture, architecture et musique',
  'Comment un architecte catalan a imaginé des bâtiments qui semblent sortis d''un rêve, inspirés par les formes de la nature.',
  'Antoni Gaudí (1852-1926) est un architecte catalan dont l''œuvre a profondément transformé le visage de la ville de Barcelone, en Espagne. Son style, souvent qualifié d''"organique" ou d''inspiré du modernisme catalan, s''écarte radicalement des lignes droites et des formes géométriques classiques de l''architecture traditionnelle.

Gaudí s''inspirait directement des formes de la nature — courbes, spirales, structures d''os ou de vagues — pour concevoir des bâtiments aux allures presque vivantes, comme la Casa Batlló, dont la façade ondulante évoque des écailles ou des vagues, ou le parc Güell, avec ses bancs et structures colorées recouvertes de mosaïques en céramique (une technique appelée trencadís).

Son œuvre la plus emblématique reste la basilique de la Sagrada Família, dont la construction a débuté en 1882 et n''est toujours pas officiellement terminée aujourd''hui, plus d''un siècle plus tard. Gaudí lui-même savait qu''il ne la verrait jamais achevée, déclarant que son client (Dieu, selon sa propre foi) "n''était pas pressé" — la fin des travaux est aujourd''hui espérée pour les prochaines années.

Gaudí est mort percuté par un tramway en 1926, sans jamais voir la Sagrada Família terminée. Son travail est aujourd''hui protégé par l''UNESCO (plusieurs de ses œuvres sont classées au patrimoine mondial), et Barcelone reste une destination touristique majeure en grande partie grâce à son héritage architectural unique.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Antoni Gaudí et l''architecture organique de Barcelone');

-- Histoire mondiale (suite)

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La Seconde Guerre mondiale, le conflit le plus meurtrier de l''histoire',
  'Histoire mondiale',
  'Comment un conflit né en Europe est devenu la guerre la plus destructrice jamais connue, à l''échelle de la planète entière.',
  'La Seconde Guerre mondiale (1939-1945) est le conflit le plus meurtrier de l''histoire, avec un bilan estimé entre 50 et 80 millions de morts à travers le monde, militaires et civils confondus. Elle débute officiellement le 1er septembre 1939, quand l''Allemagne nazie, dirigée par Adolf Hitler, envahit la Pologne, entraînant la déclaration de guerre du Royaume-Uni et de la France.

Le conflit opposait principalement les forces de l''Axe (l''Allemagne nazie, l''Italie fasciste et le Japon) aux forces Alliées (notamment le Royaume-Uni, l''Union soviétique à partir de 1941, et les États-Unis à partir de la fin de cette même année), et s''est étendu sur presque tous les continents, de l''Europe à l''Afrique du Nord, en passant par l''Asie et le Pacifique.

Ce conflit a aussi été marqué par des atrocités d''une ampleur inédite, en particulier la Shoah, l''extermination systématique d''environ six millions de Juifs d''Europe par le régime nazi dans des camps de concentration et d''extermination, ainsi que de nombreuses autres victimes de persécutions (Roms, personnes handicapées, minorités politiques et sexuelles).

La guerre se termine en Europe le 8 mai 1945 avec la capitulation de l''Allemagne, puis dans le Pacifique en août 1945, après les bombardements atomiques américains sur les villes japonaises d''Hiroshima et de Nagasaki, les seules utilisations de l''arme nucléaire lors d''un conflit à ce jour. Ce conflit a ensuite directement conduit à la création de l''Organisation des Nations unies (ONU) en 1945, dans l''espoir d''éviter qu''une telle catastrophe ne se reproduise.',
  'intermediaire', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'La Seconde Guerre mondiale, le conflit le plus meurtrier de l''histoire');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Christophe Colomb et les grandes découvertes',
  'Histoire mondiale',
  'Comment un navigateur cherchant une route vers l''Asie a, sans le savoir, atteint un continent inconnu des Européens.',
  'Christophe Colomb (1451-1506) est un navigateur génois qui, financé par les rois d''Espagne, entreprend en 1492 un voyage vers l''ouest à travers l''océan Atlantique dans l''espoir de trouver une nouvelle route maritime vers l''Asie, alors source précieuse d''épices et de richesses pour le commerce européen.

Le 12 octobre 1492, après plusieurs semaines de navigation, son expédition atteint une île des Caraïbes. Colomb, convaincu d''avoir atteint les abords de l''Asie, ne réalisera jamais de son vivant qu''il venait en réalité de découvrir, du point de vue européen, un continent totalement inconnu jusque-là : l''Amérique, déjà habitée depuis des millénaires par de nombreux peuples autochtones.

Ce voyage marque le début d''une période appelée les "grandes découvertes", durant laquelle plusieurs puissances européennes (Espagne, Portugal, puis plus tard la France, l''Angleterre et les Pays-Bas) explorent et colonisent de vastes territoires à travers le monde, bouleversant durablement les équilibres politiques, économiques et démographiques de la planète.

Ces expéditions ont aussi eu des conséquences dramatiques pour les populations autochtones d''Amérique, décimées en grande partie par des maladies apportées d''Europe (contre lesquelles elles n''avaient aucune immunité), ainsi que par les violences de la colonisation et, plus tard, par la traite des esclaves africains organisée pour remplacer la main-d''œuvre locale décimée. L''héritage de Christophe Colomb reste aujourd''hui débattu et réévalué à la lumière de ces conséquences.',
  'intermediaire', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Christophe Colomb et les grandes découvertes');

-- Géographie et géopolitique (suite)

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''Antarctique, le continent le plus froid et le plus isolé de la planète',
  'Géographie et géopolitique',
  'Un continent presque entièrement recouvert de glace, sans aucune population permanente, mais essentiel à l''équilibre du climat mondial.',
  'L''Antarctique est le continent le plus méridional de la planète, situé autour du pôle Sud, et le cinquième plus grand continent par sa superficie. Il est recouvert à environ 98 % par une épaisse calotte glaciaire, qui contient environ 70 % de toute l''eau douce de la planète — si elle venait à fondre entièrement, le niveau des océans s''élèverait de près de 60 mètres.

C''est aussi le continent le plus froid jamais enregistré sur Terre, avec des températures qui peuvent descendre sous les -80°C en hiver dans certaines stations scientifiques. Contrairement à tous les autres continents, l''Antarctique n''a aucune population permanente : seules quelques milliers de personnes y vivent temporairement, principalement des scientifiques répartis dans des stations de recherche internationales.

Le continent n''appartient à aucun pays : il est régi depuis 1959 par le traité sur l''Antarctique, signé par de nombreuses nations, qui en fait une zone réservée exclusivement à la recherche scientifique pacifique, interdit toute exploitation militaire ou minière, et gèle les éventuelles revendications territoriales de plusieurs pays sur certaines portions du continent.

L''Antarctique joue aussi un rôle essentiel dans la régulation du climat mondial : ses glaces réfléchissent une grande partie de l''énergie solaire vers l''espace, et sa fonte accélérée, observée depuis plusieurs décennies en lien avec le réchauffement climatique, est aujourd''hui l''une des principales sources d''inquiétude des scientifiques quant à la hausse future du niveau des mers.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''Antarctique, le continent le plus froid et le plus isolé de la planète');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La Grande Barrière de corail, la plus grande structure vivante du monde',
  'Géographie et géopolitique',
  'Un écosystème sous-marin visible depuis l''espace, aujourd''hui menacé par le réchauffement des océans.',
  'La Grande Barrière de corail, au large des côtes du nord-est de l''Australie, est le plus grand système corallien du monde, avec une superficie d''environ 344 000 kilomètres carrés — assez grande pour être visible depuis l''espace. Elle est composée de plus de 2 900 récifs individuels et de centaines d''îles, et s''étend sur environ 2 300 kilomètres de long.

Les récifs coralliens sont en réalité constitués de minuscules animaux appelés polypes, qui vivent en colonies et sécrètent un squelette calcaire au fil des générations, formant progressivement ces structures massives sur plusieurs milliers d''années. Cet écosystème abrite une biodiversité exceptionnelle : des milliers d''espèces de poissons, de mollusques, mais aussi des tortues de mer, des requins et des dauphins.

Les coraux vivent en symbiose avec de minuscules algues, les zooxanthelles, qui leur fournissent une grande partie de leur énergie grâce à la photosynthèse et leur donnent leurs couleurs éclatantes. Quand l''eau devient trop chaude, les coraux expulsent ces algues par stress, un phénomène appelé "blanchissement corallien" qui, s''il se prolonge, peut entraîner la mort du corail.

La Grande Barrière de corail a déjà connu plusieurs épisodes massifs de blanchissement au cours des dernières décennies, directement liés au réchauffement des océans provoqué par le changement climatique. Sa préservation est devenue un symbole international des enjeux liés au réchauffement climatique sur les écosystèmes marins les plus riches et les plus fragiles de la planète.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'La Grande Barrière de corail, la plus grande structure vivante du monde');

-- Mythologies et civilisations (suite)

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le Minotaure et le labyrinthe de Crète',
  'Mythologies et civilisations',
  'Comment un monstre mi-homme mi-taureau, enfermé dans un labyrinthe, a inspiré l''un des mythes grecs les plus célèbres.',
  'Dans la mythologie grecque, le Minotaure est une créature mi-homme, mi-taureau, née d''une union contre nature entre la reine Pasiphaé de Crète et un taureau, elle-même provoquée par une malédiction du dieu Poséidon pour punir le roi Minos, mari de Pasiphaé, qui avait refusé de lui sacrifier un magnifique taureau comme promis.

Honteux de cette naissance, le roi Minos fait construire par l''architecte Dédale un gigantesque labyrinthe souterrain, si complexe que personne ne peut en trouver la sortie, pour y enfermer le Minotaure. Chaque année (ou tous les neuf ans selon les versions), des jeunes gens d''Athènes, livrés en tribut à la Crète, sont jetés dans le labyrinthe pour y être dévorés par la créature.

Le héros athénien Thésée se porte volontaire pour affronter le Minotaure. Avec l''aide d''Ariane, la fille du roi Minos tombée amoureuse de lui, qui lui donne un fil à dérouler en entrant dans le labyrinthe, Thésée parvient à tuer le Minotaure puis à retrouver son chemin vers la sortie grâce à ce fil — c''est l''origine de l''expression "le fil d''Ariane", encore utilisée aujourd''hui pour désigner un repère qui permet de ne pas se perdre.

Ce mythe a été interprété de multiples façons par les historiens et archéologues : certains y voient un écho lointain de la puissante civilisation minoenne de Crète, dont le palais de Cnossos, avec ses nombreuses salles et couloirs, pourrait avoir inspiré l''image du labyrinthe, et dont les fresques représentent justement des scènes de jeux ou de rituels impliquant des taureaux.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le Minotaure et le labyrinthe de Crète');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Les mythes celtes, entre druides, fées et autre monde',
  'Mythologies et civilisations',
  'Les croyances des peuples celtes d''Europe de l''Ouest, avant leur rencontre avec Rome et le christianisme.',
  'Les peuples celtes occupaient, avant et pendant l''époque romaine, une grande partie de l''Europe de l''Ouest, notamment les actuelles France (la Gaule), Irlande, Écosse, Pays de Galles et Bretagne. Leur mythologie, transmise principalement par voie orale, ne nous est connue aujourd''hui que de façon fragmentaire, en grande partie grâce à des textes irlandais rédigés bien plus tard, après la christianisation.

Les druides occupaient une place centrale dans la société celte : à la fois prêtres, juges, conseillers et détenteurs du savoir, ils assuraient la transmission orale des traditions et des lois, et jouaient aussi un rôle central dans les pratiques religieuses, comme les sacrifices ou les rituels liés aux cycles de la nature.

La mythologie celte accorde une place importante à un "Autre Monde", un royaume parallèle peuplé de divinités et de créatures surnaturelles, souvent accessible par des lieux particuliers comme des cercles de pierres, des sources ou des tumulus. On y retrouve des figures encore connues aujourd''hui, comme les fées, ou des divinités telles que Lug, associé à la lumière et à de nombreux savoir-faire techniques.

Une grande partie de ces croyances a été transformée ou absorbée après la conquête romaine puis la christianisation de l''Europe de l''Ouest, certaines fêtes et pratiques celtes ayant été réinterprétées sous une forme chrétienne. Des traces en subsistent pourtant aujourd''hui, par exemple dans la fête de Halloween, directement héritée de Samain, une fête celte marquant le passage à la nouvelle année et à la saison sombre.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Les mythes celtes, entre druides, fées et autre monde');

-- Physique et chimie (suite)

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''atome, la brique invisible de toute la matière',
  'Physique et chimie',
  'Comment un objet des milliards de fois plus petit qu''un grain de sable explique toute la matière qui nous entoure.',
  'Un atome est la plus petite unité de matière qui conserve les propriétés chimiques d''un élément donné, comme l''oxygène, le carbone ou le fer. Il est si petit qu''il faudrait aligner plusieurs millions d''atomes côte à côte pour couvrir l''épaisseur d''un cheveu humain, et pourtant, tout ce qui nous entoure — l''air, l''eau, notre propre corps — est entièrement composé d''atomes.

Un atome est lui-même composé de particules encore plus petites : un noyau central, constitué de protons (chargés positivement) et de neutrons (sans charge électrique), autour duquel gravitent des électrons, chargés négativement, à une distance relativement immense comparée à la taille du noyau — si un atome avait la taille d''un stade de football, son noyau serait à peu près de la taille d''un petit pois placé au centre.

Le nombre de protons dans le noyau d''un atome détermine de quel élément chimique il s''agit (un atome avec un proton est de l''hydrogène, avec six protons c''est du carbone, etc.), et c''est précisément ce nombre qui sert à organiser le tableau périodique des éléments (voir la leçon dédiée). Les électrons, de leur côté, sont responsables des liaisons chimiques qui permettent aux atomes de s''assembler entre eux pour former des molécules.

Pendant longtemps, les scientifiques ont cru l''atome indivisible (son nom vient d''ailleurs du grec signifiant "qu''on ne peut pas couper"), avant de découvrir au début du XXe siècle qu''il était lui-même composé de particules plus petites, puis que ces particules (notamment les protons et les neutrons) étaient elles-mêmes composées d''éléments encore plus fondamentaux, les quarks — un voyage vers l''infiniment petit qui continue aujourd''hui grâce à des équipements comme le grand collisionneur de hadrons du CERN.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''atome, la brique invisible de toute la matière');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''électricité, une force invisible devenue indispensable au quotidien',
  'Physique et chimie',
  'Comment un phénomène observé depuis l''Antiquité est devenu, en quelques siècles, la base de toute la technologie moderne.',
  'L''électricité est un phénomène physique lié au mouvement de particules chargées, en particulier les électrons, qui existe naturellement dans la nature depuis toujours (l''éclair en est l''exemple le plus spectaculaire) mais que l''humanité n''a appris à comprendre et à maîtriser que progressivement, surtout à partir du XVIIIe et du XIXe siècle.

Des scientifiques comme Benjamin Franklin (qui a étudié la foudre avec son célèbre cerf-volant), Alessandro Volta (inventeur de la première pile électrique en 1800) ou Michael Faraday (qui a découvert comment produire de l''électricité à partir du mouvement, principe à la base des centrales électriques modernes) ont posé les fondations qui ont permis, un peu plus tard, l''invention de l''ampoule électrique, puis l''électrification progressive des foyers et des villes.

Le courant électrique circule dans certains matériaux, appelés conducteurs (comme le cuivre ou l''argent), grâce à leurs électrons qui peuvent se déplacer relativement librement, contrairement aux matériaux isolants (comme le plastique ou le verre), qui empêchent ce mouvement — une distinction essentielle qui permet, par exemple, de faire circuler le courant dans un câble tout en évitant qu''il ne blesse quelqu''un au contact de sa gaine protectrice.

Aujourd''hui, l''électricité est devenue indispensable au fonctionnement de pratiquement toutes nos sociétés modernes : éclairage, chauffage, communication, informatique, transports... La façon de la produire (centrales à charbon, nucléaires, barrages hydroélectriques, panneaux solaires, éoliennes) reste l''un des enjeux les plus importants de la transition énergétique actuelle face au changement climatique.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''électricité, une force invisible devenue indispensable au quotidien');

-- Biologie et évolution (suite)

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le cerveau humain, l''organe le plus complexe connu de l''Univers',
  'Biologie et évolution',
  'Comment environ 1,5 kilo de matière grise permet de penser, ressentir et contrôler tout notre corps.',
  'Le cerveau humain est un organe d''environ 1,3 à 1,5 kilogramme, composé d''environ 86 milliards de neurones, des cellules spécialisées qui communiquent entre elles par des signaux électriques et chimiques. Chaque neurone peut être connecté à des milliers d''autres, formant un réseau d''une complexité telle qu''il est souvent décrit comme l''objet le plus complexe connu dans l''Univers observable.

Le cerveau est divisé en plusieurs grandes régions aux fonctions différentes : le cortex cérébral, la partie la plus développée chez l''être humain par rapport aux autres espèces, est impliqué dans la pensée consciente, le langage et la prise de décision ; le cervelet coordonne les mouvements et l''équilibre ; et des structures plus profondes, comme l''amygdale et l''hippocampe, sont centrales dans la gestion des émotions et de la mémoire.

Contrairement à une idée longtemps répandue, le cerveau humain reste capable de former de nouvelles connexions entre neurones tout au long de la vie, un phénomène appelé plasticité cérébrale, qui explique notre capacité à apprendre de nouvelles compétences ou à nous adapter après certaines lésions cérébrales, même à l''âge adulte.

Le cerveau ne consomme pourtant qu''environ 20% de l''énergie totale du corps au repos, malgré ne représenter qu''environ 2% de sa masse — une consommation énergétique disproportionnée qui illustre à quel point le fonctionnement de la pensée, bien qu''invisible, reste l''une des activités les plus coûteuses en énergie de tout notre organisme.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le cerveau humain, l''organe le plus complexe connu de l''Univers');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Les abeilles, petites ouvrières indispensables à notre alimentation',
  'Biologie et évolution',
  'Pourquoi la disparition de ces insectes inquiète autant les scientifiques que les agriculteurs.',
  'Les abeilles sont des insectes sociaux qui vivent en colonies organisées autour d''une reine, pondant la quasi-totalité des œufs de la colonie, et de milliers d''ouvrières, qui se chargent de récolter le nectar et le pollen des fleurs, de construire et d''entretenir la ruche, et de nourrir les larves.

En butinant les fleurs pour se nourrir, les abeilles transportent involontairement du pollen d''une fleur à l''autre, ce qui permet la fécondation de nombreuses plantes : ce processus, appelé pollinisation, est essentiel à la reproduction d''environ 75% des espèces de plantes cultivées dans le monde, des fruits (pommes, fraises) aux légumes en passant par certaines céréales.

Les abeilles communiquent entre elles de façon remarquable : une ouvrière qui a trouvé une source de nourriture intéressante peut indiquer sa direction et sa distance approximative aux autres grâce à une sorte de danse en forme de huit, exécutée à l''intérieur de la ruche — un langage gestuel découvert et décrit par le chercheur autrichien Karl von Frisch, qui lui a valu un prix Nobel en 1973.

Depuis plusieurs décennies, les populations d''abeilles déclinent fortement dans de nombreuses régions du monde, en raison de plusieurs facteurs combinés : l''usage de certains pesticides, la destruction de leur habitat naturel, des maladies et parasites, et le changement climatique. Ce déclin inquiète particulièrement les scientifiques et les agriculteurs, en raison du rôle irremplaçable de ces insectes dans la production alimentaire mondiale.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Les abeilles, petites ouvrières indispensables à notre alimentation');

-- Cinéma (suite)

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Charlie Chaplin et l''âge d''or du cinéma muet',
  'Cinéma',
  'Comment un petit homme à la moustache et au chapeau melon est devenu la plus grande star du cinéma muet.',
  'Charlie Chaplin (1889-1977) est un acteur, réalisateur et compositeur britannique, devenu l''une des plus grandes stars de l''âge d''or du cinéma muet hollywoodien dans les années 1910 et 1920. Il est surtout connu pour son personnage récurrent de "Charlot" (The Tramp en anglais), un vagabond maladroit mais toujours digne, reconnaissable à son chapeau melon, sa canne et sa petite moustache.

Né dans une famille très pauvre à Londres, Chaplin a connu une enfance marquée par la misère, ce qui a profondément influencé son art : derrière le comique souvent burlesque de ses films se cache fréquemment une critique sociale sincère, qu''il s''agisse de la pauvreté, du chômage ou de la déshumanisation du travail industriel, notamment dans "Les Temps modernes" (1936).

Chaplin a continué à réaliser des films muets, ou presque muets, bien après l''arrivée généralisée du cinéma parlant à la fin des années 1920 (voir la leçon dédiée), convaincu que le langage universel du mime et du geste pouvait toucher un public plus large que des dialogues parlés dans une seule langue — un pari qui a longtemps fonctionné, avant qu''il n''adopte lui aussi, plus tardivement, le son synchronisé.

Son film "Le Dictateur" (1940), une satire féroce d''Adolf Hitler tournée alors que les États-Unis n''étaient pas encore en guerre contre l''Allemagne nazie, reste l''un de ses films les plus audacieux politiquement. Chaplin a connu plus tard des difficultés aux États-Unis en raison de ses opinions politiques jugées trop à gauche en pleine guerre froide, et a fini par s''installer en Suisse pour le reste de sa vie.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Charlie Chaplin et l''âge d''or du cinéma muet');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''animation, du dessin animé classique à la 3D',
  'Cinéma',
  'Comment l''art de donner vie à des images fixes a évolué du crayon à l''ordinateur.',
  'L''animation est une technique qui consiste à donner l''illusion du mouvement à partir d''une succession rapide d''images fixes légèrement différentes les unes des autres, projetées à un rythme suffisamment rapide (généralement autour de 24 images par seconde) pour que l''œil humain perçoive un mouvement continu plutôt que des images séparées.

Les studios Disney ont joué un rôle pionnier dans le développement de l''animation comme art à part entière, avec notamment "Blanche-Neige et les Sept Nains" (1937), considéré comme le premier long métrage d''animation entièrement en couleur de l''histoire du cinéma, à une époque où l''animation était encore perçue par beaucoup comme un simple divertissement mineur réservé aux courts métrages.

Pendant longtemps, chaque image d''un film d''animation devait être dessinée et peinte à la main, un travail extrêmement long nécessitant parfois des centaines de milliers de dessins individuels pour un seul long métrage. L''arrivée de l''informatique a radicalement transformé cette industrie : "Toy Story" (1995), produit par les studios Pixar, est le premier long métrage entièrement réalisé en animation 3D générée par ordinateur.

Aujourd''hui, l''animation en images de synthèse (3D) domine une grande partie de l''industrie du long métrage animé, mais l''animation traditionnelle dessinée à la main (2D) continue d''exister, notamment dans l''animation japonaise (les anime), qui conserve un style graphique très reconnaissable et une large popularité internationale malgré la généralisation des outils numériques.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''animation, du dessin animé classique à la 3D');
