-- Amorce une vraie "banque de données" de leçons de culture générale,
-- courtes (3-4 paragraphes) et vulgarisées (compréhensibles sans
-- compétences préalables dans le domaine), comme demandé pour recentrer
-- l'onglet Leçons sur cet usage plutôt que sur l'import de contenu long
-- déjà existant ailleurs. 20 leçons, 5 catégories (parmi les suggestions
-- de lib/lessons.ts) x 4 leçons.
--
-- editorial_status = 'a_importer' -> intentionnellement laissé à part
-- (voir 016_lessons.sql) : ce sont les deux leçons de continuité d'un
-- échange précédent avec l'utilisateur, dont je n'ai pas le contenu —
-- cette migration ne les touche pas.
--
-- editorial_status = 'a_verifier' plutôt que 'publiee' pour tout ce
-- fichier : ce contenu est généré par Claude à partir de ses
-- connaissances générales, sans vérification croisée au moment de
-- l'écrire. À relire une fois (le statut est modifiable depuis le
-- formulaire d'édition d'une leçon) avant de considérer une leçon comme
-- fiable à 100%.
--
-- Idempotent comme 016_lessons.sql : chaque insert est gardé par un
-- "where not exists" sur le titre, pour pouvoir rejouer cette migration
-- sans dupliquer si elle a déjà tourné partiellement.

-- Astronomie et cosmologie

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le Soleil, une étoile parmi des milliards',
  'Cosmologie et astronomie',
  'Comment une boule de gaz à 15 millions de degrés éclaire et chauffe toute notre planète.',
  'Le Soleil n''est pas un objet solide : c''est une immense boule de gaz, principalement de l''hydrogène et de l''hélium, maintenue par sa propre gravité. Son diamètre est environ 109 fois celui de la Terre, et à lui seul il représente plus de 99 % de la masse totale du système solaire. Si on le creusait, plus d''un million de Terres pourraient y tenir.

Son énergie vient d''une réaction qui se produit en son cœur, à environ 15 millions de degrés : la fusion nucléaire. Sous une pression énorme, des atomes d''hydrogène fusionnent pour former de l''hélium, libérant une quantité colossale d''énergie. Cette énergie met environ 170 000 ans à atteindre la surface du Soleil, puis seulement 8 minutes pour parcourir les 150 millions de kilomètres qui nous séparent de lui.

Le Soleil est né il y a environ 4,6 milliards d''années à partir de l''effondrement d''un nuage de gaz et de poussière, et il brille depuis de façon remarquablement stable — une chance pour la vie sur Terre, qui a eu le temps d''apparaître et d''évoluer. Il lui reste encore environ 5 milliards d''années de combustible avant de devenir, en fin de vie, une étoile géante rouge puis une naine blanche.

Mais le Soleil n''est pas un astre isolé : il appartient à la Voie lactée, notre galaxie, qui compte entre 100 et 400 milliards d''étoiles. Il n''en est qu''une parmi tant d''autres, de taille plutôt moyenne — mais c''est la seule dont la lumière et la chaleur rendent la vie possible sur notre planète.',
  'decouverte', 'a_verifier', 4
where not exists (select 1 from lessons where title = 'Le Soleil, une étoile parmi des milliards');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La Lune, voisine fidèle de la Terre',
  'Cosmologie et astronomie',
  'Pourquoi la mer monte et descend, et pourquoi on ne voit jamais sa face cachée.',
  'La Lune est le seul satellite naturel de la Terre, et le cinquième plus gros satellite du système solaire. Elle se serait formée il y a environ 4,5 milliards d''années, probablement après la collision entre la jeune Terre et un objet de la taille d''une planète — les débris projetés dans l''espace se seraient ensuite regroupés pour former la Lune.

On ne voit toujours que la même face de la Lune depuis la Terre, un phénomène appelé "rotation synchrone" : la Lune met exactement le même temps à tourner sur elle-même qu''à faire le tour de la Terre (environ 27 jours). Sa face cachée n''a été photographiée pour la première fois qu''en 1959, par une sonde soviétique.

La Lune est aussi responsable des marées océaniques. Son attraction gravitationnelle déforme légèrement les océans de la Terre, créant un renflement d''eau du côté de la Lune — et, par un effet d''équilibre, un autre renflement du côté opposé. En tournant, la Terre fait passer chaque point du globe à travers ces renflements, ce qui donne les marées hautes et basses.

Enfin, la Lune s''éloigne lentement de la Terre, d''environ 3,8 centimètres par an — à peu près la vitesse à laquelle poussent nos ongles. Dans des milliards d''années, elle sera trop loin pour provoquer des éclipses totales de Soleil comme on les connaît aujourd''hui.',
  'decouverte', 'a_verifier', 4
where not exists (select 1 from lessons where title = 'La Lune, voisine fidèle de la Terre');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Les trous noirs, ces pièges à lumière',
  'Cosmologie et astronomie',
  'Comment un objet peut être si dense que même la lumière ne peut pas s''en échapper.',
  'Un trou noir est une région de l''espace où la gravité est si intense que rien, pas même la lumière, ne peut s''en échapper une fois une certaine limite franchie — qu''on appelle l''horizon des événements. Ce n''est pas un trou au sens propre, mais une concentration de matière extrêmement dense dans un volume minuscule.

La plupart des trous noirs se forment lors de la mort d''une étoile massive : quand celle-ci épuise son combustible, elle s''effondre sur elle-même sous l''effet de sa propre gravité. Si l''étoile était suffisamment massive, rien ne peut arrêter cet effondrement, et la matière se concentre en un point extrêmement dense.

On ne peut pas observer un trou noir directement puisqu''il n''émet aucune lumière, mais on peut repérer ses effets : la façon dont il déforme la trajectoire des étoiles voisines, ou le disque de gaz surchauffé qui tourne parfois autour de lui avant d''y disparaître. En 2019, les astronomes ont même réussi à photographier, pour la première fois, l''ombre d''un trou noir géant au centre d''une galaxie lointaine.

Au centre de la plupart des grandes galaxies, dont la nôtre, se trouve un trou noir "supermassif", des millions voire des milliards de fois plus massif que le Soleil. Celui de la Voie lactée, baptisé Sagittarius A*, a lui aussi été photographié en 2022 — une image qui a confirmé qu''il existe bel et bien au cœur de notre propre galaxie.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Les trous noirs, ces pièges à lumière');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La Voie lactée, notre galaxie',
  'Cosmologie et astronomie',
  'Un disque de centaines de milliards d''étoiles, dont le Soleil n''est qu''un grain de sable.',
  'La Voie lactée est la galaxie dans laquelle se trouvent le Soleil, la Terre et tout notre système solaire. Elle a la forme d''un immense disque spiral, avec plusieurs bras qui s''enroulent autour d''un centre bombé, et elle contient entre 100 et 400 milliards d''étoiles.

Son nom vient de son aspect dans le ciel nocturne : vue depuis la Terre, loin de toute pollution lumineuse, elle apparaît comme une large bande laiteuse qui traverse le ciel — en réalité, la lumière cumulée de centaines de milliards d''étoiles trop lointaines pour être distinguées une à une.

Notre système solaire se trouve dans un des bras de la galaxie, à environ 27 000 années-lumière de son centre — c''est-à-dire assez loin en périphérie, plutôt qu''au cœur de l''action. Le Soleil met environ 230 millions d''années à faire un tour complet autour du centre de la galaxie : la dernière fois qu''il s''est trouvé à la même position, les dinosaures n''existaient pas encore.

La Voie lactée n''est pas seule dans l''Univers : elle fait partie d''un ensemble d''une cinquantaine de galaxies appelé le Groupe local, qui comprend notamment notre grande voisine, la galaxie d''Andromède. Dans environ 4 milliards d''années, ces deux galaxies devraient d''ailleurs entrer en collision et fusionner.',
  'decouverte', 'a_verifier', 4
where not exists (select 1 from lessons where title = 'La Voie lactée, notre galaxie');

-- Littérature

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Victor Hugo, une vie au service des mots et des idées',
  'Littérature',
  'Du roman au combat politique, le parcours du plus célèbre écrivain français du XIXe siècle.',
  'Victor Hugo (1802-1885) est l''un des écrivains français les plus célèbres au monde. Poète, romancier et dramaturge, il a marqué presque tous les genres littéraires de son époque, et reste aujourd''hui l''auteur de deux des romans français les plus lus : "Notre-Dame de Paris" (1831) et "Les Misérables" (1862).

"Les Misérables" raconte le parcours de Jean Valjean, un ancien prisonnier qui tente de se racheter dans une société qui refuse de lui donner une seconde chance. À travers ce roman, Hugo dénonce la misère sociale, l''injustice du système judiciaire et le sort réservé aux plus pauvres — des thèmes qui lui tenaient profondément à cœur.

Hugo n''était pas seulement écrivain : il a aussi été une figure politique engagée. Opposé à la peine de mort et à la censure, il s''est exilé pendant près de 20 ans (notamment à Guernesey, dans les îles Anglo-Normandes) après avoir critiqué ouvertement Napoléon III. C''est d''ailleurs pendant cet exil qu''il a écrit "Les Misérables".

À sa mort en 1885, la France lui a rendu un hommage exceptionnel : plus de deux millions de personnes ont suivi son cortège funèbre jusqu''au Panthéon, à Paris, où il repose aujourd''hui aux côtés d''autres grandes figures françaises comme Voltaire et Rousseau.',
  'decouverte', 'a_verifier', 4
where not exists (select 1 from lessons where title = 'Victor Hugo, une vie au service des mots et des idées');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'William Shakespeare et l''invention du théâtre moderne',
  'Littérature',
  'Comment un acteur anglais du XVIe siècle a changé pour toujours la façon de raconter des histoires.',
  'William Shakespeare (1564-1616) est considéré comme le plus grand dramaturge de langue anglaise, et l''un des plus influents de l''histoire mondiale. On sait en réalité assez peu de choses sur sa vie privée, mais il a laissé derrière lui une œuvre immense : une quarantaine de pièces de théâtre et plus de 150 poèmes.

Ses pièces se répartissent en plusieurs genres : les tragédies, comme "Hamlet", "Macbeth" ou "Roméo et Juliette", qui explorent la jalousie, le pouvoir et la mort ; les comédies, pleines de quiproquos et de déguisements ; et les pièces historiques, inspirées des rois d''Angleterre. Cette diversité est l''une des raisons pour lesquelles son œuvre a si bien traversé les siècles.

Ce qui rend Shakespeare particulier, c''est sa capacité à créer des personnages d''une grande profondeur psychologique, à une époque où le théâtre se contentait souvent de types assez simples. Hamlet qui hésite face à la vengeance, Lady Macbeth rongée par la culpabilité : ses personnages ressemblent à de vraies personnes, avec leurs doutes et leurs contradictions.

Son influence dépasse largement le théâtre : des centaines d''expressions de la langue anglaise viennent directement de ses pièces, et ses histoires ont été adaptées des milliers de fois au cinéma, à l''opéra ou en bande dessinée. Aujourd''hui encore, "Roméo et Juliette" reste l''un des symboles universels de l''amour impossible.',
  'decouverte', 'a_verifier', 4
where not exists (select 1 from lessons where title = 'William Shakespeare et l''invention du théâtre moderne');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Jane Austen et le roman de mœurs',
  'Littérature',
  'Comment une femme discrète a inventé un regard neuf sur le mariage et la société de son temps.',
  'Jane Austen (1775-1817) est une romancière anglaise dont les six romans, écrits au tout début du XIXe siècle, sont aujourd''hui parmi les plus lus et adaptés au monde — le plus célèbre étant "Orgueil et Préjugés" (1813). De son vivant, pourtant, elle n''a jamais connu une grande notoriété : ses livres étaient publiés sans mentionner son nom.

Austen écrit sur un monde qu''elle connaît bien : la petite noblesse de campagne anglaise, où le mariage est souvent moins une affaire de sentiment que de position sociale et d''argent. "Orgueil et Préjugés" raconte ainsi l''histoire d''Elizabeth Bennet, jeune femme vive et indépendante d''esprit, et de ses rapports tendus puis amoureux avec le riche et distant Mr Darcy.

Ce qui distingue Austen, c''est son ironie : elle observe les travers de la société de son époque — le snobisme, l''hypocrisie, la course aux bonnes alliances matrimoniales — avec un humour fin plutôt qu''avec de la morale appuyée. Ses romans sont souvent décrits comme des "comédies de mœurs", qui font rire tout en disant quelque chose de sérieux sur la condition des femmes de son temps.

Longtemps considérée comme une romancière un peu mineure, Austen est aujourd''hui reconnue comme une pionnière du roman moderne, admirée pour la précision de son style et la justesse de ses portraits psychologiques. Ses histoires continuent d''inspirer films, séries et réécritures bien au-delà du monde anglophone.',
  'decouverte', 'a_verifier', 4
where not exists (select 1 from lessons where title = 'Jane Austen et le roman de mœurs');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Albert Camus et la philosophie de l''absurde',
  'Littérature',
  'Comment un écrivain né en Algérie a donné une forme littéraire à l''idée que la vie n''a pas de sens préétabli.',
  'Albert Camus (1913-1960) est un écrivain et philosophe français né en Algérie, dans une famille modeste. Prix Nobel de littérature en 1957, il est surtout connu pour des romans comme "L''Étranger" (1942) et "La Peste" (1947), ainsi que pour son essai "Le Mythe de Sisyphe".

Au cœur de son œuvre se trouve une idée centrale : "l''absurde", c''est-à-dire le décalage entre le désir humain de trouver un sens à l''existence et le silence du monde, qui n''offre aucune réponse définitive. Plutôt que d''y voir une raison de désespérer, Camus y voit un point de départ : puisque la vie n''a pas de sens donné à l''avance, c''est à chacun de choisir comment la vivre.

"La Peste" raconte une épidémie qui frappe la ville d''Oran et isole ses habitants du reste du monde. Au-delà du récit, le roman est souvent lu comme une réflexion sur la façon dont les êtres humains réagissent face à un malheur collectif qui les dépasse — certains par le déni, d''autres par la solidarité et l''action, malgré l''absence de certitude de réussir.

Camus a toujours refusé les systèmes de pensée trop rigides, qu''ils soient religieux ou idéologiques, préférant une morale fondée sur la lucidité et la solidarité humaine. Mort dans un accident de voiture en 1960, à 46 ans, il reste l''un des écrivains français les plus lus et étudiés dans le monde.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Albert Camus et la philosophie de l''absurde');

-- Arts, peinture, architecture et musique

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La Joconde, le tableau le plus célèbre du monde',
  'Arts, peinture, architecture et musique',
  'Pourquoi ce petit portrait peint par Léonard de Vinci fascine depuis plus de 500 ans.',
  'La "Joconde" (ou "Mona Lisa") est un portrait peint par Léonard de Vinci au tout début du XVIe siècle, probablement entre 1503 et 1519. Le tableau, plutôt petit (77 cm sur 53 cm), représente une femme assise, souriant légèrement, devant un paysage flou. Il est aujourd''hui exposé au musée du Louvre, à Paris, où il attire chaque année des millions de visiteurs.

L''identité exacte du modèle reste discutée, mais l''hypothèse la plus répandue est qu''il s''agit de Lisa Gherardini, l''épouse d''un marchand florentin nommé Francesco del Giocondo — d''où le nom "Joconde". Léonard de Vinci aurait gardé le tableau avec lui jusqu''à sa mort plutôt que de le livrer à son commanditaire, continuant à le retoucher pendant des années.

Une partie de la fascination pour ce tableau vient de la technique de Léonard de Vinci : le "sfumato", qui consiste à estomper les contours par de légers dégradés plutôt que par des lignes nettes. C''est ce qui donne au sourire de la Joconde son caractère insaisissable — on a l''impression qu''il change selon l''angle sous lequel on regarde le tableau.

La célébrité mondiale de la Joconde est aussi liée à son histoire : le tableau a été volé au Louvre en 1911 puis retrouvé deux ans plus tard, ce qui a fait les gros titres dans le monde entier et a considérablement renforcé sa notoriété. Depuis, il est protégé par une vitre blindée et reste l''une des œuvres d''art les plus reproduites de l''histoire.',
  'decouverte', 'a_verifier', 4
where not exists (select 1 from lessons where title = 'La Joconde, le tableau le plus célèbre du monde');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''impressionnisme : peindre la lumière plutôt que les détails',
  'Arts, peinture, architecture et musique',
  'Comment un groupe de peintres rejetés par les musées officiels a changé la peinture pour toujours.',
  'L''impressionnisme est un mouvement de peinture né en France dans les années 1870, porté par des artistes comme Claude Monet, Pierre-Auguste Renoir, Edgar Degas ou Camille Pissarro. Son nom vient d''un tableau de Monet, "Impression, soleil levant" (1872), qu''un critique avait moqué en le jugeant trop peu fini pour être une vraie peinture.

Avant les impressionnistes, la peinture académique valorisait des scènes historiques ou mythologiques, peintes avec des contours précis en atelier. Les impressionnistes, eux, préfèrent peindre en extérieur, directement face à leur sujet, pour capturer un instant précis : un reflet sur l''eau, une lumière qui change, une scène de la vie quotidienne plutôt qu''un grand événement historique.

Leur technique se reconnaît par des touches de couleur courtes et visibles, plutôt que des surfaces lisses, et par l''usage de couleurs vives posées côte à côte plutôt que mélangées à l''avance sur la palette. Vu de près, un tableau impressionniste peut sembler flou ou inachevé ; c''est en prenant du recul que l''image se forme dans l''œil du spectateur.

D''abord moqués et refusés par le Salon officiel de peinture à Paris, les impressionnistes ont organisé leurs propres expositions à partir de 1874. Ironie de l''histoire : ce mouvement longtemps considéré comme scandaleux est aujourd''hui l''un des plus aimés du grand public, et des tableaux comme les "Nymphéas" de Monet comptent parmi les œuvres les plus connues au monde.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''impressionnisme : peindre la lumière plutôt que les détails');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Michel-Ange et le plafond de la chapelle Sixtine',
  'Arts, peinture, architecture et musique',
  'Comment un sculpteur qui ne voulait pas peindre a créé l''un des chefs-d''œuvre de la Renaissance.',
  'Michel-Ange (1475-1564) est l''un des plus grands artistes de la Renaissance italienne, célèbre à la fois comme sculpteur, peintre et architecte. Il se considérait avant tout comme sculpteur — ses statues du "David" et de la "Pietà" comptent parmi les plus admirées de l''histoire de l''art — mais c''est un travail de peinture qui l''a rendu encore plus célèbre.

En 1508, le pape Jules II lui commande de peindre le plafond de la chapelle Sixtine, au Vatican. Michel-Ange, qui ne se sentait pas peintre, aurait d''abord tenté de refuser. Il a finalement passé environ quatre ans allongé sur un échafaudage, le visage tourné vers le haut, à peindre plus de 300 personnages sur 500 mètres carrés de plafond.

L''œuvre centrale du plafond, la "Création d''Adam", montre Dieu et Adam tendant chacun un bras l''un vers l''autre, leurs doigts presque en train de se toucher. Cette image est devenue l''une des plus reproduites de toute l''histoire de l''art, des publicités aux films, bien au-delà du contexte religieux d''origine.

Des décennies plus tard, Michel-Ange est revenu dans la même chapelle pour peindre, sur le mur de l''autel, une immense fresque du "Jugement dernier". À sa mort en 1564, à 88 ans, il laissait derrière lui une œuvre si influente que des générations entières de peintres et de sculpteurs ont cherché à l''égaler.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Michel-Ange et le plafond de la chapelle Sixtine');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Picasso et l''invention du cubisme',
  'Arts, peinture, architecture et musique',
  'Comment un peintre espagnol a cassé les règles de la perspective pour montrer un objet sous toutes ses faces à la fois.',
  'Pablo Picasso (1881-1973) est l''un des artistes les plus prolifiques et influents du XXe siècle, avec une œuvre estimée à plusieurs dizaines de milliers de peintures, sculptures, céramiques et dessins. Né en Espagne, il a passé la majeure partie de sa vie créative en France, notamment à Paris.

Vers 1907, avec le peintre français Georges Braque, Picasso développe un style radicalement nouveau : le cubisme. Plutôt que de représenter un objet ou un visage comme on le verrait depuis un seul point de vue, les cubistes le décomposent en facettes géométriques, montrées simultanément sous plusieurs angles — comme si on pouvait voir de face et de profil en même temps.

Cette révolution rompt avec des siècles de peinture occidentale fondée sur la perspective, cette technique qui donne l''illusion de la profondeur sur une surface plate. Un tableau cubiste ne cherche pas à "tromper l''œil" : il propose une autre façon de comprendre un objet, plus proche de la manière dont notre esprit assemble des informations venues de plusieurs angles.

Au-delà du cubisme, Picasso n''a jamais cessé de changer de style tout au long de sa vie, explorant tour à tour la céramique, la sculpture sur métal et la gravure. L''une de ses œuvres les plus connues, "Guernica" (1937), peinte en réaction au bombardement d''une ville basque pendant la guerre civile espagnole, reste aujourd''hui un symbole universel contre la guerre.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Picasso et l''invention du cubisme');

-- Histoire mondiale

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La Révolution française, la fin d''un monde',
  'Histoire mondiale',
  'Comment un pays dirigé par un roi tout-puissant est devenu, en quelques années, une république.',
  'En 1789, la France est une monarchie où le roi Louis XVI détient en théorie un pouvoir absolu, mais le pays traverse une grave crise : les caisses de l''État sont vides, les récoltes ont été mauvaises, et le peuple, en particulier à Paris, souffre de la faim et du prix élevé du pain. Le 14 juillet 1789, des Parisiens prennent d''assaut la prison de la Bastille, symbole de l''autorité royale — un événement qui marque, encore aujourd''hui, la fête nationale française.

Dans les mois qui suivent, l''Assemblée nationale abolit les privilèges de la noblesse et du clergé, et adopte la Déclaration des droits de l''homme et du citoyen, qui affirme que tous les hommes naissent libres et égaux en droits. Ce texte, toujours en vigueur dans la Constitution française, a aussi influencé de nombreuses démocraties à travers le monde.

La Révolution se radicalise ensuite : la monarchie est abolie en 1792, et Louis XVI est exécuté en 1793. S''ouvre alors une période appelée la "Terreur", durant laquelle des milliers de personnes jugées hostiles à la Révolution sont guillotinées, avant que le mouvement révolutionnaire ne s''essouffle et ne débouche, quelques années plus tard, sur l''arrivée au pouvoir de Napoléon Bonaparte.

Au-delà de la France, la Révolution française a eu un retentissement mondial : elle a montré qu''un peuple pouvait renverser une monarchie héréditaire et fonder un régime basé sur l''égalité devant la loi. Ses idées — liberté, égalité, souveraineté du peuple — ont inspiré des mouvements politiques bien au-delà de ses frontières, tout au long du XIXe siècle.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'La Révolution française, la fin d''un monde');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''Empire romain, grandeur et déclin',
  'Histoire mondiale',
  'Comment une petite cité d''Italie a fini par dominer tout le pourtour de la Méditerranée.',
  'Rome commence comme une simple cité d''Italie centrale, fondée selon la légende en 753 avant notre ère. Pendant des siècles, elle s''étend progressivement par la conquête militaire et les alliances, jusqu''à dominer, au moment de son apogée au IIe siècle, un territoire immense qui va de la Grande-Bretagne à l''Égypte, en passant par toute l''Europe du Sud et le Moyen-Orient.

Rome a d''abord été une république, dirigée par des magistrats élus, avant de devenir un empire en 27 avant notre ère avec l''arrivée au pouvoir d''Auguste, premier empereur romain. Les Romains ont laissé un héritage considérable : un système de droit qui inspire encore certaines lois actuelles, un réseau de routes et d''aqueducs impressionnant pour l''époque, et une langue, le latin, à l''origine du français, de l''espagnol, de l''italien et du roumain.

L''Empire romain était aussi connu pour ses infrastructures spectaculaires : le Colisée de Rome pouvait accueillir des dizaines de milliers de spectateurs pour des combats de gladiateurs, et les aqueducs transportaient l''eau sur des centaines de kilomètres pour alimenter les villes. Cette capacité à bâtir à grande échelle témoigne d''une organisation administrative et technique très avancée pour son temps.

À partir du IIIe siècle, l''Empire est affaibli par des crises internes, des invasions répétées et des difficultés économiques. En 395, il se divise en deux : l''Empire romain d''Occident, qui s''effondre en 476 sous la pression des peuples germaniques, et l''Empire romain d''Orient (byzantin), qui va pourtant survivre près de mille ans de plus, jusqu''en 1453.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''Empire romain, grandeur et déclin');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La Renaissance italienne, la redécouverte de l''Antiquité',
  'Histoire mondiale',
  'Comment des villes italiennes riches et rivales ont déclenché une révolution artistique et intellectuelle.',
  'La Renaissance est une période qui débute en Italie au XIVe siècle et se poursuit jusqu''au XVIe siècle, durant laquelle artistes et intellectuels redécouvrent et s''inspirent des textes et de l''art de l''Antiquité grecque et romaine, longtemps mis de côté pendant le Moyen Âge. Le terme "Renaissance" a d''ailleurs été inventé plus tard pour désigner cette idée de renouveau culturel.

Cette période fleurit particulièrement dans des villes italiennes prospères et rivales comme Florence, Venise ou Rome, où de riches familles de marchands et de banquiers, comme les Médicis à Florence, financent généreusement les artistes pour affirmer leur prestige. C''est dans ce contexte que travaillent des figures comme Léonard de Vinci, Michel-Ange ou Raphaël.

La Renaissance ne se limite pas à l''art : c''est aussi une période de grandes avancées scientifiques et techniques. L''invention de l''imprimerie à caractères mobiles par Gutenberg, vers 1450, permet de diffuser les livres beaucoup plus largement qu''auparavant, et des savants comme Copernic commencent à remettre en question l''idée que la Terre soit au centre de l''Univers.

Depuis l''Italie, la Renaissance se diffuse progressivement dans le reste de l''Europe — en France, notamment, sous le règne de François Ier, qui attire des artistes italiens comme Léonard de Vinci lui-même. Cette période marque ainsi une transition majeure entre le Moyen Âge et l''époque moderne, par sa nouvelle façon de penser l''être humain, la nature et le savoir.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'La Renaissance italienne, la redécouverte de l''Antiquité');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'La chute du mur de Berlin, la fin d''un monde divisé',
  'Histoire mondiale',
  'Comment un mur construit pour séparer une ville en deux est tombé en une seule nuit, en 1989.',
  'Après la Seconde Guerre mondiale, l''Allemagne est divisée en deux États : la République fédérale d''Allemagne (RFA), alliée des États-Unis et des pays occidentaux, et la République démocratique allemande (RDA), alliée de l''Union soviétique. Berlin, bien que située en plein territoire de la RDA, est elle-même coupée en deux, chaque partie suivant le camp de l''État auquel elle est rattachée.

En 1961, la RDA fait construire un mur en béton tout autour de Berlin-Ouest, officiellement pour se protéger de "l''impérialisme occidental", mais en réalité surtout pour empêcher ses propres habitants de fuir vers l''Ouest, où le niveau de vie est plus élevé. Ce mur devient rapidement le symbole le plus visible de la guerre froide, cette rivalité tendue entre les États-Unis et l''Union soviétique qui a duré plusieurs décennies sans jamais déboucher sur un conflit armé direct entre les deux superpuissances.

À la fin des années 1980, l''Union soviétique traverse une grave crise économique et politique, et plusieurs pays d''Europe de l''Est, dont la RDA, connaissent d''importantes manifestations populaires réclamant plus de liberté. Le 9 novembre 1989, après une annonce confuse des autorités est-allemandes sur l''ouverture des frontières, des milliers de Berlinois se rassemblent et commencent, dans la liesse, à démolir le mur à mains nues et à la masse.

La chute du mur de Berlin a ouvert la voie à la réunification de l''Allemagne, officialisée moins d''un an plus tard, en octobre 1990. Elle est aussi devenue le symbole de la fin de la guerre froide et de l''effondrement, dans les années qui suivent, de l''Union soviétique elle-même, dissoute en 1991.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'La chute du mur de Berlin, la fin d''un monde divisé');

-- Géographie et géopolitique

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le Sahara, un désert plus grand que l''Europe',
  'Géographie et géopolitique',
  'Le plus grand désert chaud du monde n''est pas seulement une mer de sable.',
  'Le Sahara est le plus grand désert chaud du monde, avec une superficie d''environ 9 millions de kilomètres carrés — presque aussi vaste que les États-Unis, ou plus grand que toute l''Europe. Il s''étend sur une dizaine de pays d''Afrique du Nord, de l''océan Atlantique à la mer Rouge.

Contrairement à une idée répandue, le Sahara n''est pas uniquement composé de dunes de sable : celles-ci ne recouvrent qu''environ 20 % de sa surface. Le reste est fait de plateaux rocheux, de gravier et même de quelques massifs montagneux, comme le Hoggar en Algérie, dont certains sommets dépassent 2 900 mètres d''altitude.

Le climat y est extrême : les températures diurnes peuvent dépasser 50°C en été, tandis que les nuits peuvent descendre sous zéro en hiver, en raison de l''air très sec qui ne retient pas la chaleur. Malgré ces conditions, le Sahara n''a pas toujours été un désert : il y a environ 10 000 ans, la région était plus verte et humide, comme le montrent des peintures rupestres représentant des girafes et des hippopotames, aujourd''hui absents de la zone.

Le Sahara n''est pas non plus vide d''habitants : plusieurs peuples, comme les Touaregs, y vivent depuis des siècles, souvent autour d''oasis où l''eau souterraine permet l''agriculture. Le désert a aussi longtemps servi de route commerciale, notamment pour le transport de l''or, du sel et des esclaves entre l''Afrique subsaharienne et le monde méditerranéen.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le Sahara, un désert plus grand que l''Europe');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''Amazonie, le plus grand poumon vert de la planète',
  'Géographie et géopolitique',
  'Pourquoi la plus grande forêt tropicale du monde est essentielle à l''équilibre du climat.',
  'La forêt amazonienne est la plus grande forêt tropicale du monde, avec une superficie d''environ 5,5 millions de kilomètres carrés répartis sur neuf pays d''Amérique du Sud, dont la majeure partie se trouve au Brésil. Elle abrite une biodiversité exceptionnelle : on estime qu''elle contient environ 10 % de toutes les espèces vivantes connues sur Terre.

Au cœur de cette forêt coule l''Amazone, le fleuve qui transporte le plus grand volume d''eau au monde — davantage que les sept fleuves suivants réunis. Certains scientifiques considèrent même qu''il est, selon la définition retenue, plus long que le Nil, ce qui en ferait le plus long fleuve du monde.

L''Amazonie joue un rôle essentiel dans la régulation du climat mondial : ses arbres absorbent une énorme quantité de dioxyde de carbone et rejettent de l''oxygène, ce qui lui a valu le surnom de "poumon de la planète". La forêt influence aussi les régimes de pluie bien au-delà de ses frontières, jusqu''en Amérique du Nord.

Cet écosystème est aujourd''hui menacé par la déforestation, principalement due à l''élevage, à l''agriculture et à l''exploitation minière et forestière illégale. Les scientifiques s''inquiètent qu''au-delà d''un certain seuil de déforestation, une partie de la forêt pourrait basculer vers un climat trop sec pour se régénérer, avec des conséquences majeures sur le climat mondial.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''Amazonie, le plus grand poumon vert de la planète');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'L''Himalaya, le toit du monde',
  'Géographie et géopolitique',
  'Comment la collision de deux continents a créé la plus haute chaîne de montagnes du monde.',
  'L''Himalaya est la plus haute chaîne de montagnes du monde, qui s''étend sur environ 2 400 kilomètres entre l''Inde, le Népal, le Bhoutan, la Chine et le Pakistan. Elle abrite les dix plus hauts sommets de la planète, dont l''Everest, qui culmine à 8 849 mètres d''altitude.

Cette chaîne s''est formée par un phénomène de "tectonique des plaques" : il y a environ 50 millions d''années, le sous-continent indien, qui se déplaçait lentement sur la surface de la Terre, est entré en collision avec le continent asiatique. Sous la pression de cette collision, le sol s''est plissé et soulevé, formant progressivement la chaîne de l''Himalaya — un processus qui continue d''ailleurs aujourd''hui, à raison de quelques millimètres par an.

On trouve d''ailleurs, au sommet de certaines montagnes de l''Himalaya, des fossiles d''animaux marins : la preuve que cette roche se trouvait autrefois au fond d''un océan, avant d''être soulevée à plusieurs milliers de mètres d''altitude par la collision des deux continents.

L''Himalaya est aussi une immense réserve d''eau douce : ses glaciers alimentent certains des plus grands fleuves d''Asie, comme le Gange, l''Indus ou le Brahmapoutre, dont dépendent, directement ou indirectement, plus d''un milliard de personnes pour l''eau potable et l''agriculture.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'L''Himalaya, le toit du monde');

insert into lessons (user_id, title, domain, summary, content, difficulty, editorial_status, estimated_minutes)
select (select id from auth.users order by created_at limit 1),
  'Le Nil, le fleuve qui a fait naître une civilisation',
  'Géographie et géopolitique',
  'Pourquoi l''Égypte ancienne n''aurait tout simplement pas pu exister sans ce fleuve.',
  'Le Nil est l''un des plus longs fleuves du monde, avec un parcours d''environ 6 650 kilomètres à travers onze pays d''Afrique de l''Est et du Nord, depuis ses sources dans la région des Grands Lacs jusqu''à son embouchure en Égypte, sur la mer Méditerranée.

Dans un pays largement désertique comme l''Égypte, le Nil a longtemps été la seule source d''eau et de terres fertiles. Chaque année, avant la construction de grands barrages, le fleuve débordait et déposait sur ses rives un limon riche en nutriments, qui permettait aux Égyptiens de l''Antiquité de cultiver le blé et d''autres céréales — une des raisons pour lesquelles l''une des premières grandes civilisations de l''histoire a pu se développer précisément à cet endroit.

Les anciens Égyptiens avaient d''ailleurs organisé toute leur société autour du rythme des crues du Nil : ils avaient développé un calendrier et des outils d''arpentage pour mesurer précisément les terres inondées, ce qui a aussi contribué aux premiers développements des mathématiques et de l''écriture dans la région.

Aujourd''hui, le Nil reste une ressource stratégique essentielle, partagée entre plusieurs pays qui en dépendent pour l''eau potable, l''agriculture et l''énergie hydroélectrique. Des tensions existent notamment autour du Grand Barrage de la Renaissance, construit par l''Éthiopie, que l''Égypte et le Soudan craignent de voir réduire le débit d''eau qui leur parvient.',
  'decouverte', 'a_verifier', 5
where not exists (select 1 from lessons where title = 'Le Nil, le fleuve qui a fait naître une civilisation');
