# Cutover: host redirects (Jay's checklist)

Path redirects are in code (`public/_redirects`) and go live with the next
deploy. The host-level moves below can't be done from `_redirects`, which
can't match on hostname. They are Cloudflare dashboard settings for the
`actionzonecma.com` zone. Do them at cutover, after DNS points at the Worker.

## 1. http → https
SSL/TLS → Edge Certificates → **Always Use HTTPS: On**.

## 2. www → apex, and legacy URLs in one hop
The old Wix site used `www.actionzonecma.com` URLs, so those are what Google
has indexed. A plain www→apex rule would send `www.…/about` through two hops
(www → apex → `/our-story`). A Bulk Redirect list avoids that.

1. Regenerate the list from `_redirects`: `npm run build:bulk-redirects`.
   This writes `docs/cloudflare-bulk-redirects.csv`.
2. Rules → Redirect Rules → **Bulk Redirects** → create a list, import that CSV.
3. Create a Bulk Redirect rule that uses the list, then enable it.

The list holds one entry per legacy path on both hosts. It also holds a
catch-all `www.actionzonecma.com/` entry that keeps the path and query, so
every other www URL lands on the apex. Sources have no scheme, so http and
https both match.

Keep `www` proxied (orange cloud) in DNS so these rules can run.

Two things to check after cutover:
- Confirm with the commands below that exact entries beat the catch-all.
- Confirm the `#anchor` targets survive on the person-page redirects.

## 3. workers.dev
`public/_headers` and `src/middleware.ts` already send
`X-Robots-Tag: noindex` on `*.workers.dev`. Once the custom domain is live
you can also turn the workers.dev route off. Set `"workers_dev": false` in
`wrangler.jsonc`, or use Workers & Pages → the Worker → Domains.

## 4. Old sitemap URLs
`/sitemap.xml` and `/pages-sitemap.xml` 301 to `/sitemap-index.xml`. These
rules are already in `_redirects`. In Search Console, submit
`https://actionzonecma.com/sitemap-index.xml`.

## Verify (after cutover)
```sh
for u in http://www.actionzonecma.com/about https://www.actionzonecma.com/michael-lowery \
         http://actionzonecma.com/testimony https://www.actionzonecma.com/kids \
         https://actionzonecma.com/contact/ https://actionzonecma.com/sitemap.xml; do
  curl -sIL -o /dev/null -w "%{num_redirects} hop(s) -> %{url_effective}\n" "$u"
done
```
Every line should report 1 hop and end on an `https://actionzonecma.com/...`
URL. The exception is `www.../kids`, a page that kept its path; one hop to
the apex is expected there.
