# 🚀 Checklist de mise en production — Volonty

## 1. Variables d'environnement sur Vercel

Aller sur **vercel.com → Projet `volonty-tg` → Settings → Environment Variables** et ajouter :

| Nom | Valeur | Envs |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rgngjuvuecsqrgvenxoi.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_H0KrNsGk_yUUvmbuupm2kw_BNVFpv28` | Production, Preview, Development |
| `DATABASE_URL` | `postgresql://postgres.rgngjuvuecsqrgvenxoi:Volonty%402026@aws-1-eu-central-1.pooler.supabase.com:5432/postgres` | Production, Preview, Development |
| `RESEND_API_KEY` | *(votre clé API Resend)* | Production |

> ⚠️ **Redéployer** après avoir ajouté les variables.

---

## 2. Supabase Storage — Configuration des buckets

### Bucket `event-covers` (images des événements — PUBLIC)
1. Aller sur **supabase.com → Projet → Storage**
2. Créer ou vérifier que le bucket `event-covers` existe et est **Public**
3. Aller dans **Storage → Policies** et ajouter ces règles RLS :

**SELECT (lecture publique) :**
```sql
-- Permettre à tout le monde de voir les images des événements
CREATE POLICY "event-covers: public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-covers');
```

**INSERT (upload réservé aux utilisateurs connectés) :**
```sql
CREATE POLICY "event-covers: authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-covers');
```

**UPDATE (mise à jour) :**
```sql
CREATE POLICY "event-covers: authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-covers');
```

---

### Bucket `cv-uploads` (CVs privés)
1. Créer le bucket `cv-uploads` — **Privé (pas de lecture publique)**
2. Politiques RLS :

**INSERT :**
```sql
CREATE POLICY "cv-uploads: authenticated insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cv-uploads');
```

**SELECT (via URLs signées uniquement) :**
```sql
CREATE POLICY "cv-uploads: owner read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 3. Supabase Auth — URL de redirection Google OAuth

Aller sur **supabase.com → Projet → Authentication → URL Configuration**

Dans **Redirect URLs**, ajouter :
```
https://volonty-tg.vercel.app/auth/callback
```

Et vérifier que le **Site URL** est bien :
```
https://volonty-tg.vercel.app
```

---

## 4. Vérification du domaine dans Next.js (`next.config.ts`)

Le fichier est déjà configuré avec :
```ts
remotePatterns: [
  { protocol: 'https', hostname: '**.supabase.co' },
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'volonty-tg.vercel.app' },
]
```

✅ Aucune action supplémentaire requise.

---

## 5. Resend — Domaine d'envoi d'emails

Pour envoyer des emails depuis `notifications@volonty.org` :
1. Créer un compte sur [resend.com](https://resend.com)
2. Ajouter et vérifier le domaine `volonty.org` (ou utiliser le domaine sandbox Resend en test)
3. Copier la clé API dans la variable `RESEND_API_KEY` sur Vercel

> **Sans `RESEND_API_KEY`** : les emails sont simulés (log console), la plateforme fonctionne sans erreur mais n'envoie pas réellement d'emails.

---

## 6. Commandes de déploiement

```bash
# Push vers GitHub pour déclencher le déploiement Vercel automatique
git add -A
git commit -m "feat: google oauth, proxy middleware, auto-save draft, image upload"
git push
```
