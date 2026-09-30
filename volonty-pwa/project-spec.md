# Plateforme de bénévolat pour événements — Spécification MVP

> Document de référence pour l'agent de code (Antigravity / Cursor). Lis-le en entier avant d'écrire du code. En cas de doute, respecte le périmètre MVP et pose la question plutôt que d'ajouter des fonctionnalités.

---

## 1. Contexte et problème

Aujourd'hui, les appels aux bénévoles pour les événements circulent sous forme de Google Forms dispersés (statuts, groupes WhatsApp, etc.). Résultat : pas de centralisation, pas de suivi, pas de réponse structurée aux candidats.

**Objectif** : une plateforme unique où :
- les **organisateurs** publient leur événement, lancent un appel aux bénévoles, reçoivent et trient les candidatures, puis répondent par mail ;
- les **bénévoles** créent un profil, découvrent les bénévolats disponibles, candidatent et suivent leur statut.

**Marché initial** : Togo / Afrique francophone. **Langue de l'interface : français.**

---

## 2. Rôles

Un seul compte utilisateur, deux usages (pas de rôle figé à l'inscription) :

- **Mode bénévole** : profil, découverte, candidature, suivi.
- **Mode organisateur** : création d'events, formulaires, gestion des candidatures.

Un utilisateur peut être les deux. Le rôle est déterminé par ce qu'il fait (créer un event = organisateur), pas par un champ bloquant.

---

## 3. Périmètre MVP

### Inclus
1. **Authentification** (Supabase Auth) : inscription, connexion, déconnexion.
2. **Profil bénévole** : nom, âge, ville, compétences (tags), bio, disponibilité (texte libre).
3. **Profil organisateur** : nom de l'organisation / de l'organisateur, description, contact.
4. **Event** : titre, image de couverture (upload), description, date début/fin, lieu, nombre de places, compétences recherchées, statut (brouillon / publié / clôturé).
5. **Appel aux bénévoles** : un event peut avoir soit :
   - un **formulaire interne** (form builder), soit
   - un **lien externe de candidature** (obligatoire à renseigner par l'organisateur s'il n'utilise pas le formulaire interne).
   
   Les deux options sont **mutuellement exclusives**.
6. **Form builder minimal** — 4 types de champs seulement :
   - texte court
   - texte long
   - choix unique
   - upload de fichier (CV, PDF uniquement, si demandé)
   Chaque champ : libellé, obligatoire (oui/non), ordre.
7. **Découverte** : page listant les events publiés avec filtres simples (compétence, ville) et recherche par titre.
8. **Candidature** : le bénévole remplit le formulaire de l'event → soumission → statut suivi.
9. **Côté organisateur** : liste des candidatures par event, détail de chaque réponse (y compris CV téléchargeable), changement de statut.
10. **Emails depuis l'app** : mail d'acceptation et mail de refus (modèle simple, message modifiable avant envoi).
11. **Statistiques minimales** : compteurs par event (nb de candidatures, acceptées, refusées).

### Exclu du MVP (ne PAS implémenter)
- Matching / recommandations automatiques
- Dashboard Recharts complet (Recharts arrive en V2)
- Templates d'emails multiples, envoi groupé, liste d'attente
- Badges, certificats, avis, planning, QR check-in
- Messagerie interne, notifications push
- Paiement, multi-langue, mode sombre avancé

---

## 4. Stack technique

| Couche | Choix |
|---|---|
| Framework | **Next.js 16** (App Router), TypeScript strict |
| UI | **Tailwind CSS** + **DaisyUI 5** |
| Icônes | **Lucide React** |
| Animations | **Motion** (`motion/react`) — animations légères uniquement |
| Base de données | **PostgreSQL via Supabase** |
| ORM | **Prisma 8** (nouvelle architecture « contract », voir section 6bis — ⚠️ ne PAS utiliser la syntaxe Prisma 6/7) |
| Auth | **Supabase Auth** |
| Stockage fichiers | **Supabase Storage** (images d'events publiques, CV privés) |
| Graphiques | **Recharts** (V2, hors MVP) |
| Emails | Service transactionnel type **Resend** (à confirmer) — pas de SMTP Gmail |
| Validation | **Zod** (schémas partagés client/serveur) |
| Formulaires côté client | **React Hook Form** + resolver Zod |

### Règles de la stack
- Utiliser les **Server Components par défaut** ; `"use client"` seulement si nécessaire (interactivité, hooks).
- Mutations via **Server Actions** (validées avec Zod) ; Route Handlers seulement pour les cas qui l'exigent (webhooks, upload signé).
- Accès base de données **uniquement côté serveur** via Prisma. Jamais de requête Prisma dans un composant client.
- Vérifier la session et les **permissions côté serveur** dans chaque action/page sensible (ne jamais se fier à l'UI).
- Variables d'environnement typées et validées au démarrage.

---

## 5. Architecture

### Arborescence cible

```
src/
├─ app/
│  ├─ (public)/
│  │  ├─ page.tsx                  # landing
│  │  ├─ events/                   # liste + filtres
│  │  └─ events/[id]/              # détail d'un event + bouton candidater
│  ├─ (auth)/
│  │  ├─ connexion/
│  │  └─ inscription/
│  ├─ (app)/                       # zone connectée
│  │  ├─ profil/                   # profil bénévole / organisateur
│  │  ├─ mes-candidatures/         # suivi côté bénévole
│  │  ├─ organisateur/
│  │  │  ├─ events/                # mes events
│  │  │  ├─ events/nouveau/
│  │  │  ├─ events/[id]/           # édition + form builder
│  │  │  └─ events/[id]/candidatures/  # liste + détail + statuts + mails
│  │  └─ candidater/[eventId]/     # remplissage du formulaire
│  └─ api/                         # webhooks / upload signé si besoin
├─ components/
│  ├─ ui/                          # composants génériques (boutons, modales…)
│  ├─ events/
│  ├─ forms/                       # form builder + renderer
│  └─ applications/
├─ lib/
│  ├─ db.ts                        # instance de la base Prisma 8 (singleton, serveur uniquement)
│  ├─ supabase/                    # clients server / browser
│  ├─ auth.ts                      # helpers session (getCurrentUser, requireUser)
│  ├─ permissions.ts               # isEventOwner, canViewApplication…
│  ├─ email/                       # envoi + templates
│  └─ validations/                 # schémas Zod
├─ actions/                        # Server Actions par domaine
│  ├─ events.ts
│  ├─ forms.ts
│  ├─ applications.ts
│  └─ profile.ts
└─ types/
src/prisma/
└─ contract.prisma               # contrat de données Prisma 8 (ou contract.ts selon le style choisi)
prisma.config.ts                 # configuration CLI Prisma 8 (à la racine)
prisma-8.md                      # généré par create-prisma : à lire par l'agent
```

### Principes
- **Séparation par domaine** : events, forms, applications, profile.
- **Logique métier dans `actions/` et `lib/`**, pas dans les composants.
- **Un composant = une responsabilité.** Composants de page fins.
- Mobile-first : la majorité des bénévoles utiliseront un téléphone.

---

## 6bis. Prisma 8 — points d'attention (IMPORTANT)

Prisma 8 n'est **pas** une mise à jour mineure de Prisma 7 : c'est une nouvelle architecture. Ne te fie pas à tes connaissances de Prisma 6/7.

- **Avant de coder l'accès aux données**, lis `prisma-8.md` et les skills Prisma installés dans le projet (générés par `create-prisma`), ainsi que la doc officielle : https://www.prisma.io/docs/orm et « Coming from Prisma ORM 7 » (https://www.prisma.io/docs/orm/coming-from-prisma-orm-7).
- **Initialisation du projet** : `npm create prisma@latest -- --provider postgres --no-deploy` (Node.js 22.18 minimum). Choisir le style **PSL** (`contract.prisma`) pour rester proche d'un schéma classique.
- **Le modèle de données vit dans un « contract »** : `src/prisma/contract.prisma` (ou `contract.ts`), plus `schema.prisma`.
- **Configuration CLI** dans `prisma.config.ts`.
- **API de requêtes** : `.limit(n)` et `.offset(n)` remplacent `.take()` / `.skip()`. SQL brut : `db.raw.sql` (et non `db.sql.raw`).
- **Migrations** : nouveau planificateur (`migration plan`, `db:init` pour l'initialisation), différent de `prisma migrate dev`. Ne pas utiliser les anciennes commandes Prisma 7 par réflexe.
- **`DATABASE_URL`** : les scripts générés la lisent depuis l'environnement du shell, pas forcément depuis `.env`. Vérifier le comportement dans `prisma-8.md` avant de configurer Next.js.
- **Base Supabase** : connexion PostgreSQL standard (`sslmode=require`). Utiliser la chaîne de connexion directe ou session pooler pour les migrations.
- **Statut de la version** : la doc parle encore de « release candidate » à certains endroits, alors que le changelog indique que `prisma@latest` installe Prisma 8. Épingler la version exacte installée dans `package.json`.
- **En cas de doute ou d'erreur de syntaxe** : consulter la doc Prisma 8 plutôt que deviner. Proposer une alternative si une fonctionnalité n'existe pas encore.

---

## 6. Modèle de données

Entités principales et relations (à traduire dans le **contract Prisma 8**, voir 6bis) :

**User**
- id, email, createdAt
- relation 1–1 vers **VolunteerProfile** (optionnel)
- relation 1–1 vers **OrganizerProfile** (optionnel)

**VolunteerProfile**
- userId, fullName, age, city, bio, availability, skills (liste de tags), createdAt

**OrganizerProfile**
- userId, name, description, contactEmail, createdAt

**Event**
- id, organizerId (→ User), title, description, coverImageUrl, startsAt, endsAt, location, city, slots (nb de places), skillsWanted (liste de tags), status (`DRAFT` | `PUBLISHED` | `CLOSED`), externalApplicationUrl (nullable), createdAt
- règle : `externalApplicationUrl` **ou** un `Form` interne, jamais les deux

**Form** (1–1 avec Event)
- id, eventId, title, description

**FormField**
- id, formId, label, type (`SHORT_TEXT` | `LONG_TEXT` | `SINGLE_CHOICE` | `FILE`), required, order, options (pour SINGLE_CHOICE)

**Application**
- id, eventId, volunteerId (→ User), status (`SUBMITTED` | `ACCEPTED` | `REJECTED`), submittedAt, decidedAt, decisionEmailSentAt
- contrainte d'unicité : **une seule candidature par (eventId, volunteerId)**

**ApplicationAnswer**
- id, applicationId, fieldId, textValue (nullable), fileUrl (nullable)

### Notes
- Index sur `Event.status`, `Event.city`, `Application.eventId`.
- Suppression en cascade : Event → Form → FormField ; Application → ApplicationAnswer.
- Listes de tags (skills) : tableau de strings Postgres au MVP, table dédiée plus tard si besoin.

---

## 7. Sécurité et permissions

- **RLS Supabase activée** sur les tables et sur les buckets Storage.
- **Bucket `event-covers`** : lecture publique, écriture réservée à l'organisateur propriétaire.
- **Bucket `cv-uploads`** : **privé**. Accès uniquement à l'auteur de la candidature et à l'organisateur de l'event concerné (URLs signées à durée courte).
- Contrôles serveur systématiques :
  - seul le propriétaire d'un event peut le modifier, voir ses candidatures et changer leur statut ;
  - seul l'auteur peut voir sa candidature ;
  - un bénévole ne peut pas candidater deux fois au même event ;
  - impossible de candidater à un event non publié ou clôturé.
- Upload : limiter type (images JPG/PNG/WebP ; CV PDF) et taille (ex. 5 Mo).
- Ne jamais exposer l'email d'un bénévole publiquement.
- Toute entrée utilisateur validée par Zod côté serveur.

---

## 8. Parcours utilisateurs

### Organisateur
1. Inscription → création du profil organisateur.
2. Créer un event (image, infos, places, compétences).
3. Choisir : **formulaire interne** (form builder) ou **lien externe**.
4. Publier l'event.
5. Consulter les candidatures : liste → détail (réponses + CV).
6. Accepter ou refuser → aperçu du mail modifiable → envoi.

### Bénévole
1. Inscription → création du profil (ex. développeur, 19 ans, Lomé).
2. Parcourir les events (filtres compétence/ville).
3. Ouvrir un event → « Candidater ».
   - lien externe : redirection ;
   - formulaire interne : remplissage + upload CV si demandé.
4. Suivre le statut dans « Mes candidatures ».
5. Recevoir le mail de décision.

---

## 9. Emails

- Deux modèles : **acceptation** et **refus**, en français, avec nom du bénévole, titre de l'event, nom de l'organisateur.
- L'organisateur peut **modifier le message avant l'envoi**.
- Enregistrer `decisionEmailSentAt` pour éviter les doubles envois.
- Gérer l'échec d'envoi (message d'erreur clair, possibilité de renvoyer).
- Expéditeur : adresse de la plateforme ; `Reply-To` = contact de l'organisateur.

---

## 10. UI / UX

- **DaisyUI 5** pour les composants (cards, modals, badges, steps, forms).
- **Lucide React** pour toutes les icônes.
- **Motion** pour transitions d'apparition et micro-interactions, sans surcharge.
- Mobile-first, lisible sur petits écrans.
- États systématiques : chargement (skeleton), vide, erreur.
- Textes d'interface en **français**.
- Badges de statut de candidature : Soumise / Acceptée / Refusée.

---

## 11. Ordre de construction

1. Setup projet, Tailwind + DaisyUI, connexion Supabase, contract Prisma 8 (`contract.prisma`), initialisation de la base (voir 6bis).
2. Auth + helpers session + profils (bénévole / organisateur).
3. CRUD Events + upload d'image.
4. Form builder + rendu du formulaire côté candidat.
5. Soumission de candidature (avec upload CV privé).
6. Espace organisateur : liste des candidatures, détail, statuts.
7. Emails d'acceptation / refus.
8. Page de découverte avec filtres + compteurs simples.
9. Finitions : états vides/erreurs, responsive, animations légères.

---

## 12. Instructions pour l'agent

- Travailler **étape par étape** selon l'ordre ci-dessus ; ne pas passer à l'étape suivante sans que la précédente fonctionne.
- Ne pas ajouter de fonctionnalité hors périmètre MVP.
- **Prisma 8 : lire la section 6bis et `prisma-8.md` avant toute écriture de code lié à la base.** Ne jamais utiliser de syntaxe ou de commandes Prisma 6/7 de mémoire.
- Code TypeScript strict, pas de `any`.
- Nommer le code en anglais, l'interface utilisateur en français.
- Commenter uniquement les parties non évidentes.
- Après chaque étape : indiquer les fichiers créés/modifiés et comment tester.
- Si une décision d'architecture n'est pas couverte par ce document, proposer une option et la justifier brièvement avant de coder.

---

## 13. Évolutions prévues (V2+, hors MVP)

- Matching automatique bénévole ↔ event + notifications
- Dashboard **Recharts** (candidatures par jour, profils par âge/compétence)
- Templates d'emails, envoi groupé, liste d'attente
- Certificats de bénévolat (PDF), badges, avis
- Planning, présence, QR code check-in