export const fr = {
  common: {
    error: "Erreur",
    close: "Fermer",
    save: "Enregistrer",
    saving: "Enregistrement...",
    back: "Retour",
    next: "Suivant",
    continue: "Continuer",
    cancel: "Annuler",
    retry: "Réessayer",
    remove: "Retirer",
    loading: "Chargement",
    copy: "Copier",
    copied: "Copié",
    people: {
      one: "{count} personne",
      other: "{count} personnes",
    },
    photos: {
      one: "{count} photo",
      other: "{count} photos",
    },
  },
  nav: {
    whatIsThis: "C'est quoi ?",
    watchVideo: "Voir la vidéo",
    contribute: "Contribuer",
    signIn: "Connexion équipe",
    moderation: "Modération",
    admin: "Admin",
  },
  home: {
    title: "Unbias AI",
    tagline:
      "Un jeu de données d'images public et consenti pour mesurer et corriger les biais de représentation des modèles génératifs.",
    upload: "Ajouter des photos",
  },
  taxonomy: {
    age: {
      label: "Âge",
      "18_29": "18–29",
      "30_44": "30–44",
      "45_59": "45–59",
      "60_74": "60–74",
      "75_plus": "75+",
      not_sure: "Je ne sais pas",
    },
    skin_tone: { label: "Couleur de peau" },
    gender: {
      label: "Genre",
      woman: "Femme",
      man: "Homme",
      non_binary: "Non-binaire / genre divers",
      not_sure: "Je ne sais pas",
      prefer_not_to_say: "Je préfère ne pas répondre",
    },
    body: {
      label: "Corps",
      thin: "Mince",
      medium: "Moyen",
      large: "Fort",
      very_large: "Très fort",
      not_visible: "Pas assez visible",
      not_sure: "Je ne sais pas",
    },
    disability: {
      label: "Handicap visible / aides techniques",
      short: "Handicap / aides techniques",
      glasses: "Lunettes",
      hearing_aid: "Appareil auditif",
      wheelchair: "Fauteuil roulant",
      cane_crutches_walker: "Canne / béquilles / déambulateur",
      prosthetic: "Prothèse",
      limb_difference: "Différence de membre",
      other: "Autre aide technique / handicap visible",
      otherShort: "Autre aide technique",
    },
  },
  contribute: {
    title: "Ajoutez vos photos",
    steps: {
      upload: "Envoi",
      permission: "Autorisation",
      people: "Personnes",
      annotate: "Décrire",
      review: "Vérifier",
      consent: "Consentement",
    },
    progress: "Photo {photo} sur {photos}",
    progressPerson:
      "Photo {photo} sur {photos} · Personne {person} sur {people}",
  },
  upload: {
    heading: "Ajoutez vos photos",
    intro:
      "Des photos que vous avez prises, ou de personnes qui vous ont donné leur accord. Chacune est vérifiée par une vraie personne.",
    cta: "Ajouter des photos",
    addMore: "Ajouter d'autres photos",
    takePhoto: "Prendre une photo",
    rules: {
      people: "1 à 4 adultes clairement visibles par photo.",
      samePerson:
        "Merci de ne pas envoyer plus de 3 photos de la même personne.",
      formats: "JPEG, PNG ou WebP, 20 Mo maximum chacune.",
      noAi: "Pas d'images générées par IA ou synthétiques.",
    },
    uploading: "Envoi…",
    failed: "L'envoi a échoué.",
    tooSmall:
      "Cette photo est petite ({short} px sur son plus petit côté). Elle pourrait être refusée pour sa qualité ; nous l'acceptons quand même.",
    heic: "Les fichiers HEIC ne peuvent pas être lus par ce navigateur. Sur iPhone, choisissez « Le plus compatible » dans les réglages de l'appareil photo ou exportez la photo en JPEG.",
    unsupported:
      "Fichier non pris en charge : {name}. Utilisez une image JPEG, PNG ou WebP de moins de 20 Mo.",
    tooMany: "Vous pouvez ajouter jusqu'à {max} photos par contribution.",
    count: {
      one: "{count} photo prête",
      other: "{count} photos prêtes",
    },
    faq: "C'est quoi ?",
  },
  permission: {
    heading: "Avant de continuer",
    intro: "Ceci s'applique à toutes les photos de cet envoi.",
    adults:
      "Toutes les personnes clairement représentées sur ces photos ont 18 ans ou plus.",
    permission:
      "J'ai l'accord de chaque personne clairement représentée ou identifiable pour partager ces photos.",
    cta: "Je confirme",
  },
  people: {
    heading: "Qui est sur cette photo ?",
    found: {
      zero: "Touchez chaque personne clairement visible.",
      one: "Nous avons trouvé 1 personne. C'est bien ça ?",
      other: "Nous avons trouvé {count} personnes. C'est bien ça ?",
    },
    selected: {
      zero: "Touchez chaque personne clairement visible.",
      one: "1 personne sélectionnée. C'est tout le monde ?",
      other: "{count} personnes sélectionnées. C'est tout le monde ?",
    },
    detecting: "Recherche des personnes sur la photo…",
    manualHint:
      "Touchez une personne sur la photo pour l'ajouter. Touchez un numéro pour le retirer.",
    tooMany:
      "Les photos avec plus de {max} personnes clairement visibles ne conviennent pas à ce projet. Retirez cette photo ou choisissez moins de personnes.",
    background: "Les petites silhouettes en arrière-plan ne comptent pas.",
    confirm: "Oui, c'est ça",
    confirmCount: {
      one: "Continuer avec 1 personne",
      other: "Continuer avec {count} personnes",
    },
    none: "Personne n'est clairement visible ? Retirez cette photo.",
    removePhoto: "Retirer cette photo",
    removePerson: "Retirer la personne {n}",
  },
  annotate: {
    heading: "Personne {n}",
    intro:
      "Confirmez ce qui est visible. Vous connaissez les personnes de vos photos mieux qu'aucun modèle.",
    age: "Âge",
    skinTone: "Couleur de peau",
    skinToneHint: "Selon l'échelle Monk. Choisissez la teinte la plus proche.",
    suggested: "suggéré",
    suggestedTone:
      "Suggestion à partir de la photo : {tone}. Ajustez si cela semble faux.",
    gender: "Genre",
    body: "Corps",
    disability: "Handicap visible ou aide technique",
    disabilityHint: "Facultatif. Laissez vide si rien n'est visible.",
    required: "L'âge, la couleur de peau, le genre et le corps sont requis.",
    viewPhoto: "Voir la photo en plein écran",
    nextPerson: "Personne suivante",
    nextPhoto: "Photo suivante",
    finishPhoto: "Photo terminée",
  },
  review: {
    heading: "Vos photos",
    intro: "Touchez une photo pour modifier quelque chose.",
    complete: "Complète",
    incomplete: "À compléter",
    peopleCount: {
      one: "1 personne",
      other: "{count} personnes",
    },
    addPhotos: "Ajouter des photos",
    cta: "Continuer vers le consentement",
  },
  consent: {
    heading: "Une dernière chose",
    intro:
      "Vos photos restent privées. Seuls des chiffres agrégés sont publics.",
    training:
      "J'autorise ce projet à stocker et traiter ces photos et à les utiliser dans un jeu de données de recherche pour évaluer et entraîner des modèles d'IA open source.",
    trainingRequired: "Requis",
    display:
      "J'autorise aussi que ces photos soient montrées publiquement sur le site du projet, en exposition et en installation.",
    displayOptional: "Facultatif",
    legal:
      "Formulation provisoire ({version}), en attente de relecture juridique. Vous pouvez retirer votre contribution à tout moment avec votre code.",
    cta: "Envoyer mes photos",
    submitting: "Envoi…",
  },
  success: {
    heading: "Merci !",
    added: {
      one: "Vous avez ajouté 1 personne au jeu de données.",
      other: "Vous avez ajouté {count} personnes au jeu de données.",
    },
    pending:
      "Vos photos attendent maintenant une vérification humaine. Elles apparaissent déjà dans la partie « en attente » de la progression publique.",
    keep: "Conservez ce code en lieu sûr",
    keepBody:
      "Il vous sera nécessaire pour gérer ou retirer votre contribution.",
    emailCta: "Recevoir le code par e-mail",
    emailSent: "Code envoyé à {email}.",
    another: "Ajouter d'autres photos",
    dashboard: "Voir la progression",
  },
  emailModal: {
    title: "Recevoir votre code par e-mail",
    email: "E-mail",
    updates: "Me tenir au courant du projet",
    send: "Envoyer le code",
    sending: "Envoi…",
    privacy:
      "Votre e-mail sert uniquement à envoyer ce code, et aux nouvelles du projet si vous cochez la case.",
  },
  staff: {
    signInTitle: "Connexion équipe",
    signInSubtitle:
      "Pour les modérateurs et admins. Les contributeurs n'ont jamais besoin de compte.",
    email: "E-mail",
    password: "Mot de passe",
    signIn: "Se connecter",
    signingIn: "Connexion…",
    signOut: "Se déconnecter",
    forgot: "Mot de passe oublié ?",
  },
  moderation: {
    title: "Modération",
    summary:
      "En attente {pending} · Approuvées aujourd'hui {approved} · Refusées aujourd'hui {rejected}",
    position: "{position} sur {total} en attente",
    photoOf: "Photo {n} sur {total} de cette contribution",
    displayAllowed: "affichage public autorisé",
    displayNotAllowed: "pas d'affichage public",
    people: {
      one: "1 personne",
      other: "{count} personnes",
    },
    detected: "détectée, confirmée par le contributeur",
    manual: "ajoutée par le contributeur",
    autoWas: "(suggéré {tone})",
    none: "Rien de visible",
    automatic: "Contexte automatique",
    automaticPending: "Pas encore disponible.",
    automaticFailed:
      "Le traitement a échoué pour cette photo. Vérifiez-la quand même.",
    setting: "Cadre",
    flags: "Signalements indicatifs",
    flag: {
      processing_failed: "Traitement échoué",
      low_resolution: "Basse résolution",
      blurry: "Floue",
      exact_duplicate: "Doublon exact",
      near_duplicate: "Doublon probable",
      possible_minor: "Mineur possible",
      possible_synthetic: "Possiblement générée par IA",
      unsafe_content: "Possiblement inappropriée",
    },
    approve: "Approuver",
    reject: "Refuser",
    pickReason: "Pourquoi ?",
    reason: {
      permission_consent: "Problème d'autorisation / consentement",
      minor_visible: "Mineur visible",
      unusable_quality: "Qualité inutilisable",
      incorrect_labeling: "Étiquetage incorrect",
      duplicate: "Doublon",
      ai_generated: "Générée par IA / synthétique",
      inappropriate: "Contenu inapproprié",
      guidelines: "Hors des consignes de contribution",
      other: "Autre",
    },
    distance: "distance de hachage {distance}",
    decided: {
      pending_moderation: "En attente de vérification",
      approved: "Approuvée",
      rejected: "Refusée",
      withdrawn: "Retirée par le contributeur",
      processing: "Encore en traitement",
    },
    previous: "Précédente",
    next: "Suivante",
    emptyTitle: "Rien à vérifier",
    emptyBody:
      "Toutes les photos envoyées ont été vérifiées. Les nouvelles contributions apparaissent ici au fil de l'eau.",
  },
  dashboard: {
    peopleRepresented: "personnes représentées",
    imagesContributed: "Images reçues",
    contributionsToday: "Contributions (24 h)",
    approved: "Approuvées",
    pending: "En attente",
    pendingReview: "En attente de vérification",
    stillNeeded: "Encore à trouver",
    representation: "Représentation",
    targetEach: "{target} chacun",
    targets: "objectifs {targets}",
    usingThe: "Selon l'",
    monkScale: "échelle Monk",
    addYourPhotos: "Ajoutez vos photos",
    launchBoost:
      "Inclut {count} personnes ajoutées au lancement pour donner de l'élan. Chiffres réels dans la FAQ.",
    reviewedByPeople:
      "Les contributions sont vérifiées par de vraies personnes.",
    scanToAdd: "Scannez pour ajouter des photos depuis votre téléphone",
    videoSoon: "La vidéo d'introduction arrive bientôt.",
    offline:
      "Les chiffres en direct sont temporairement indisponibles. Dernières valeurs connues affichées.",
  },
  footer: {
    faq: "FAQ",
    source: "Code source",
    credits:
      "Une initiative ouverte de KarmaLab. Premier partenaire : IA·gora.",
  },
  about: {
    title: "Une image plus large, construite ensemble.",
    intro:
      "Les modèles d'images génératives participent désormais à la façon dont les gens sont représentés. Leur image de la société n'est pas neutre : demandez quelque chose de neutre et les mêmes visages, corps et décors reviennent. Unbias AI est une initiative culturelle et open source qui demande si l'on peut mesurer ce biais, construire collectivement de meilleures données de représentation, adapter des modèles ouverts, puis mesurer à nouveau.",
    loop: "Cette plateforme est l'étape de collecte. Chacun peut contribuer ses propres photos, ou celles de personnes qui ont donné leur accord, décrire qui est visible, et une vraie personne vérifie chaque image avant qu'elle ne rejoigne le jeu de données. L'objectif de cette première étape : 10 000 personnes représentées.",
    howTitle: "Comment ça marche",
    steps: {
      upload: {
        title: "Envoyer",
        body: "Une photo que vous avez prise, ou que vous avez l'autorisation de partager. Un à quatre adultes clairement visibles.",
      },
      identify: {
        title: "Identifier les personnes",
        body: "Touchez les personnes sur la photo. Rien n'est reconnu ni apparié ; les touches servent seulement à relier les informations à la bonne personne.",
      },
      describe: {
        title: "Décrire la représentation",
        body: "Âge, couleur de peau sur l'échelle Monk, genre, corps et aides techniques visibles. Vous confirmez chaque information vous-même.",
      },
      consent: {
        title: "Consentir",
        body: "Rien n'entre dans le jeu de données sans votre consentement explicite. L'affichage public est un choix séparé et facultatif.",
      },
      review: {
        title: "Vérification humaine",
        body: "Un modérateur vérifie chaque image avant qu'elle compte comme approuvée. Les photos en attente apparaissent déjà dans la progression publique, hachurées.",
      },
    },
    privacyTitle: "Vos photos",
    privacy: {
      private:
        "Les photos contribuées restent privées. Elles ne sont jamais publiées sans votre autorisation séparée d'affichage public.",
      aggregate: "Le site public ne montre jamais que des chiffres agrégés.",
      consent:
        "Le consentement pour l'entraînement et le jeu de données est requis ; celui pour l'affichage public est séparé et facultatif.",
      human:
        "Chaque image est vérifiée par une personne. Les contrôles automatiques n'ajoutent que des signalements indicatifs pour les modérateurs.",
      code: "Votre code de contribution est la seule clé de votre contribution. Conservez-le ; nous n'avons pas besoin de votre nom.",
    },
    faq: {
      account: {
        q: "Faut-il un compte ?",
        a: "Non. Vous recevez un code de contribution à la fin. Conservez-le : c'est ce qui vous permet de gérer ou retirer vos photos.",
      },
      photos: {
        q: "Quelles photos conviennent ?",
        a: "Des photos avec une à quatre personnes adultes clairement visibles qui vous ont donné leur accord. Tout cadre, tout cadrage. Merci de ne pas envoyer plus de trois photos de la même personne, ni d'images générées par IA.",
      },
      monk: {
        q: "Qu'est-ce que l'échelle Monk ?",
        a: "Une échelle de dix teintes de peau développée par le Dr Ellis Monk, conçue pour être plus inclusive que les échelles plus anciennes. L'application suggère une valeur quand elle peut ; vous la confirmez ou la corrigez toujours.",
      },
      public: {
        q: "Ma photo sera-t-elle montrée publiquement ?",
        a: "Seulement si vous cochez le consentement séparé et facultatif d'affichage public. Sinon votre photo sert uniquement à la recherche et à l'évaluation ou l'entraînement de modèles, sous accès contrôlé.",
      },
      ai: {
        q: "Une IA décide-t-elle quelque chose sur moi ?",
        a: "Non. Un détecteur dans le navigateur vous aide seulement à trouver les personnes à décrire, et un modèle côté serveur décrit ensuite la scène en termes neutres. Les attributs sensibles sont toujours confirmés par vous, jamais déduits comme des faits, et un modérateur prend la décision finale.",
      },
      withdraw: {
        q: "Comment retirer une photo ?",
        a: "Écrivez à start@karmalab.tech avec votre code de contribution en indiquant les photos à retirer. Nous les supprimons du stockage et de tout usage futur du jeu de données.",
      },
      boost: {
        q: "Pourquoi le tableau de bord affiche-t-il plus de photos que ce qui a vraiment été envoyé ?",
        loading: "Chargement des chiffres actuels…",
        a: "Pour donner de l'élan au projet au lancement, le tableau de bord ajoute temporairement un coup de pouce de lancement à deux chiffres. Photos reçues : {realPhotos} réellement envoyées + {addedPhotos} ajoutées = {shownPhotos} affichées. Personnes représentées : {realPeople} réellement approuvées + {addedPeople} ajoutées = {shownPeople} affichées. La part ajoutée ne correspond pas à de vraies contributions. Elle diminue à mesure que les vraies contributions arrivent et disparaît complètement dès que {until} photos ont réellement été envoyées (pour les personnes : dès que {until} personnes sont réellement approuvées). À partir de là, le tableau de bord n'affiche plus que des chiffres réels. Les graphiques par catégorie et le nombre en attente sont toujours réels.",
        over: "Pour donner de l'élan au projet au lancement, le tableau de bord a temporairement ajouté un coup de pouce aux chiffres de photos et de personnes. Il est maintenant terminé : le tableau de bord n'affiche que des chiffres réels ({realPhotos} photos envoyées, {realPeople} personnes approuvées).",
      },
      who: {
        q: "Qui est derrière ce projet ?",
        a: "Unbias AI est lancé par KarmaLab et conçu pour devenir une collaboration ouverte plus large. IA·gora est le premier partenaire institutionnel et accueille l'installation. Tout le code est open source sous licence MIT ; l'accès au jeu de données lui-même reste contrôlé.",
      },
    },
  },
  admin: {
    tabs: {
      dashboard: "Tableau de bord",
      ctas: "Appels à contribution",
      settings: "Réglages",
      lookup: "Retrouver une contribution",
    },
    dash: {
      peopleApproved: "Personnes approuvées",
      peoplePending: "Personnes en attente",
      images: "Images comptées",
      pendingImages: "Images à vérifier",
      approvedImages: "Images approuvées",
      rejectedImages: "Images refusées",
      withdrawnImages: "Images retirées",
      submissions: "Contributions envoyées",
      coverage: "Couverture par catégorie",
      bucket: "Catégorie",
    },
    ctas: {
      intro:
        "Courtes demandes affichées en haut de la page publique. Trois au maximum peuvent être actives. Formulez-les comme des demandes, pas des indicateurs : « Plus de personnes de 75 ans et plus ».",
      add: "Ajouter un appel",
      captionEn: "Texte (anglais)",
      captionFr: "Texte (français)",
      active: "Actif",
      order: "Ordre",
      create: "Ajouter",
    },
    settings: {
      targets: "Objectifs de couverture",
      targetsIntro:
        "Modifier un objectif change immédiatement les barres de progression publiques. Les dimensions et catégories sont fixes pour le POC.",
      target: "Objectif",
      moderators: "Modérateurs",
      moderatorsIntro:
        "Les modérateurs ne voient que la file de modération. Les admins gèrent aussi les objectifs, les appels et cette liste. Les nouveaux comptes reçoivent un e-mail pour définir leur mot de passe.",
      role: "Rôle",
      added: "Ajouté le",
      roles: { moderator: "Modérateur", admin: "Admin" },
      invite: "Inviter",
      invited: "Invitation envoyée à {email}.",
    },
    lookup: {
      intro:
        "Collez le code de contribution envoyé par un contributeur pour voir ses photos et en retirer une partie ou la totalité. Les fichiers retirés sont supprimés du stockage et ne comptent plus.",
      code: "Code de contribution",
      search: "Rechercher",
      notFound: "Aucune contribution avec ce code.",
      status: {
        draft: "Brouillon",
        submitted: "Envoyée",
        withdrawn: "Retirée",
      },
      consent:
        "Consentement entraînement : {training} · Affichage public : {display} · E-mail enregistré : {email}",
      yes: "oui",
      no: "non",
      withdrawPhoto: "Retirer cette photo",
      withdrawAll: "Retirer toute la contribution",
      confirmAsset:
        "Supprimer cette photo du stockage et la retirer du jeu de données ? Irréversible.",
      confirmAll:
        "Supprimer toutes les photos de cette contribution du stockage et les retirer du jeu de données ? Irréversible.",
    },
  },
  installation: {
    scan: "Scannez pour ajouter vos photos",
  },
  errors: {
    generic: "Une erreur est survenue. Réessayez.",
    offline:
      "Vous semblez hors ligne. Votre progression est enregistrée ; reconnectez-vous pour continuer.",
  },
};
