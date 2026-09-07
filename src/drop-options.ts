import type { Boss, Scenario } from "./data.ts";

/** All targets stay discoverable even when the selected mode cannot drop them. */
export function dropOptions(boss: Boss, scenario: Scenario) {
  const names = [
    ...new Set(
      boss.scenarios.flatMap((s) => [
        ...s.drops.map((d) => d.name),
        ...(s.unmodelledDrops ?? []).map((d) => d.name),
      ]),
    ),
  ];
  return names.map((name) => {
    const drop = scenario.drops.find((d) => d.name === name);
    const unmodelled = scenario.unmodelledDrops?.find((d) => d.name === name);
    const scenarios = boss.scenarios
      .filter(
        (s) =>
          s.drops.some((d) => d.name === name) ||
          s.unmodelledDrops?.some((d) => d.name === name),
      )
      .map((s) => s.name);
    const available = !!drop || !!unmodelled;
    return {
      name,
      drop,
      unmodelled,
      available,
      scenarios,
      label: available
        ? `${name}${unmodelled ? " — rate not modelled" : ""}`
        : `${name} — unavailable in this scenario`,
    };
  });
}
