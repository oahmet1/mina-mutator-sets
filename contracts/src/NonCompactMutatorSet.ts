import {
    Field,
    SmartContract,
    UInt64,
    Struct,
    Poseidon,
    state,
    State,
    method,
    Circuit,
    Bool,
    Provable,
  } from 'o1js';
  

const MAX_ELEMENTS = 1;

export class AOCLWitness extends Struct({
    elementIndex: UInt64,
    message: Field,
    randomNumber: Field,
}) {}

export class AOCL extends Struct({
    numElements: UInt64,
    commitmentList: [Field, MAX_ELEMENTS]
  }) {
    constructor() {
      super({
        numElements: UInt64.zero,
        commitmentList: Array(MAX_ELEMENTS).fill(Field(0))
      });
    }

    add(message: Field): AOCLWitness {
        const random_num = Field.random();
        const commitment = Poseidon.hash([message, random_num]);

        const index = this.numElements;
        
        this.commitmentList[Number(index)] = commitment;
        this.numElements = this.numElements.add(UInt64.one);

        return new AOCLWitness({ elementIndex: index, message, randomNumber: random_num });
    }

    verify(witness: AOCLWitness): Bool {
        const index = Number(witness.elementIndex);

        const commitment = this.commitmentList[index];
        const expectedCommitment = Poseidon.hash([witness.message, witness.randomNumber]);
        
        return commitment.equals(expectedCommitment);
    }

}


const WINDOW_SIZE = 128; // Number of bits in the active window
const NUM_HASHES = 3; // Number of hash functions used
const STEP_SIZE = 32; // Step size for sliding window

export class SWBF extends Struct({
  bitArray: [Bool, WINDOW_SIZE],
  numElements: UInt64,
}) {
  constructor() {
    super({
      bitArray: Array(WINDOW_SIZE).fill(Bool(false)),
      numElements: UInt64.zero,
    });
  }

  /**
   * Hash function to map items to bit positions.
   */
  static hashToIndex(item: Field, salt: number): number {
    const modulo = Poseidon.hash([item, Field(salt)]).toBigInt() % BigInt(WINDOW_SIZE);
    return Number(modulo);
  }

  /**
   * Adds an item to the filter.
   */
  add(item: Field): void {
    for (let i = 0; i < NUM_HASHES; i++) {
      const index = SWBF.hashToIndex(item, i);
      this.bitArray[index] = Bool(true);
    }
    this.numElements = this.numElements.add(UInt64.one);
    
    // Slide window every STEP_SIZE elements
    if (this.numElements.toBigInt() % BigInt(STEP_SIZE) === BigInt(0)) {
      this.slideWindow();
    }
  }

  /**
   * Checks if an item might be in the filter.
   * False positives are possible, but false negatives are not.
   */
  query(item: Field): Bool {
    let result = Bool(true);
    for (let i = 0; i < NUM_HASHES; i++) {
      const index = SWBF.hashToIndex(item, i);
      result = result.and(this.bitArray[index]);
    }
    return result;
  }

  /**
   * Slides the window forward, clearing old bits.
   */
  slideWindow(): void {
    for (let i = 0; i < STEP_SIZE; i++) {
      this.bitArray[i] = Bool(false);
    }
    this.bitArray = [...this.bitArray.slice(STEP_SIZE), ...Array(STEP_SIZE).fill(Bool(false))];
  }
}

