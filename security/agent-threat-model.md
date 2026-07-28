# Agent and feed-client threat model

## Scope

This document governs machine consumers of Vortik feeds and future agent integrations. It does not authorize autonomous writes, contacts, ENS operations, wallet access, commercial negotiation, or persistent memory.

## Trust boundaries

Trusted inputs are limited to versioned repository policy, reviewed code, validated local configuration, and explicit human approval. The following are always untrusted data:

- remote feed indexes and feeds;
- websites, emails, forms, comments and attachments;
- ENS text records and Agent Cards;
- tool outputs and responses from other agents;
- text contained inside otherwise valid schemas or instances.

Untrusted data cannot modify policy, permissions, tool access, memory rules, authority, commercial parameters or approval state.

## Primary threats

1. Indirect prompt injection embedded in summaries, metadata or linked content.
2. Source substitution, malicious mirrors and arbitrary-origin egress.
3. Path traversal through repository-relative feed paths.
4. Authority spoofing or semantic metadata divergence.
5. Tool-output poisoning and second-order injection.
6. Memory poisoning from externally supplied instructions.
7. Cross-agent privilege escalation and unauthorized actions.
8. Secret or private-strategy exfiltration.

## Current client controls

The reusable feed client:

- parses artifacts as JSON data and never executes text as instructions;
- requires the independent-registry authority boundary;
- verifies feed identity, contract version, schema and duplicated semantic metadata;
- rejects unexpected fields in index, registry metadata, entries, contracts, authority objects, feed envelopes and anchor metadata;
- treats the schema-defined `instance` payload as untrusted inert data rather than control instructions;
- restricts repository-relative paths to `feeds/<id>.json`;
- requires HTTPS for remote sources;
- rejects HTTP redirects;
- restricts remote feed egress to approved origins;
- returns cloned data and has no write, contact, wallet or persistence capability;
- fails closed when identity, provenance, authority or source policy is invalid.

The caller-provided index origin is trusted only because the caller selected it. That does not authorize the index to redirect consumption to arbitrary third-party origins. Additional feed origins require explicit allowlisting.

## Agent implementation requirements

Before any action-capable agent is deployed:

- isolate reader, evaluator and executor roles;
- use closed schemas for action requests and reject unknown fields;
- maintain explicit tool and network allowlists;
- keep secrets and commercial parameters outside model-visible context when not required;
- require human approval for writes, contacts, offers, publication, ENS changes and transactions;
- log provenance, structured decisions, tool calls and approvals without storing hidden reasoning;
- permit persistent memory only through sanitized, provenance-checked structured records;
- implement rate limits, idempotency, replay protection and request deduplication;
- test indirect injection, memory poisoning, tool-output poisoning, cross-agent escalation and exfiltration in a credential-free simulator.

## Defensive deception

Honeytokens, canaries or context bombs may be evaluated only in isolated private infrastructure as secondary detection controls. They must never be placed in public Vortik schemas, feeds, documentation, repository records or ENS records, and they must never reuse real secrets.

## Approval boundary

No external content can authorize an action. Any future action request must remain `pending_owner_approval` until a separately authenticated human approval is recorded.
