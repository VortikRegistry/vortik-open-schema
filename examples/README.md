# Executable interoperability example

This directory demonstrates how a downstream consumer can validate a Vortik Registry instance without hard-coding a schema path.

The example:

1. reads `registry.json`;
2. confirms that `schemas` is the declared source of truth;
3. resolves the `epbs` schema path from the registry entry;
4. compiles that schema with AJV 2020;
5. accepts `epbs.valid.json`;
6. rejects `epbs.invalid.json` for the expected `/status` constant mismatch.

Run it with:

```bash
npm ci
npm run example:validate
```

The command is also included in `npm run validate`, so CI protects the example from schema, path, fixture, and registry drift.

The fixtures are interoperability examples only. They are not Ethereum protocol specifications, production payloads, or claims of official authority.
