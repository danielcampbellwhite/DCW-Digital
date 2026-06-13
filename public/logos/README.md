# Client logos

Drop real client logos here and they're used **automatically** — no code
changes needed. The filename must match the client `slug` from
`src/content/clients.ts`:

| Slug | Organisation |
| --- | --- |
| `wuth` | Wirral University Teaching Hospital |
| `arden-gem` | NHS Arden & GEM CSU |
| `asap-glos` | ASAP Glos NHS |
| `hls-coventry` | Healthy Lifestyles Coventry |
| `hls-warwickshire` | Healthy Lifestyles Warwickshire |
| `stop-for-life-sandwell` | Stop For Life Sandwell |
| `stop-for-life-devon` | Stop For Life Devon |
| `liv-life-liverpool` | Liv Life Liverpool |
| `stop-for-life-app` | Stop For Life App (mobile) |
| `help-me-quit` | Help Me Quit App (mobile) |
| `frontline-network` | The Frontline Network |
| `smitfc` | St Martin-in-the-Fields Charity |
| `bandm-waste` | B&M Waste Services |
| `psr-solicitors` | PSR Solicitors |
| `poole-alcock` | Poole Alcock Solicitors |

Accepted extensions (in priority order): `.svg`, `.png`, `.webp`, `.jpg`.
Example: `public/logos/wuth.svg`.

> The two mobile apps (`stop-for-life-app`, `help-me-quit`) won't be fetched
> by the script below — grab their app icon from the Play Store listing and
> save it manually, e.g. `public/logos/help-me-quit.png`.

Until a file exists for a slug, a branded **wordmark** (the organisation's
monogram) is shown instead — so the page always looks complete.

## Fetching them automatically

From a machine with normal internet access, run:

```bash
./scripts/fetch-logos.sh
```

It downloads each organisation's logo into this folder. Review the results,
optimise/trim as needed, then commit.

> **Note:** these logos are the trademarks of their respective owners. Use
> them only to indicate genuine prior work. NHS logos in particular have
> strict brand guidelines — the wordmark fallback is often the safer choice.
