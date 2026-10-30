# Subnet Studio configuration v1

Download ost-campus.json for a complete working example. Import JSON with the website's Import plan button. Export preserves the loaded configuration; previewing expansion and using calculators do not modify it. Uploads are processed locally in the tab and are not persisted across refreshes.

This is an application-specific IPv4 planning schema, expressed using JSON Schema Draft 2020-12. CIDR notation is standard; this file is not a device configuration, NetBox API response or YANG instance. No router is configured by this app.

## Structure
- `version`: 1
- `name`: display title
- `pools`: 1–32 disjoint IPv4 pools, each with unique `id`, `name`, aligned `cidr`, and `allocations` array.
- Optional pool fields: `description` and six-digit hexadecimal `color`.
- Each allocation: globally unique `id`, `name`, aligned `cidr`, `location`, `status` (`active` or `reserved`), and integer `requiredHosts`. Use zero for unspecified demand.
- Optional `growthPrefix`: exactly one less than the active prefix. The allocation must occupy the lower half of this aligned envelope. Its upper half is derived as an exclusive growth reservation. Reserved allocations cannot have growthPrefix.
- Optional `campus`: `name`, aligned `cidr`, and `poolIds` naming contained pools. Other pools may lie outside this container (e.g. public DMZ).
- Optional `sourceNotes`: array of provenance and correction strings.

## Rules
IPv4 only. Canonical dotted decimal without leading zeros. No overlapping pools. No overlaps among allocations and growth reservations. Every envelope must fit inside its pool. Demand must fit usable capacity. Maximum 256 allocations per pool and 1 MB upload. Empty pools are allowed.

JSON Schema describes types and structural constraints. The app's semantic validator independently checks alignment, capacity, containment, unique IDs and overlap. It is not a general-purpose JSON Schema engine. Unknown fields are ignored and retained on export.

Conventional LAN capacity is 2^(32-prefix)-2. /31 is treated as a point-to-point link with two addresses; /32 as a single host address. Parent containers and institute delegations are not necessarily configured LANs. Derived free space has no implicit reservation owner.

## Source reconciliation
OST Network Layer Part 1 Exercise Session solution v1.2.1, printed pp. 24–35. DMZ allocation follows demand and solution 4.7, correcting the reversal in 4.10. /23 capacity is 510, not 520. Building 3 growth is 10.16.48.0/21. Student allocation proportions describe growth envelopes, while configured subnets use the smaller blocks in 4.9–4.10. Institute slots 6–16 are reserved rather than active.
