import {
  Field,
} from 'o1js';
import { MS, AdditionRecord } from './MS'; 


describe('MS Tests', () => {
  it('initialize an empty MS', () => {
    const ms = new MS();
  });

  it('add an element', () => {
      const ms = new MS();
      const element = Field(22);
      const random_num = Field.random();
      const timestamp = Field(0);
  
      ms.add( element, random_num);
  });

  it('add an element and probe', () => {
      const ms = new MS();
      const element = Field(22);
      const random_num = Field.random();
  
      const record = ms.add( element, random_num);
      const res = ms.verify_inclusion(element, record.index, random_num);
      res.assertEquals(true);
  });
  
  it('add, delete and verify', () => {
      const ms = new MS();
      const element = Field(22);
      const random_num = Field.random();

      const record = ms.add( element, random_num);
      ms.drop(element, record.index, random_num);
      const res = ms.verify_inclusion(element, record.index, random_num);
      res.assertEquals(false);
  });

  it('verify not included element', () => {
    const ms = new MS();
    const element = Field(22);
    const random_num = Field.random();

    const record = ms.add( element, random_num);
    const res = ms.verify_inclusion(element.add(1), record.index, random_num);
    res.assertEquals(false);
  });
});