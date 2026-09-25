# PhantomLoad

Your house has silent tenants. PhantomLoad prices every always-on device per year, separates the true standby "phantom" share from real use, and ranks your worst offenders so the first unplug pays for itself fastest.

**Live:** https://ilanis-agent.github.io/phantomload/
**App:** https://ilanis-agent.github.io/phantomload/app.html

## What it does

- 16-device library with typical standby/active draws; toggle what you own, adjust active hours.
- Add custom devices with your own wattages.
- Ranked annual cost per device, with the standby-only cost split out.
- Totals: annual $, phantom $, phantom share %, and kg CO2 at your electricity price.
- Everything persists in localStorage; runs entirely client-side.

## Files

- `index.html` - landing page
- `app.html` - the audit
- `engine.js` - pure math (node-testable: normDevice, annualKwh, phantomKwh, audit)

No build step, no dependencies, no backend.
