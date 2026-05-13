export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
  build: string[];
}

export function parseSemver(version: string): SemVer | null {
  const regex = /^v?(\d+)\.(\d+)\.(\d+)(?:-([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/;
  const match = version.match(regex);

  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] ? match[4].split(".") : [],
    build: match[5] ? match[5].split(".") : [],
  };
}

export function formatSemver(semver: SemVer): string {
  let version = `${semver.major}.${semver.minor}.${semver.patch}`;
  if (semver.prerelease.length > 0) {
    version += `-${semver.prerelease.join(".")}`;
  }
  if (semver.build.length > 0) {
    version += `+${semver.build.join(".")}`;
  }
  return version;
}

export function compareSemver(a: string | SemVer, b: string | SemVer): number {
  const semverA = typeof a === "string" ? parseSemver(a) : a;
  const semverB = typeof b === "string" ? parseSemver(b) : b;

  if (!semverA || !semverB) {
    throw new Error("Invalid semver version");
  }

  if (semverA.major !== semverB.major) return semverA.major - semverB.major;
  if (semverA.minor !== semverB.minor) return semverA.minor - semverB.minor;
  if (semverA.patch !== semverB.patch) return semverA.patch - semverB.patch;

  const preA = semverA.prerelease;
  const preB = semverB.prerelease;

  if (preA.length === 0 && preB.length === 0) return 0;
  if (preA.length === 0) return 1;
  if (preB.length === 0) return -1;

  for (let i = 0; i < Math.min(preA.length, preB.length); i++) {
    const partA = isNaN(Number(preA[i])) ? preA[i] : Number(preA[i]);
    const partB = isNaN(Number(preB[i])) ? preB[i] : Number(preB[i]);

    if (partA !== partB) {
      if (typeof partA === "number" && typeof partB === "number") return partA - partB;
      if (typeof partA === "number") return -1;
      if (typeof partB === "number") return 1;
      return partA < partB ? -1 : 1;
    }
  }

  return preA.length - preB.length;
}

export function satisfies(version: string, range: string): boolean {
  const semver = parseSemver(version);
  if (!semver) return false;

  if (range === "*" || range === "x" || range === "") return true;

  const rangeRegex = /^(~|\^|>=?|<=?|=)?\s*v?(\d+|\*)(?:\.(\d+|\*)(?:\.(\d+|\*)(?:-([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?)?)?$/;
  const match = range.match(rangeRegex);

  if (!match) {
    if (range.startsWith(">=") || range.startsWith("<=") || range.startsWith(">") || range.startsWith("<")) {
      return compareRange(version, range);
    }
    return version === range;
  }

  const operator = match[1] || "=";
  const rawMajor = match[2];
  const rawMinor = match[3];
  const rawPatch = match[4];

  const major = rawMajor === "*" ? semver.major : parseInt(rawMajor, 10);
  const minor = rawMinor === "*" || rawMinor === undefined ? (rawMajor === "*" ? semver.minor : 0) : parseInt(rawMinor, 10);
  const patch = rawPatch === "*" || rawPatch === undefined ? (rawMinor === "*" || rawMinor === undefined ? (rawMajor === "*" ? semver.patch : 0) : 0) : parseInt(rawPatch, 10);

  switch (operator) {
    case "=":
      return semver.major === major && (rawMinor === "*" || semver.minor === minor) && (rawPatch === "*" || semver.patch === patch);
    case "~":
      return semver.major === major && semver.minor === minor && semver.patch >= patch;
    case "^":
      if (semver.major !== major) return false;
      if (major > 0) return true;
      if (rawMinor !== "*" && semver.minor !== minor) return false;
      if (minor > 0) return true;
      return rawPatch === "*" || semver.patch >= patch;
    case ">=":
      return semver.major >= major;
    case "<=":
      return semver.major <= major;
    case ">":
      return semver.major > major;
    case "<":
      return semver.major < major;
    default:
      return compareRange(version, range);
  }
}

function compareRange(version: string, range: string): boolean {
  const orParts = range.split("||").map(p => p.trim());
  for (const part of orParts) {
    const andParts = part.split(/\s+/);
    let matches = true;
    for (const p of andParts) {
      if (p === "*" || p === "" || p === "x") continue;
      const operator = p.match(/^(>=|<=|>|<|=)/)?.[0] || "=";
      const targetVersion = p.slice(operator.length).trim();
      const target = parseSemver(targetVersion);
      const current = parseSemver(version);
      if (!target || !current) return false;

      switch (operator) {
        case ">=": if (!(compareSemver(current, target) >= 0)) matches = false; break;
        case "<=": if (!(compareSemver(current, target) <= 0)) matches = false; break;
        case ">": if (!(compareSemver(current, target) > 0)) matches = false; break;
        case "<": if (!(compareSemver(current, target) < 0)) matches = false; break;
        case "=": if (!(compareSemver(current, target) === 0)) matches = false; break;
      }
    }
    if (matches) return true;
  }
  return false;
}

export function maxSatisfying(versions: string[], range: string): string | null {
  const satisfying = versions.filter(v => satisfies(v, range));
  if (satisfying.length === 0) return null;

  return satisfying.sort((a, b) => compareSemver(b, a))[0];
}

export function sortVersions(versions: string[], descending: boolean = true): string[] {
  const sorted = [...versions].sort((a, b) => compareSemver(a, b));
  return descending ? sorted.reverse() : sorted;
}
