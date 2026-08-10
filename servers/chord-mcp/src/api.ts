export class ChordError extends Error {}

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const ALIAS: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#", "Cb": "B", "F#": "F#", "E#": "F" }

const CHORDS: Record<string, number[]> = {
  maj: [0, 4, 7], min: [0, 3, 7], "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10],
  dim: [0, 3, 6], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7], "6": [0, 4, 7, 9], min6: [0, 3, 7, 9],
}
const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10], harmonic_minor: [0, 2, 3, 5, 7, 8, 11], pentatonic: [0, 2, 4, 7, 9],
}

function rootIndex(root: string): number {
  const r = ALIAS[root] ?? root
  const i = NOTES.indexOf(r)
  if (i < 0) throw new ChordError(`Unknown root note ${root}`)
  return i
}

export async function chordNotes(args: { root?: string; chord?: string }): Promise<string> {
  const root = (args.root ?? "").trim()
  if (!root) throw new ChordError("Provide a root note like C or F#")
  const type = (args.chord ?? "maj").toLowerCase()
  const intervals = CHORDS[type]
  if (!intervals) throw new ChordError(`Unknown chord type ${type}. Use ${Object.keys(CHORDS).join(", ")}`)
  const r = rootIndex(root)
  const notes = intervals.map((iv) => NOTES[(r + iv) % 12])
  return `${root}${type === "maj" ? "" : type}: ${notes.join(" - ")}`
}

export async function scaleNotes(args: { root?: string; scale?: string }): Promise<string> {
  const root = (args.root ?? "").trim()
  if (!root) throw new ChordError("Provide a root note")
  const scale = (args.scale ?? "major").toLowerCase()
  const intervals = SCALES[scale]
  if (!intervals) throw new ChordError(`Unknown scale ${scale}. Use ${Object.keys(SCALES).join(", ")}`)
  const r = rootIndex(root)
  const notes = intervals.map((iv) => NOTES[(r + iv) % 12])
  return `${root} ${scale}: ${notes.join(" - ")}`
}
