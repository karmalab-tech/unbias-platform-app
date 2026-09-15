export const en = {
  common: {
    error: "Error",
    close: "Close",
    save: "Save",
    saving: "Saving...",
    back: "Back",
    next: "Next",
    continue: "Continue",
    cancel: "Cancel",
    retry: "Retry",
    remove: "Remove",
    loading: "Loading",
    copy: "Copy",
    copied: "Copied",
    people: {
      one: "{count} person",
      other: "{count} people",
    },
    photos: {
      one: "{count} photo",
      other: "{count} photos",
    },
  },
  nav: {
    whatIsThis: "What is this?",
    watchVideo: "Watch video",
    contribute: "Contribute",
    signIn: "Staff sign in",
    moderation: "Moderation",
    admin: "Admin",
  },
  home: {
    title: "Unbias AI",
    tagline:
      "A public, consented image dataset built to measure and correct representation bias in generative models.",
    upload: "Upload photos",
  },
  taxonomy: {
    age: {
      label: "Age",
      "18_29": "18–29",
      "30_44": "30–44",
      "45_59": "45–59",
      "60_74": "60–74",
      "75_plus": "75+",
      not_sure: "Not sure",
    },
    skin_tone: { label: "Skin tone" },
    gender: {
      label: "Gender",
      woman: "Woman",
      man: "Man",
      non_binary: "Non-binary / gender-diverse",
      not_sure: "Not sure",
      prefer_not_to_say: "Prefer not to say",
    },
    body: {
      label: "Body",
      thin: "Thin",
      medium: "Medium",
      large: "Large",
      very_large: "Very large",
      not_visible: "Not visible enough",
      not_sure: "Not sure",
    },
    disability: {
      label: "Visible disability / assistive devices",
      short: "Disability / assistive devices",
      glasses: "Glasses",
      hearing_aid: "Hearing aid",
      wheelchair: "Wheelchair",
      cane_crutches_walker: "Cane / crutches / walker",
      prosthetic: "Prosthetic",
      limb_difference: "Limb difference",
      other: "Other assistive device / visible disability",
      otherShort: "Other assistive device",
    },
  },
  contribute: {
    title: "Add your photos",
    steps: {
      upload: "Upload",
      permission: "Permission",
      people: "People",
      annotate: "Describe",
      review: "Review",
      consent: "Consent",
    },
    progress: "Photo {photo} of {photos}",
    progressPerson: "Photo {photo} of {photos} · Person {person} of {people}",
  },
  upload: {
    heading: "Add your photos",
    intro:
      "Photos you took, or photos of people who gave you permission. Each one is reviewed by a real person.",
    cta: "Upload photos",
    addMore: "Add more photos",
    takePhoto: "Take a photo",
    rules: {
      people: "1 to 4 clearly visible adults per photo.",
      samePerson: "Please upload no more than 3 photos of the same person.",
      formats: "JPEG, PNG or WebP, up to 20 MB each.",
      noAi: "No AI-generated or synthetic images.",
    },
    uploading: "Uploading…",
    failed: "Upload failed.",
    tooSmall:
      "This photo is small ({short} px on its shortest side). It may be rejected for quality; we will still accept it.",
    heic: "HEIC files cannot be read by this browser. On iPhone, choose “Most compatible” in Camera settings or export the photo as JPEG.",
    unsupported:
      "Unsupported file: {name}. Use a JPEG, PNG or WebP image under 20 MB.",
    tooMany: "You can add up to {max} photos per contribution.",
    count: {
      one: "{count} photo ready",
      other: "{count} photos ready",
    },
    faq: "What is this?",
  },
  permission: {
    heading: "Before we continue",
    intro: "This applies to every photo in this batch.",
    adults: "Everyone clearly represented in these photos is 18 or older.",
    permission:
      "I have permission from every clearly represented or identifiable person to share these photos.",
    cta: "I confirm",
  },
  people: {
    heading: "Who is in this photo?",
    found: {
      zero: "Tap each clearly visible person.",
      one: "We found 1 person. Is that right?",
      other: "We found {count} people. Is that right?",
    },
    selected: {
      zero: "Tap each clearly visible person.",
      one: "1 person selected. Is that everyone?",
      other: "{count} people selected. Is that everyone?",
    },
    manualHint:
      "Tap a person on the photo to add them. Tap a number to remove it.",
    tooMany:
      "Photos with more than {max} clearly visible people are not suitable for this project. Remove this photo or pick fewer people.",
    background: "Tiny people in the background do not count.",
    confirm: "Yes, that's right",
    confirmCount: {
      one: "Continue with 1 person",
      other: "Continue with {count} people",
    },
    none: "Nobody clearly visible? Remove this photo.",
    removePhoto: "Remove this photo",
    removePerson: "Remove person {n}",
  },
  annotate: {
    heading: "Person {n}",
    intro:
      "Confirm what is visible. You know the people in your photos better than any model does.",
    age: "Age",
    skinTone: "Skin tone",
    skinToneHint: "Using the Monk Skin Tone scale. Pick the closest match.",
    suggested: "suggested",
    suggestedTone:
      "Suggested from the photo: {tone}. Adjust if it looks wrong.",
    gender: "Gender",
    body: "Body",
    disability: "Visible disability or assistive device",
    disabilityHint: "Optional. Leave empty if nothing is visible.",
    required: "Age, skin tone, gender and body are required.",
    nextPerson: "Next person",
    nextPhoto: "Next photo",
    finishPhoto: "Done with this photo",
  },
  review: {
    heading: "Your photos",
    intro: "Tap a photo to change anything.",
    complete: "Complete",
    incomplete: "Needs labels",
    peopleCount: {
      one: "1 person",
      other: "{count} people",
    },
    addPhotos: "Add photos",
    cta: "Continue to consent",
  },
  consent: {
    heading: "One last thing",
    intro: "Your photos stay private. Only aggregate numbers are ever public.",
    training:
      "I allow this project to store and process these photos and to use them in a research dataset for evaluating and training open-source AI models.",
    trainingRequired: "Required",
    display:
      "I also allow these photos to be shown publicly on the project website, in exhibitions and installations.",
    displayOptional: "Optional",
    legal:
      "Draft wording ({version}), pending legal review. Contributors can withdraw at any time with their contribution code.",
    cta: "Submit my photos",
    submitting: "Submitting…",
  },
  success: {
    heading: "Thank you!",
    added: {
      one: "You added 1 person to the dataset.",
      other: "You added {count} people to the dataset.",
    },
    pending:
      "Your photos are now waiting for human review. They already appear in the pending part of the public progress.",
    keep: "Keep this code safely",
    keepBody:
      "You'll need it if you ever want to manage or withdraw your contribution.",
    emailCta: "Get the code by email",
    emailSent: "Code sent to {email}.",
    another: "Add more photos",
    dashboard: "See the progress",
  },
  emailModal: {
    title: "Get your code by email",
    email: "Email",
    updates: "Keep me updated about the project",
    send: "Send code",
    sending: "Sending…",
    privacy:
      "Your email is only used to send this code, and for project news if you tick the box.",
  },
  staff: {
    signInTitle: "Staff sign in",
    signInSubtitle:
      "For moderators and admins. Contributors never need an account.",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    signOut: "Sign out",
    forgot: "Forgot password?",
  },
  moderation: {
    title: "Moderation",
    summary:
      "Pending {pending} · Approved today {approved} · Rejected today {rejected}",
    position: "{position} of {total} pending",
    photoOf: "Photo {n} of {total} in this contribution",
    displayAllowed: "public display allowed",
    displayNotAllowed: "no public display",
    people: {
      one: "1 person",
      other: "{count} people",
    },
    detected: "detected, confirmed by contributor",
    manual: "added by contributor",
    autoWas: "(suggested {tone})",
    none: "None visible",
    automatic: "Automatic context",
    automaticPending: "Not available yet.",
    automaticFailed: "Processing failed for this photo. Review it anyway.",
    setting: "Setting",
    flags: "Advisory flags",
    flag: {
      processing_failed: "Processing failed",
      low_resolution: "Low resolution",
      blurry: "Blurry",
      exact_duplicate: "Exact duplicate",
      near_duplicate: "Possible duplicate",
      possible_minor: "Possible minor",
      possible_synthetic: "Possibly AI-generated",
      unsafe_content: "Possibly inappropriate",
    },
    approve: "Approve",
    reject: "Reject",
    pickReason: "Why?",
    reason: {
      permission_consent: "Permission / consent issue",
      minor_visible: "Minor visible",
      unusable_quality: "Unusable image quality",
      incorrect_labeling: "Incorrect labeling",
      duplicate: "Duplicate",
      ai_generated: "AI-generated / synthetic",
      inappropriate: "Inappropriate content",
      guidelines: "Does not meet contribution guidelines",
      other: "Other",
    },
    decided: {
      approved: "Approved",
      rejected: "Rejected",
      withdrawn: "Withdrawn by the contributor",
      processing: "Still processing",
    },
    previous: "Previous",
    next: "Next",
    emptyTitle: "Nothing to review",
    emptyBody:
      "Every submitted photo has been reviewed. New contributions appear here as they arrive.",
  },
  dashboard: {
    peopleRepresented: "people represented",
    imagesContributed: "Images contributed",
    contributionsToday: "Contributions today",
    approved: "Approved",
    pending: "Pending",
    pendingReview: "Pending review",
    stillNeeded: "Still needed",
    representation: "Representation",
    targetEach: "{target} each",
    targets: "targets {targets}",
    usingThe: "Using the",
    monkScale: "Monk Skin Tone scale",
    addYourPhotos: "Add your photos",
    reviewedByPeople: "Contributions are reviewed by real people.",
    scanToAdd: "Scan to add photos from your phone",
    videoSoon: "The intro video is coming soon.",
    offline:
      "Live numbers are temporarily unavailable. Showing the last known values.",
  },
  footer: {
    faq: "FAQ",
    source: "Source code",
    credits: "An open initiative by KarmaLab. First partner: IA·gora.",
  },
  about: {
    title: "A broader picture, built together.",
    intro:
      "Generative image models now take part in how people are pictured. Their picture of society is not neutral: ask for a neutral prompt and the same faces, bodies and settings tend to come back. Unbias AI is a cultural, open-source initiative that asks whether we can measure this bias, collectively build better representation data, adapt open models, and measure again.",
    loop: "This platform is the collecting step. People contribute their own photos, or photos of people who gave permission, describe who is visible, and a real person reviews every image before it joins the dataset. The goal of this first milestone is 10,000 people represented.",
    howTitle: "How it works",
    steps: {
      upload: {
        title: "Upload",
        body: "A photo you took, or one you have permission to share. One to four clearly visible adults.",
      },
      identify: {
        title: "Identify people",
        body: "Tap the people in the photo. Nothing is recognised or matched; the taps only attach labels to the right person.",
      },
      describe: {
        title: "Describe representation",
        body: "Age, skin tone on the Monk scale, gender, body and visible assistive devices. You confirm every label yourself.",
      },
      consent: {
        title: "Consent",
        body: "Nothing enters the dataset until you explicitly consent. Public display is a separate, optional choice.",
      },
      review: {
        title: "Human review",
        body: "A moderator reviews every image before it counts as approved. Pending photos already show in the public progress, hatched.",
      },
    },
    privacyTitle: "Your photos",
    privacy: {
      private:
        "Contributed photos stay private. They are never published unless you separately allow public display.",
      aggregate: "The public website only ever shows aggregate counts.",
      consent:
        "Training and dataset consent is required; public display consent is separate and optional.",
      human:
        "Every image is reviewed by a person. Automatic checks only add advisory flags for moderators.",
      code: "Your contribution code is the only key to your contribution. Keep it safe; we do not need your name.",
    },
    faq: {
      account: {
        q: "Do I need an account?",
        a: "No. You receive a contribution code at the end instead. Keep it: it is what you use to manage or withdraw your photos.",
      },
      photos: {
        q: "Which photos work?",
        a: "Photos with one to four clearly visible adults who gave you permission. Any setting, any framing. Please upload no more than three photos of the same person, and no AI-generated images.",
      },
      monk: {
        q: "What is the Monk Skin Tone scale?",
        a: "A ten-step scale of skin tones developed by Dr Ellis Monk, designed to be more inclusive than older scales. The app suggests a value where it can; you always confirm or correct it.",
      },
      public: {
        q: "Will my photo be shown publicly?",
        a: "Only if you tick the separate, optional public display consent. Otherwise your photo is used only for research and model evaluation or training, under controlled access.",
      },
      ai: {
        q: "Does an AI decide anything about me?",
        a: "No. A browser-side detector only helps you find the people to label, and a server-side model later describes the scene in neutral terms. Sensitive attributes are always confirmed by you, never inferred as fact, and a moderator makes the final call.",
      },
      withdraw: {
        q: "How do I withdraw a photo?",
        a: "Email start@karmalab.tech with your contribution code and tell us which photos to remove. We delete them from storage and from any future dataset use.",
      },
      who: {
        q: "Who is behind this?",
        a: "Unbias AI is started by KarmaLab and designed to grow into a broader open collaboration. IA·gora is the first institutional partner and hosts the installation. All code is open source under the MIT license; access to the dataset itself stays controlled.",
      },
    },
  },
  admin: {
    tabs: {
      dashboard: "Dashboard",
      ctas: "Calls to action",
      settings: "Settings",
      lookup: "Find a contribution",
    },
    dash: {
      peopleApproved: "People approved",
      peoplePending: "People pending",
      images: "Images counted",
      pendingImages: "Images awaiting review",
      approvedImages: "Images approved",
      rejectedImages: "Images rejected",
      withdrawnImages: "Images withdrawn",
      submissions: "Contributions submitted",
      coverage: "Coverage by bucket",
      bucket: "Bucket",
    },
    ctas: {
      intro:
        "Short requests shown high on the public page. At most three can be active. Write them as requests, not metrics: “More people aged 75+”.",
      add: "Add a call to action",
      captionEn: "Caption (English)",
      captionFr: "Caption (French)",
      active: "Active",
      order: "Order",
      create: "Add",
    },
    settings: {
      targets: "Coverage targets",
      targetsIntro:
        "Editing a target changes the public progress bars immediately. Dimensions and buckets themselves are fixed for the POC.",
      target: "Target",
      moderators: "Moderators",
      moderatorsIntro:
        "Moderators only see the moderation queue. Admins also manage targets, calls to action and this list. New accounts receive an email to set their password.",
      role: "Role",
      added: "Added",
      roles: { moderator: "Moderator", admin: "Admin" },
      invite: "Invite",
      invited: "Invitation sent to {email}.",
    },
    lookup: {
      intro:
        "Paste the contribution code a contributor sent by email to see their photos and withdraw some or all of them. Withdrawn files are deleted from storage and stop counting.",
      code: "Contribution code",
      search: "Find",
      notFound: "No contribution with this code.",
      status: {
        draft: "Draft",
        submitted: "Submitted",
        withdrawn: "Withdrawn",
      },
      consent:
        "Training consent: {training} · Public display: {display} · Email on file: {email}",
      yes: "yes",
      no: "no",
      withdrawPhoto: "Withdraw this photo",
      withdrawAll: "Withdraw the whole contribution",
      confirmAsset:
        "Delete this photo from storage and remove it from the dataset? This cannot be undone.",
      confirmAll:
        "Delete every photo of this contribution from storage and remove them from the dataset? This cannot be undone.",
    },
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    offline:
      "You seem to be offline. Your progress is saved; reconnect to continue.",
  },
};
