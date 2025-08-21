export class Rng {
  private value: number;

  constructor(seed: number) {
    this.value = seed;
  }

  next(): number {
    this.value = (1664525 * this.value + 1013904223) % 0xffffffff;
    return this.value / 0xffffffff;
  }
}
