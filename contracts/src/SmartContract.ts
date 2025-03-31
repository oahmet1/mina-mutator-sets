import {
    SmartContract,
    Field,
    State,
    state,
    method,
    Poseidon,
  } from 'o1js';

import {AOCL, AOCLReturn} from './AOCL';
import { SWBF, SWBFReturn } from './SWBF';

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

  }