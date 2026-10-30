-- Deuxième lot de la banque de culture générale (voir
-- 017_lessons_banque_culture_generale.sql pour le contexte complet) :
-- 16 leçons supplémentaires sur 4 nouvelles catégories (mythologie,
-- physique/chimie, biologie/évolution, cinéma), même format (3-4
-- paragraphes vulgarisés) et même statut éditorial 'a_verifier' pour les
-- mêmes raisons (contenu généré par Claude sans vérification croisée
-- faute d'accès réseau sortant depuis cet environnement).
--
-- Idempotent comme les migrations précédentes : chaque insert est gardé
-- par un "where not exists" sur le titre.

-- Mythologies et civilisations

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Zeus et les douze dieux de l''Olympe',
  'Mythologies et civilisations',
  'Un petit tour des dieux grecs qui expliquaient autrefois la foudre, la mer ou les saisons.',
  'Dans la mythologie grecque, les douze dieux principaux vivent au sommet du mont Olympe, la plus haute montagne de Grèce, d''où ils observent et interviennent dans les affaires des humains. À leur tête se trouve Zeus, dieu du ciel et de la foudre, qui a pris le pouvoir après avoir renversé son père Cronos et les Titans, une génération de dieux plus anciens.

Chaque dieu de l''Olympe a un domaine bien précis : Poséidon règne sur la mer, Athéna sur la sagesse et la stratégie, Aphrodite sur l''amour, Arès sur la guerre, ou encore Apollon sur le soleil et les arts. Cette répartition permettait aux Grecs anciens d''expliquer des phénomènes naturels (la mer en colère, un coup de foudre) et des aspects de la vie humaine (l''amour, la guerre) par l''action d''une figure divine précise.

Les Grecs anciens ne considéraient pas forcément ces récits comme une vérité littérale figée : les mythes variaient selon les régions et les époques, et de nombreux auteurs (comme Homère ou Hésiode) en ont proposé leurs propres versions. Ces histoires servaient aussi à transmettre des valeurs, des mises en garde ou des explications sur l''origine du monde.

La mythologie grecque a profondément marqué la culture occidentale : on retrouve le nom des dieux grecs (ou leurs équivalents romains) dans des mots du quotidien comme "titanesque", dans les noms de planètes, ou encore dans d''innombrables œuvres d''art, films et jeux vidéo qui continuent de réinventer ces récits plusieurs millénaires plus tard.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Zeus et les douze dieux de l''Olympe');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Osiris, Isis et le jugement des morts dans l''Égypte ancienne',
  'Mythologies et civilisations',
  'Comment les Égyptiens de l''Antiquité imaginaient ce qui se passait après la mort.',
  'Dans la mythologie égyptienne, Osiris est le dieu des morts et de la renaissance. Selon le mythe, il aurait été assassiné par son frère jaloux Seth, puis découpé en morceaux répandus à travers l''Égypte, avant que son épouse Isis ne parvienne à le ressusciter — une histoire qui a fait d''Osiris le symbole du passage entre la vie, la mort et une forme de renaissance.

Les Égyptiens anciens croyaient qu''après la mort, l''âme d''une personne devait traverser un jugement présidé par Osiris. Le cœur du défunt était pesé sur une balance face à une plume, symbole de la vérité et de la justice (Maât) : si le cœur était plus léger ou égal à la plume, l''âme accédait à une vie heureuse dans l''au-delà ; sinon, elle était dévorée par une créature redoutée, Ammout.

Cette croyance explique en grande partie les pratiques funéraires égyptiennes bien connues aujourd''hui : la momification, destinée à préserver le corps pour l''au-delà, et la construction de tombeaux richement décorés et remplis d''objets utiles au défunt dans sa vie future, des pyramides des pharaons aux tombes plus modestes.

Isis, de son côté, est devenue l''une des divinités les plus vénérées d''Égypte, associée à la magie, à la maternité et à la protection. Son culte s''est même répandu bien au-delà de l''Égypte, jusque dans l''Empire romain, où des temples lui étaient dédiés plusieurs siècles après l''apogée de la civilisation égyptienne.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Osiris, Isis et le jugement des morts dans l''Égypte ancienne');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Odin, Thor et les mythes nordiques',
  'Mythologies et civilisations',
  'Les dieux vikings, entre sagesse, marteau magique et fin du monde annoncée.',
  'La mythologie nordique est l''ensemble des croyances et récits des peuples scandinaves avant leur conversion au christianisme, popularisée aujourd''hui par les films, séries et jeux vidéo. Elle met en scène un ensemble de dieux appelés les Ases, qui vivent à Asgard, l''un des neuf mondes reliés entre eux par un arbre cosmique géant, Yggdrasil.

Odin est le dieu principal : borgne (il aurait sacrifié un œil pour obtenir la sagesse), associé à la guerre, à la poésie et à la magie, il parcourt les mondes à la recherche de connaissances. Son fils Thor, dieu du tonnerre, est quant à lui surtout connu pour son marteau magique Mjöllnir, capable de revenir dans sa main après avoir été lancé, et pour sa force légendaire au service de la protection des dieux et des humains contre les géants.

Contrairement à de nombreuses mythologies, celle des peuples nordiques prévoit une fin du monde précise, le Ragnarök : une bataille finale où la plupart des dieux, dont Odin et Thor, périssent face à des forces monstrueuses, avant qu''un nouveau monde ne renaisse des cendres de l''ancien.

Ces récits nous sont parvenus principalement grâce à des textes islandais écrits au Moyen Âge, plusieurs siècles après la christianisation de la Scandinavie, en particulier l''Edda poétique et l''Edda de Snorri. Beaucoup de nos jours de la semaine viennent d''ailleurs directement de ces dieux : le mot anglais "Thursday" (jeudi) vient de "Thor''s day", le jour de Thor.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Odin, Thor et les mythes nordiques');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Quetzalcoatl et les mythes aztèques',
  'Mythologies et civilisations',
  'Le serpent à plumes et les croyances d''une civilisation qui a bâti des cités immenses au cœur du Mexique.',
  'Les Aztèques ont bâti, entre le XIVe et le XVIe siècle, l''un des empires les plus puissants d''Amérique centrale, centré sur leur capitale Tenochtitlan — une cité construite sur un lac et reliée à la terre par des chaussées, à l''emplacement de l''actuelle Mexico. Leur mythologie comptait de nombreux dieux, souvent liés aux forces de la nature et aux cycles agricoles essentiels à leur survie.

Parmi les divinités les plus importantes figure Quetzalcoatl, le "serpent à plumes", associé à la sagesse, au vent et à la création de l''humanité. Selon un mythe, les dieux auraient façonné les êtres humains à partir d''os broyés récupérés dans le monde des morts, mélangés au sang de Quetzalcoatl lui-même.

Les Aztèques pratiquaient aussi des sacrifices humains, souvent mal compris aujourd''hui hors de leur contexte : ils croyaient que le soleil avait besoin d''être nourri de sang humain pour continuer à se lever chaque jour, une croyance liée à leur vision cyclique du monde, où plusieurs "soleils" ou ères du monde s''étaient déjà succédé et détruits avant la leur.

L''empire aztèque s''est effondré rapidement au début du XVIe siècle, à la suite de l''arrivée des conquistadors espagnols menés par Hernán Cortés, qui ont profité des maladies apportées d''Europe et des tensions avec des peuples voisins soumis aux Aztèques pour renverser l''empire en quelques années seulement.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Quetzalcoatl et les mythes aztèques');

-- Physique et chimie

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Pourquoi le ciel est bleu',
  'Physique et chimie',
  'Un phénomène tout simple de physique que l''on peut observer chaque jour, sans même y penser.',
  'La lumière du Soleil, qui nous paraît blanche, est en réalité composée de toutes les couleurs de l''arc-en-ciel mélangées. Quand cette lumière traverse l''atmosphère terrestre, elle rencontre les molécules de l''air (principalement de l''azote et de l''oxygène), qui la dévient légèrement dans toutes les directions — un phénomène appelé la diffusion.

Cette diffusion ne touche pas toutes les couleurs de la même façon : les couleurs à courte longueur d''onde, comme le bleu et le violet, sont diffusées beaucoup plus efficacement que les couleurs à longue longueur d''onde, comme le rouge ou l''orange. Ce phénomène, découvert par le physicien britannique John William Strutt (Lord Rayleigh) à la fin du XIXe siècle, porte aujourd''hui son nom : la diffusion de Rayleigh.

Le violet est en théorie diffusé encore plus que le bleu, mais le ciel ne nous paraît pas violet pour deux raisons : le Soleil émet un peu moins de violet que de bleu, et surtout, l''œil humain est plus sensible au bleu qu''au violet. Le résultat de ces deux effets combinés, c''est un ciel qui nous apparaît bleu plutôt que violet.

Ce même principe explique pourquoi le ciel devient rouge ou orange au coucher du soleil : la lumière doit alors traverser une épaisseur d''atmosphère beaucoup plus grande pour nous atteindre, ce qui diffuse presque entièrement le bleu en chemin et laisse passer surtout les couleurs chaudes, comme le rouge et l''orange.',
  'decouverte', 'a_verifier', 4
where not exists (select 1 from lessons where title = 'Pourquoi le ciel est bleu');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'E=mc², l''équation la plus célèbre de la physique',
  'Physique et chimie',
  'Ce que signifie vraiment la formule la plus connue d''Einstein, sans les mathématiques compliquées.',
  'L''équation E=mc², publiée par Albert Einstein en 1905, est probablement la formule scientifique la plus connue du grand public — même si peu de gens savent précisément ce qu''elle signifie. Elle relie trois quantités : E, l''énergie contenue dans un objet ; m, sa masse ; et c, la vitesse de la lumière dans le vide (environ 300 000 kilomètres par seconde).

Cette équation dit, en substance, que la masse et l''énergie sont deux formes d''une même chose, et qu''on peut convertir l''une en l''autre. Comme la vitesse de la lumière est un nombre immense, et qu''elle est encore multipliée par elle-même dans la formule, une très petite quantité de masse correspond en théorie à une quantité d''énergie absolument gigantesque.

Cette idée a trouvé une application concrète dans les réactions nucléaires : dans une centrale nucléaire ou une bombe atomique, une infime partie de la masse des atomes est convertie en une énergie considérable lors de la fission (division) ou de la fusion (assemblage) des noyaux atomiques. C''est aussi ce principe qui alimente les étoiles, comme le Soleil, où des noyaux d''hydrogène fusionnent pour former de l''hélium en libérant de l''énergie.

Au-delà de son utilité pratique, cette équation fait partie d''une théorie plus large, la relativité restreinte, qui a bouleversé la façon dont les physiciens comprenaient l''espace, le temps et la matière au début du XXe siècle — notamment en montrant que le temps et les distances ne sont pas aussi absolus qu''on le pensait, mais dépendent de la vitesse de l''observateur.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'E=mc², l''équation la plus célèbre de la physique');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le tableau périodique des éléments',
  'Physique et chimie',
  'Comment un tableau inventé au XIXe siècle organise encore aujourd''hui toute la matière de l''Univers.',
  'Le tableau périodique des éléments classe tous les éléments chimiques connus — c''est-à-dire les types d''atomes de base qui composent toute la matière, comme l''hydrogène, l''oxygène, le fer ou l''or — selon des règles précises qui révèlent des points communs entre eux. Il a été proposé en 1869 par le chimiste russe Dmitri Mendeleïev.

Les éléments y sont rangés par numéro atomique croissant (le nombre de protons dans leur noyau), organisés en lignes (périodes) et en colonnes (familles ou groupes). Les éléments d''une même colonne partagent souvent des propriétés chimiques similaires : par exemple, tous les éléments de la première colonne (comme le sodium ou le potassium) réagissent violemment avec l''eau.

Ce qui a rendu Mendeleïev célèbre, c''est qu''il a osé laisser des cases vides dans son tableau pour des éléments qu''il pensait exister mais qui n''avaient pas encore été découverts, en prédisant même certaines de leurs propriétés. Plusieurs de ces éléments, comme le gallium ou le germanium, ont effectivement été découverts dans les décennies suivantes, avec des propriétés proches de ses prédictions — une validation spectaculaire de son approche.

Depuis Mendeleïev, le tableau s''est enrichi : il compte aujourd''hui 118 éléments reconnus, dont les derniers, très instables et produits uniquement en laboratoire, n''existent que quelques fractions de seconde avant de se désintégrer. Le tableau reste malgré tout l''un des outils les plus utilisés dans l''enseignement et la recherche en chimie à travers le monde.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le tableau périodique des éléments');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Pourquoi la glace flotte sur l''eau',
  'Physique et chimie',
  'Une bizarrerie de l''eau, assez rare dans la nature, qui a pourtant permis à la vie de survivre aux ères glaciaires.',
  'Pour la grande majorité des substances, l''état solide est plus dense que l''état liquide : un glaçon de la plupart des matériaux fondus coulerait dans son propre liquide. L''eau fait exception à cette règle : la glace est environ 9% moins dense que l''eau liquide, ce qui explique pourquoi elle flotte, des glaçons dans un verre jusqu''aux icebergs en pleine mer.

Cette particularité vient de la structure des molécules d''eau, faites d''un atome d''oxygène et de deux atomes d''hydrogène. En formant de la glace, ces molécules s''organisent en un réseau cristallin assez ouvert, avec davantage d''espace vide entre elles qu''à l''état liquide — un peu à l''inverse de ce qui se passe pour la plupart des substances, dont les molécules se resserrent en gelant.

Cette propriété a une conséquence écologique essentielle : quand un lac ou un océan gèle, la glace se forme à la surface plutôt qu''au fond, ce qui crée une couche isolante qui protège l''eau liquide en dessous du froid extérieur. Sans cette particularité, l''eau gèlerait depuis le fond, et de nombreux lacs et mers pourraient geler entièrement, rendant la vie aquatique bien plus difficile, voire impossible à long terme.

Certains scientifiques pensent que cette propriété de l''eau a joué un rôle important pour la survie de la vie sur Terre lors des grandes périodes de glaciation passées, en permettant à des écosystèmes aquatiques de subsister sous la glace plutôt que d''être totalement détruits par le gel.',
  'decouverte', 'a_verifier', 4
where not exists (select 1 from lessons where title = 'Pourquoi la glace flotte sur l''eau');

-- Biologie et évolution

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Charles Darwin et la théorie de l''évolution',
  'Biologie et évolution',
  'Comment un long voyage en bateau a changé pour toujours notre vision du monde vivant.',
  'Charles Darwin (1809-1882) est un naturaliste britannique dont les observations ont fondé la théorie de l''évolution par sélection naturelle, l''une des idées les plus importantes de l''histoire des sciences. Elles trouvent en grande partie leur origine dans un voyage de cinq ans à bord du navire HMS Beagle, entre 1831 et 1836, qui l''a mené notamment jusqu''aux îles Galápagos, au large de l''Amérique du Sud.

Sur ces îles, Darwin remarque que des espèces d''oiseaux très proches, les pinsons, présentent des becs de formes différentes selon les îles où ils vivent, adaptés à leur nourriture locale (graines dures, insectes, nectar...). Cette observation, parmi beaucoup d''autres, l''amène à une idée centrale : au sein d''une même espèce, les individus présentent de petites variations, et ceux dont les caractéristiques sont les mieux adaptées à leur environnement ont plus de chances de survivre et de se reproduire.

Ce mécanisme, répété sur d''immenses périodes de temps et transmis de génération en génération, peut progressivement transformer une espèce, voire donner naissance à de nouvelles espèces à partir d''un ancêtre commun. Darwin publie cette théorie en 1859 dans un livre intitulé "L''Origine des espèces", après plus de vingt ans de recherches et de doutes, conscient du bouleversement que représentait cette idée pour les croyances de son époque.

La théorie de Darwin a d''abord suscité de vives controverses, notamment parce qu''elle s''appliquait aussi à l''espèce humaine, remettant en question l''idée d''une création séparée et immuable de chaque espèce. Depuis, elle a été largement confirmée et enrichie par la génétique, devenant le cadre explicatif central de toute la biologie moderne pour comprendre la diversité du vivant.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Charles Darwin et la théorie de l''évolution');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Comment fonctionne l''ADN',
  'Biologie et évolution',
  'Le manuel d''instructions microscopique présent dans presque toutes les cellules de notre corps.',
  'L''ADN (acide désoxyribonucléique) est une molécule présente dans presque toutes les cellules des êtres vivants, qui contient l''ensemble des instructions nécessaires à la construction et au fonctionnement d''un organisme — un peu comme un gigantesque manuel d''instructions écrit avec seulement quatre "lettres" chimiques, que l''on note A, T, C et G.

L''ADN a la forme d''une double hélice, c''est-à-dire deux longs brins enroulés l''un autour de l''autre, un peu comme un escalier en colimaçon. Ces deux brins sont reliés par des paires de lettres complémentaires (A se lie toujours à T, et C toujours à G), ce qui permet à la molécule de se dupliquer fidèlement chaque fois qu''une cellule se divise.

L''ordre précis de ces lettres, le long de l''ADN, forme des "gènes", des segments qui contiennent chacun l''instruction pour fabriquer une protéine particulière — les protéines étant les briques et les ouvriers microscopiques qui construisent et font fonctionner nos cellules, nos muscles, nos hormones ou notre système immunitaire.

L''ADN est aussi ce qui se transmet d''une génération à l''autre : chaque être humain reçoit environ la moitié de son ADN de chacun de ses deux parents, ce qui explique à la fois les ressemblances familiales et l''unicité de chaque individu. Depuis le séquençage complet du génome humain, achevé au début des années 2000, les scientifiques peuvent lire ce manuel d''instructions avec une précision inédite, ouvrant la voie à de nombreux progrès en médecine.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Comment fonctionne l''ADN');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La photosynthèse',
  'Biologie et évolution',
  'Comment les plantes transforment la lumière du soleil en énergie, et produisent au passage l''oxygène que nous respirons.',
  'La photosynthèse est le processus par lequel les plantes, les algues et certaines bactéries fabriquent leur propre nourriture à partir de la lumière du soleil, de l''eau et du dioxyde de carbone présent dans l''air. C''est l''un des processus biologiques les plus importants de la planète : il est à l''origine de la quasi-totalité de l''énergie qui circule dans les écosystèmes terrestres.

Ce processus se déroule principalement dans les feuilles, grâce à un pigment vert appelé chlorophylle, qui capte l''énergie lumineuse du soleil. Cette énergie est utilisée pour transformer l''eau et le dioxyde de carbone en glucose, une sorte de sucre qui sert de carburant énergétique à la plante, lui permettant de grandir, de fleurir et de se reproduire.

Un sous-produit essentiel de cette réaction est l''oxygène, rejeté dans l''atmosphère par les plantes au cours du processus. On estime qu''environ la moitié de l''oxygène présent dans l''atmosphère terrestre provient d''organismes marins microscopiques (le phytoplancton), l''autre moitié venant des plantes terrestres — autrement dit, chaque respiration humaine doit directement quelque chose à ce mécanisme.

La couleur verte de la chlorophylle n''est pas un hasard : elle vient du fait que cette molécule absorbe surtout les lumières rouge et bleue du spectre solaire, et réfléchit la lumière verte, ce qui explique pourquoi la plupart des feuilles nous apparaissent vertes à l''œil. À l''automne, quand la chlorophylle se dégrade, d''autres pigments déjà présents dans la feuille (jaunes, oranges) deviennent visibles, donnant leurs couleurs caractéristiques aux feuillages automnaux.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'La photosynthèse');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Les dinosaures, rois de la Terre pendant 165 millions d''années',
  'Biologie et évolution',
  'Comment des reptiles ont dominé la Terre pendant 165 millions d''années, avant de disparaître presque du jour au lendemain.',
  'Les dinosaures sont un groupe de reptiles qui ont dominé la vie terrestre pendant environ 165 millions d''années, du Trias jusqu''à la fin du Crétacé, il y a environ 66 millions d''années — à titre de comparaison, l''espèce humaine moderne existe depuis seulement quelques centaines de milliers d''années. Ils comprenaient une immense diversité de formes, des minuscules dinosaures à plumes de la taille d''un pigeon jusqu''aux géants comme l''Argentinosaurus, qui pouvait peser plus de 70 tonnes.

Contrairement à l''image longtemps répandue de reptiles lents et uniformément gris, de nombreuses découvertes récentes montrent que beaucoup de dinosaures, en particulier les théropodes comme le Vélociraptor, étaient couverts de plumes, probablement colorées, et que les oiseaux actuels sont en réalité leurs descendants directs — les oiseaux sont donc, au sens scientifique strict, des dinosaures toujours vivants aujourd''hui.

Les dinosaures ont disparu (à l''exception des oiseaux) à la fin du Crétacé, lors d''une extinction massive que la plupart des scientifiques attribuent à la chute d''un astéroïde géant, d''environ 10 kilomètres de diamètre, dans la région de l''actuel Mexique. L''impact aurait provoqué des incendies, un hiver prolongé lié à la poussière projetée dans l''atmosphère, et l''effondrement des chaînes alimentaires à travers le monde.

Cette extinction a ouvert la voie à la diversification rapide des mammifères, jusque-là relativement discrets, qui ont progressivement occupé les niches écologiques laissées vacantes — un processus qui, des dizaines de millions d''années plus tard, a fini par conduire à l''apparition de l''espèce humaine.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Les dinosaures, rois de la Terre pendant 165 millions d''années');

-- Cinéma

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Les frères Lumière et la naissance du cinéma',
  'Cinéma',
  'Comment un train qui arrive en gare a provoqué la panique des premiers spectateurs de cinéma.',
  'Auguste et Louis Lumière, deux frères industriels français, sont considérés comme les inventeurs du cinéma tel qu''on le connaît. En 1895, ils mettent au point le Cinématographe, un appareil capable à la fois de filmer, de développer la pellicule et de projeter les images sur un écran devant un public.

Le 28 décembre 1895, à Paris, ils organisent la première projection publique et payante de films de l''histoire, devant une trentaine de spectateurs. Le programme comprend plusieurs courts films d''une minute environ, filmés sans mise en scène particulière, comme "La Sortie de l''usine Lumière à Lyon" ou le très célèbre "L''Arrivée d''un train en gare de La Ciotat".

Selon une légende largement répétée (et sans doute exagérée avec le temps), certains spectateurs auraient été si surpris par l''image d''un train semblant avancer droit vers eux qu''ils se seraient levés ou reculés par réflexe, tant l''expérience de voir des images en mouvement projetées en grand format était alors totalement inédite.

Les frères Lumière eux-mêmes doutaient de l''avenir de leur invention, qu''ils considéraient davantage comme une curiosité scientifique passagère que comme un art ou une industrie durable. L''histoire leur a donné tort : en quelques décennies, le cinéma est devenu l''un des moyens d''expression et de divertissement les plus populaires au monde.',
  'decouverte', 'a_verifier', 4
where not exists (select 1 from lessons where title = 'Les frères Lumière et la naissance du cinéma');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Alfred Hitchcock, le maître du suspense',
  'Cinéma',
  'Comment un réalisateur britannique a inventé des techniques de mise en scène qui terrifient encore le public aujourd''hui.',
  'Alfred Hitchcock (1899-1980) est un réalisateur britannique, actif principalement à Hollywood à partir des années 1940, surnommé le "maître du suspense" pour sa capacité à tenir les spectateurs en haleine. Il a réalisé plus de 50 films en plus de cinq décennies de carrière, parmi lesquels "Psychose" (1960), "Les Oiseaux" (1963) ou "Sueurs froides" (1958).

Hitchcock distinguait clairement la surprise du suspense : la surprise, c''est un événement choquant qui arrive sans prévenir ; le suspense, c''est le fait de montrer au spectateur une bombe cachée sous une table avant que les personnages à l''écran ne la découvrent, créant une tension qui dure. Il privilégiait toujours le suspense, qu''il jugeait plus efficace pour impliquer durablement le public dans l''histoire.

Il est aussi connu pour des innovations techniques marquantes, comme la fameuse scène de la douche dans "Psychose", qui a changé la façon de filmer la violence au cinéma par son montage très rapide suggérant plus qu''il ne montre, ou l''utilisation précoce d''effets de zoom et de travelling combinés (le "vertigo effect") dans "Sueurs froides" pour traduire visuellement le vertige d''un personnage.

Hitchcock apparaissait traditionnellement, de façon brève et discrète, dans presque tous ses propres films — une sorte de signature devenue un jeu pour les spectateurs attentifs, qui cherchent encore aujourd''hui à le repérer en revoyant ses œuvres. Son influence reste considérable sur le cinéma de suspense et d''horreur contemporain.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Alfred Hitchcock, le maître du suspense');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le Voyage dans la Lune, premier grand film de science-fiction',
  'Cinéma',
  'Un petit film français de 1902, et l''image de la Lune avec une fusée dans l''œil, devenue l''un des symboles du cinéma.',
  '"Le Voyage dans la Lune" est un court métrage français réalisé en 1902 par Georges Méliès, considéré comme l''un des tout premiers films de science-fiction de l''histoire du cinéma. Il raconte l''histoire d''un groupe de savants qui se rendent sur la Lune à bord d''un obus géant tiré par un canon, inspirés par les romans de Jules Verne et H. G. Wells.

Le film est surtout resté célèbre pour une image devenue iconique : l''obus qui vient se planter dans l''œil du visage souriant de la Lune. Cette image, reprise depuis dans d''innombrables hommages, affiches et références culturelles, est aujourd''hui l''un des symboles les plus reconnaissables des débuts du cinéma.

Méliès, lui-même ancien magicien et propriétaire d''un théâtre, est aussi un pionnier des effets spéciaux au cinéma : il a popularisé des techniques comme les arrêts de caméra (pour faire apparaître ou disparaître un objet à l''écran), les surimpressions et les décors peints très soignés, à une époque où le cinéma se résumait encore le plus souvent à de simples prises de vues documentaires.

Bien que très rentable à sa sortie, le film a aussi été massivement copié et distribué illégalement aux États-Unis sans que Méliès ne touche le moindre centime, une situation qui a fini par ruiner financièrement le cinéaste. Il a fallu attendre plusieurs décennies pour que son importance historique soit pleinement reconnue, notamment après la redécouverte et la restauration de certaines de ses œuvres au XXe siècle.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le Voyage dans la Lune, premier grand film de science-fiction');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le passage du cinéma muet au cinéma parlant',
  'Cinéma',
  'Comment l''arrivée du son, à la fin des années 1920, a bouleversé en quelques mois toute une industrie.',
  'Pendant les trois premières décennies de son existence, le cinéma est resté muet : les films étaient projetés sans son synchronisé, souvent accompagnés en salle par un pianiste ou un petit orchestre jouant en direct, et les dialogues étaient parfois affichés sous forme de courts textes insérés entre les scènes, appelés cartons.

Cette situation change en 1927 avec la sortie de "Le Chanteur de jazz", produit par le studio américain Warner Bros, souvent considéré comme le premier grand film "parlant" à succès. Il utilise une technologie permettant de synchroniser un disque audio avec la projection du film, une prouesse technique pour l''époque qui enthousiasme immédiatement le public.

Cette révolution technique a bouleversé toute l''industrie du cinéma en quelques années à peine : des salles ont dû être équipées de nouveaux systèmes de projection sonore, de nombreux musiciens de salle de cinéma ont perdu leur emploi, et certains acteurs vedettes du muet, dont la voix ou l''accent ne convenaient pas au public, ont vu leur carrière décliner brutalement, tandis que de nouvelles stars adaptées au parlant émergeaient.

Le passage au parlant a aussi profondément transformé l''écriture et la mise en scène des films : les scénaristes ont dû apprendre à écrire des dialogues, les réalisateurs à gérer le son en plus de l''image, et certains artistes du muet, comme Charlie Chaplin, ont résisté plus longtemps que d''autres à cette évolution avant de s''y adapter à leur tour, parfois avec un grand succès.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le passage du cinéma muet au cinéma parlant');
