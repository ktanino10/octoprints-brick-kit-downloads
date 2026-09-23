"""Independent set-valued load bookkeeping for the new bilateral revision only."""


def nonreset_support_loads(parts, checked_support_ids):
    if not isinstance(parts, list) or not parts:
        raise ValueError("The bilateral load ledger needs the actual nonempty assembly sequence")
    if (not isinstance(checked_support_ids, list) or not checked_support_ids
            or any(not isinstance(identifier, str) or not identifier for identifier in checked_support_ids)
            or len(set(checked_support_ids)) != len(checked_support_ids)):
        raise ValueError("Mechanically checked support IDs must be explicit and unique")
    checked = set(checked_support_ids)
    tokens, payloads, encounters = {}, {identifier: [] for identifier in checked_support_ids}, []
    for step, part in enumerate(parts, 1):
        identifier, dependencies = part.get("id"), part.get("support_ids")
        if (not isinstance(identifier, str) or not identifier or identifier in tokens
                or type(part.get("step")) is not int or part["step"] != step
                or not isinstance(dependencies, list)
                or any(not isinstance(lower, str) or lower not in tokens for lower in dependencies)
                or len(set(dependencies)) != len(dependencies)):
            raise ValueError("Load propagation requires every ID once and all direct supports strictly earlier")
        incoming = [tokens[lower] for lower in dependencies]
        contributors = set().union(*incoming)
        continuing = set(incoming[0]).intersection(*incoming[1:]) if incoming else set()
        for root in contributors:
            payloads[root].append(identifier)
        if identifier in checked:
            if contributors:
                encounters.append({
                    "part_id": identifier, "step": step,
                    "incoming_roots_counted_once": sorted(contributors),
                    "inherited_roots_continued": sorted(continuing),
                    "first_shared_receiver_roots": sorted(contributors - continuing),
                })
            continuing.add(identifier)
        tokens[identifier] = frozenset(continuing)
    if not checked <= tokens.keys():
        raise ValueError("The mechanical-support list names a missing physical part")
    for root, identifiers in payloads.items():
        if root in identifiers or len(set(identifiers)) != len(identifiers):
            raise ValueError("A local root bound duplicates a physical mass or counts its root twice")
    return {
        "mode": "SET_VALUED_EXCLUSIVE_SUPPORT_WITHOUT_ROOT_RESET",
        "payload_ids_in_actual_step_order": payloads,
        "new_support_encounters": encounters,
        "local_bounds_must_not_be_summed_as_global_mass": True,
        "is_native_contact_or_stability_approval": False,
    }
