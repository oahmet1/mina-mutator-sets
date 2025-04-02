import {
    Field,
  } from 'o1js';
  import { SWBF, SWBFReturn } from './SWBF'; 
  
  
  describe('SWBF Tests', () => {
    it('initialize an empty SWBF', () => {
      const swbf = new SWBF();
    });
  
    it('add an element', () => {
        const swbf = new SWBF();
        const element = Field(22);
        const random_num = Field.random();
        const timestamp = Field(0);
    
        swbf.add( element,timestamp, random_num);
    });
  
    it('add an element and probe', () => {
        const swbf = new SWBF();
        const element = Field(22);
        const random_num = Field.random();
        const timestamp = Field(0);
    
        swbf.add( element,timestamp, random_num);
        const res = swbf.probe(element, timestamp, random_num);
        res.assertEquals(true);
    });
    
    it('add an element but probe wrong timestep', () => {
        const swbf = new SWBF();
        const element = Field(22);
        const random_num = Field.random();
        const timestamp = Field(0);
        const wrongTimestamp = Field(1);
    
        swbf.add( element,timestamp, random_num);
        const res = swbf.probe(element, wrongTimestamp, random_num);
        res.assertEquals(false);
    });
  });