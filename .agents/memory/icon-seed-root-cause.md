---
name: Icon seed root cause
description: Why production icons keep breaking and the permanent fix location
---

## The Rule
`seed.ts` runs on EVERY server startup (including production deployments) and OVERWRITES `icon_name` in the DB.
Never fix icon names only in the DB — always fix them in `seed.ts` too.

**Why:** The seed uses `onConflictDoUpdate` with `set: { iconName: sql\`excluded.icon_name\` }` which unconditionally overwrites the DB value with whatever is in the seed array. So any direct DB fix is wiped on next restart.

**How to apply:** When an icon is broken in production but works in preview:
1. preview = Vite dev server, does NOT run seed → shows correct dev DB values
2. production = API server, RUNS seed on startup → seed may overwrite with wrong value
3. Always fix `artifacts/api-server/src/seed.ts` EXTRA_CATEGORIES or BASE_CATEGORIES array, not just the DB

## Fixed values (all icon_name now match actual PNG filenames in /icons/categories/)
- locks: `locks` (was `locks_doors`)
- aluminum: `aluminum` (was `aluminum_glass`)
- waterproof: `waterproof` (was `waterproofing`)
- thermal: `thermal` (was `thermal_insulation`)
- excavator: `excavator` (was `heavy_truck_driver`)
- access_control: `access_control` (was `locks_doors`)
- pumps: `pumps` (was `plumbing`)
- home_help: `home_help` (was `cleaning`)
- auto_electrician: `auto_electrician` (was `electricity`)
- car_body: `car_body` (was `welding`)
- car_ac: `car_ac` (was `ac`)
- towing: `towing` (was `moving`)
- gypsum: `gypsum` (was `painting`)
- concrete: `concrete` (was `maintenance`)
- roofing: `roofing` (was `solar`)
- loader: `loader` (was `workers`)
- heavy_equipment: `heavy_equipment` (was `generator`)
- crusher_materials: `crusher_materials` (was `backup_power`)
- truck_driver: `truck_driver` (was `moving`)
- heavy_transport: `heavy_transport` (was `tire_repair`)
- tipper_truck: `tipper_truck` (was `tank_cleaning`)
- construction_transport: `construction_transport` (was `contracting`)
- irrigation: `irrigation` (was `plumbing`)
- shop_cctv: `shop_cctv` (was `cctv`)
