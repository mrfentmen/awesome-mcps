export class MidiError extends Error {}

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const A4 = 440

export async function noteName(args: { midi?: number }): Promise<string> {
  const m = Math.round(args.midi ?? -1)
  if (m < 0 || m > 127) throw new MidiError("MIDI note must be 0 to 127")
  return `${m}: ${NAMES[m % 12]}${Math.floor(m / 12) - 1}`
}

export async function noteFrequency(args: { midi?: number }): Promise<string> {
  const m = Math.round(args.midi ?? -1)
  if (m < 0 || m > 127) throw new MidiError("MIDI note must be 0 to 127")
  const freq = A4 * Math.pow(2, (m - 69) / 12)
  return `${m} (${NAMES[m % 12]}${Math.floor(m / 12) - 1}): ${freq.toFixed(2)} Hz`
}

export async function noteFromName(args: { name?: string }): Promise<string> {
  const name = (args.name ?? "").trim()
  const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(name)
  if (!m) throw new MidiError("Provide a note like C4 or F#3")
  let n = NAMES.indexOf(m[1].toUpperCase())
  if (m[2] === "#") n += 1
  if (m[2] === "b") n -= 1
  const midi = (Number(m[3]) + 1) * 12 + ((n % 12) + 12) % 12
  const freq = A4 * Math.pow(2, (midi - 69) / 12)
  return `${name}: MIDI ${midi}, ${freq.toFixed(2)} Hz`
}
