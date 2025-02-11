// mmr.test.ts

import {
    Field,
    UInt64,
    Poseidon,
    Provable,
  } from 'o1js';
  import { AOCL, AOCLWitness } from './AOCL'; 
  
  
  describe('AOCL Tests', () => {
    it('initialize an empty AOCL', () => {
      const aocl = new AOCL();
      expect(aocl.numElements).toEqual(UInt64.zero);
    });
  
    it('add an element and check number of elements', () => {
      const aocl = new AOCL();
      const witness = aocl.add(Field(10));
  
      expect(aocl.numElements).toEqual(UInt64.from(1));
    });
  
  
    it('generate and verify a proof for an element', () => {
      const aocl = new AOCL();
      const witness = aocl.add(Field(10));
   
      // Verify the proof
      const isValid = aocl.verify(witness); // values[1] corresponds to Field(20)
      expect(isValid.toBoolean()).toBe(true);
    });
    
  
    it('fail verification for incorrect proof', () => {
      const aocl = new AOCL();
      const witness = aocl.add(Field(10));
      witness.message = Field(20);
      const isValid = aocl.verify(witness);
      expect(isValid.toBoolean()).toBe(false);
    });

  });