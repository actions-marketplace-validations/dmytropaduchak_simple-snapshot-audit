export type Severity = "high" | "medium" | "low";
export type Finding = {
  ruleId: string;
  severity: Severity;
  title: string;
  detail: string;
  file: string;
  line?: number;
};

export function parseDiffHunks(diff: string): Array<{ file: string; line: number; text: string }> {
  const out: Array<{ file: string; line: number; text: string }> = [];
  let file = "unknown";
  let newLine = 0;
  for (const raw of diff.split(/\r?\n/)) {
    if (raw.startsWith("+++ b/")) { file = raw.slice(6).trim() || "unknown"; continue; }
    if (raw.startsWith("@@")) { const m = raw.match(/\+(\d+)/); newLine = m ? Number(m[1]) : 0; continue; }
    if (raw.startsWith("+") && !raw.startsWith("+++")) { out.push({ file, line: newLine, text: raw.slice(1) }); newLine += 1; continue; }
    if (raw.startsWith("-") && !raw.startsWith("---")) continue;
    if (!raw.startsWith("\\") && !raw.startsWith("diff ") && !raw.startsWith("index ")) newLine += 1;
  }
  return out;
}

export function changedFiles(diff: string): string[] {
  const files = new Set<string>();
  for (const line of diff.split(/\r?\n/)) {
    if (!line.startsWith("+++ b/")) continue;
    const file = line.slice(6).trim();
    if (file && file !== "/dev/null") files.add(file);
  }
  return [...files];
}

const SNAP = /\.(snap|shot)$|[/\\]__snapshots__[/\\]/i;
const TEST = /\.(test|spec)\.[jt]sx?$|[/\\]__tests__[/\\]/i;

export function scan(diff: string): Finding[] {
  const files = changedFiles(diff);
  const snaps = files.filter((f) => SNAP.test(f));
  if (!snaps.length) return [];
  const tests = files.filter((f) => TEST.test(f));
  if (tests.length) return [];
  return snaps.map((file) => ({
    ruleId: "orphan-snapshot",
    severity: "medium",
    title: `Snapshot changed without test file: ${file}`,
    detail: "Update or review the owning test alongside the snapshot",
    file,
  }));
}
