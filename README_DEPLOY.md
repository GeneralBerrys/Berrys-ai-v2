# Deploy — GitHub + Vercel

## 1) Push this repo to GitHub
```bash
git init
git add -A
git commit -m "chore: initial import"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 2) Import into Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

## 3) Add Environment Variables
In Vercel Project Settings → Environment Variables, add:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`

**Optional (for Replicate integration):**
- `REPLICATE_API_TOKEN` = `your-replicate-token`

Set these for **Development**, **Preview**, and **Production** environments.

## 4) (Optional) Vercel CLI
```bash
# Login and link project
npx vercel login
pnpm run vercel:link

# Pull env vars locally
npx vercel env pull .env.local

# Deploy manually
pnpm run vercel:deploy
```

## 5) Verify Deployment
After first deploy:
- Visit your Vercel URL
- Test `/api/ai/health` endpoint (if Replicate is configured)
- Run locally: `pnpm run verify:env`

## Troubleshooting
- **Build fails**: Check Vercel build logs for missing env vars
- **Runtime errors**: Verify all required env vars are set in Vercel
- **Local dev**: Use `pnpm run verify:env` to check environment setup
