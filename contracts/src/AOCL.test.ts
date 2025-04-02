import {
    Field,
    UInt64,
    Poseidon,
    Provable,
  } from 'o1js';
  import { AOCL, AOCLReturn } from './AOCL'; 
  
  
  describe('AOCL Tests', () => {
    it('initialize an empty AOCL', () => {
      const aocl = new AOCL();
      expect(aocl.numElements).toEqual(Field(0));
    });
  
    it('add an element and check number of elements', () => {
      const aocl = new AOCL();
      const randomNumber = Field.random();
      const witness = aocl.add(Field(10), randomNumber);
      expect(aocl.numElements).toEqual(Field(1));
    });
  
  
    it('generate and verify a proof for an element', () => {
      const aocl = new AOCL();
      const randomNumber = Field.random();
      const aocl_return = aocl.add(Field(20), randomNumber);
   
      // Verify the proof
      const isValid = aocl.verify(Field(20),aocl_return.elementIndex, aocl_return.randomNumber);    // values[1] corresponds to Field(20)
      expect(isValid.toBoolean()).toBe(true);
    });
    
    it('fail verification for incorrect proof', () => {
      const aocl = new AOCL();
      const randomNumber = Field.random();
      const aocl_return = aocl.add(Field(10), randomNumber);
   
      // Verify the proof
      const isValid = aocl.verify(Field(20),aocl_return.elementIndex, aocl_return.randomNumber);    // values[1] corresponds to Field(20)
      expect(isValid.toBoolean()).toBe(false);
    });

  });