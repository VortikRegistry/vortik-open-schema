# commitmentlayer.eth

Semantic anchor representing commitment signaling layers used in preconfirmation coordination.

## Context

Commitment layers describe mechanisms through which block producers signal inclusion commitments before final block publication on Ethereum L1.

These commitments may provide early guarantees about transaction ordering or inclusion while maintaining compatibility with the protocol’s security model.

Research in this area explores how proposers, builders, relays and sequencing infrastructure communicate commitments without undermining censorship resistance or fork-choice safety.

## Registry Role

- Track terminology describing commitment signaling surfaces
- Distinguish commitment mechanisms from latency networks and execution routing layers
- Document naming convergence around proposer commitments and preconfirmation coordination

## Associated ENS Anchor

`commitmentlayer.eth`

## Status

Active research surface (not a canonical L1 primitive today)

## Notes

Commitment layers are closely related to preconfirmation networks but represent the signaling layer rather than the latency infrastructure itself.

## Sources

Primary research sources and terminology references are documented in:

`schemas/commitmentlayer/`
