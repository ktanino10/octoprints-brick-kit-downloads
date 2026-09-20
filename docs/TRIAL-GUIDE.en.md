# Joint trials for the selected designs — not a manufacturing release

[日本語（original r2 guide）](../artifacts/selected/r2-20260919/TRIAL-GUIDE.md) / [English](TRIAL-GUIDE.en.md) ·
[Archive overview](../README.en.md)

This is the English companion to the original r2 trial guide. The original artifact guide and the documents inside the immutable
`archive-2026-09-19-r2` ZIP packages remain unchanged; this companion is provided separately.

> **Public-archive update, 2026-09-19:** The procedure below records the r2 prototype investigation.
> In the subsequent first physical trial of the 4 mm parts, the contributor reported “small and difficult to make” parts and holes filled with plastic.
> The holes were blocked **before** ultrasonic cleaning. The cause, actual slicer profile, retention, and condition-specific outcomes remain unknown.
> **Historical r2 guide: full-kit printing is ON HOLD.**
> The 8 mm common-block redesign was authorized on 2026-09-20, but these earlier trial files were not converted into that revision.
> Use the [revision registry](../archive/revisions.json) and [common-block guide](COMMON-BLOCKS.en.md) for the revised design's availability and separate physical gates.
> Read the [physical-feedback record](../feedback/2026-09-19/README.en.md) first.
> All files remain **NOT_SLICED**. This preserves the historical procedure; it is **not a current instruction to reprint**.

The selected designs are **Mona Fine 4 mm (13,434 parts), Copilot Chunky 8 mm (3,021 parts), and Ducky Fine 4 mm (10,311 parts)**.
This small trial is a separate physical gate from selecting a model for its appearance.
Do not proceed to printing the full models or their thousands of parts.

## What to test first

For each of the **4 mm and 8 mm families**, use the receivers for the four stated conditions and male keys from the **same family**.
Clearance means **the receiver's straight bore diameter minus the stud's straight stem diameter: a diameter difference**, not a per-side gap.

| Diameter difference | Nominal condition |
|---|---|
| −0.05 mm | Intentional interference |
| 0 mm | Equal nominal diameters |
| +0.10 mm | Positive clearance |
| +0.20 mm | Positive clearance; the loosest of the four |

The flared hole entrance and taper at the stud base are separate dimensions.
Cross-check the condition number against the files and BOM.
Begin with the loosest **+0.20 mm** condition. If it is tight, **stop rather than forcing it**.

Even when printing repeated instances of the same male-key type, use a fresh key for each condition in the first comparison
so that wear differences are not mixed into the result.
Do not mix the two families or substitute the historical **Phase1 6 mm coupons**.

## Printing assumptions

The material assumption is **PLA**. A **0.2 mm nozzle for the small 4 mm joints** and a **0.4 mm nozzle for the 8 mm joints**
were the starting assumptions for the trial.
These are **unsliced design assumptions**, not printing conditions validated with a manufacturer's profile.
If comparing the 4 mm geometry with a 0.4 mm nozzle, keep the same geometry and record that as a separate result.
Using a 0.2 mm nozzle does not eliminate thin-wall, breakage, or retention risks.

Receiver holes face **down**, as on the actual bricks; male studs face **up**; STL bottoms are at **z=0**.
Check for first-layer compression at the hole entrance, bridging at the roof, and formation of the base and thin stem.
The layout is only a geometric arrangement based on the P1S's nominal **256 × 256 mm** area.
Supports, orientation, and the first layer still require slicer inspection.
**Layer height, speed, temperature, supports, print time, and material quantity have not been validated. There is no G-code in the files.**

The [README's preparation procedure](../README.en.md#preparing-in-bambu-studio-on-another-pc) covers the legacy 4 mm, 11-part set:
select a real existing **P1S / 0.2 mm nozzle** preset and the actual plate and material,
stop if the correct preset is unavailable, and inspect the local layer preview.
Its 3MF is geometry-only, not a configured Bambu Studio project; the STL is an alternative, not an additional input.
**Do not load the 3MF and STL together, connect to a printer, or use Send/Print as part of this preparation.**

## Minimum observations to record

1. The actual nozzle diameter, PLA, profile, and layer height used.
2. For each condition number, whether the part reaches the seating pad without excessive force;
   note incomplete seating, play, or bottoming-out.
3. Whether the key falls out under its own weight when the receiver is gently turned upside down;
   whether cracks, stress whitening, or looseness appear after **5 insertion/removal cycles**.
4. Whether the receiver roof has been punctured or damaged. If possible, include the externally measurable stem diameter and photographs.

There is no need to force calipers into the small holes. Leave unmeasured values as **UNKNOWN**.
Results can be recorded in [fit-results-blank.csv](../artifacts/selected/r2-20260919/fit-results-blank.csv).
Purchases or specialized measuring instruments are not assumed.

## What does not count as a pass

CAD wall-thickness checks of at least 1.2 mm, closed meshes, nominal insertion paths, and contact graphs
do **not** establish physical strength or retention.
For the selected r2 4 mm joint, the inlet wall was revised from the old **0.877 mm** to **1.21 mm**;
the stud's **stem diameter is 1.10 mm, tip diameter 0.98 mm, and height 0.60 mm**.
These dimensions do not validate strength or retention.

Breakage or pull-out of the thin 1.10 mm stud, cumulative loads, impacts, and actual mass with the chosen infill remain unvalidated.
The small **3-part offset-joint trial** is an additional observation only after basic fit has been checked;
it is not a load test of the full model.

For Mona's **7 whisker-tip parts**, the recorded assembly sequence places the temporary support first,
rests the parts on it, and then assembles the upper parts.
Removing that support before retention has been checked is **not an approved procedure**.
The support is unnecessary for the first joint-only trial, but is required by the recorded Mona assembly sequence.

**Physical fit / retention / full physical assembly: UNKNOWN. Production: BLOCKED.**
