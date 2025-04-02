import {
    SmartContract,
    Field,
    State,
    state,
    method,
    Poseidon,
    Bool,
    Struct
  } from 'o1js';

import {AOCL, AOCLReturn} from './AOCL';
import { SWBF, SWBFReturn } from './SWBF';
import { AdditionRecord, MS } from './MS';

class MSReturn extends Struct({
  ms: MS,
  additionRecord : AdditionRecord,
}) {
  constructor(ms: MS, ar: AdditionRecord) {
    super({ ms : ms, additionRecord : ar });
  }
}


export class DataStructures extends SmartContract {
    events = {
        "add-merkle-leaf": Field,
        "update-merkle-leaf": Field,
    }

    // we store the last commitment
    @state(Field) commitment = State<Field>();
  
    @method async init() {
      super.init();
      this.commitment.set(Field(0));
    }

    @method async add_element_aocl(aocl : AOCL, message: Field, random: Field) {
      let aoclReturn : AOCLReturn = aocl.add(message, random);
      this.commitment.set(aoclReturn.commitment);
    }
    @method async verify_element_aocl(aocl : AOCL, message: Field, index : Field, random: Field) {
      let aoclReturn : AOCLReturn = aocl.add(message, random);
      let res = aocl.verify(message, index, random);
      return res.assertEquals(true);
    }
    @method async add_element_swbf(swbf : SWBF, message: Field,  timestamp: Field, random: Field) {
      let swbfReturn : SWBFReturn = swbf.add(message, timestamp, random);
      this.commitment.set(Poseidon.hash(swbfReturn.indices));
    }
    @method async probe_element_swbf(swbf : SWBF, message: Field,  timestamp: Field, random: Field) {
      let swbfReturn : SWBFReturn = swbf.add(message, timestamp, random);
      let res = swbf.probe(message, timestamp, random);
      return res.assertEquals(true);
    }
    @method.returns(MSReturn) async add_element_ms(ms : MS, message: Field, random: Field)  {
      let aoclReturn : AdditionRecord = ms.add(message, random);
      ms.verify_inclusion(message, aoclReturn.index, random).assertEquals(true);
      let res = new MSReturn(ms, aoclReturn);
      return res;
    }
    @method async delete_element_ms(ms : MS, message: Field, index : Field, random: Field) {
      ms.verify_inclusion(message, index, random).assertEquals(true);
      let res = ms.drop(message, index, random);
      ms.verify_inclusion(message, index, random).assertEquals(false);
    }
    @method.returns(Bool) async check_inclusion_ms(ms : MS, message: Field,  timestamp: Field, random: Field) {
      let res : Bool = ms.verify_inclusion(message, timestamp, random);
      return res;
    }


  }