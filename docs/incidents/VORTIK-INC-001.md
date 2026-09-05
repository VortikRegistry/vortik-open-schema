# VORTIK-INC-001 — Misplaced TiendaNube assets

Status: remediated in hygiene PR.

A set of VORTIK-ART / TiendaNube product assets was accidentally committed under `assets/tiendanube/` in the public `vortik-open-schema` repository. The files were unrelated to the Ethereum semantic registry and had no code references or runtime role.

Remediation:
- remove the misplaced asset directory;
- add a repository hygiene guard that fails public-safety validation if any path segment named `tiendanube` reappears;
- preserve all registry, schema, Beacon, Reception and Block B behavior unchanged.

This incident is repository-coherence/hygiene only. No secret, credential, private buyer data, pricing data or production control material was present in the removed assets.
