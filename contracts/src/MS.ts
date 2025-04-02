import {
    Field,
    Struct,
    Poseidon,
    Bool,
  } from 'o1js';

import { AOCL, AOCLReturn } from './AOCL';
import { SWBF } from './SWBF';

export class AdditionRecord extends Struct({
  index : Field,
  randomNumber : Field,
}) {}

export class MS extends Struct({
  aocl: AOCL,
  swbf : SWBF
}) {
  constructor() {
    super({
      aocl : new AOCL(),
      swbf : new SWBF()
    });
  }

  add(message: Field, randomNumber: Field): AdditionRecord {
    const addition_rec : AOCLReturn =  this.aocl.add(message, randomNumber);
    return new AdditionRecord({index : addition_rec.elementIndex, randomNumber : addition_rec.randomNumber});
  }

  drop(message: Field, index: Field, randomNumber: Field) {
    // Make sure we are deleting an element that was added
    this.aocl.verify(message, index, randomNumber).assertEquals(true);
    // Delete the element
    this.swbf.add(message, index, randomNumber);
  }

  verify_inclusion(message: Field, index: Field, randomNumber: Field): Bool {
    const added = this.aocl.verify(message, index, randomNumber);
    const deleted = this.swbf.probe(message, index, randomNumber);
    return added.and(deleted.not());
  }

}

