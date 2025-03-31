import {
    Field,
    Provable,
    Gadgets,
    Bool
  } from 'o1js';

export function elementAtIndex(FieldArray: Field[], index: Field): Field {
    const length = FieldArray.length;
    let totalIndex = Field(0);
    let totalValues = Field(0);

    for (let i = 0; i < length; i++) {
      const isIndex = index.equals(i).toField(); // `1` if index matches, otherwise `0`
      const isValue = isIndex.mul(FieldArray[i]); // Multiply to retain only the matching element

      totalValues = totalValues.add(isValue); // Accumulate the value
      totalIndex = totalIndex.add(isIndex);   // Track if exactly one index matched
    }

    // Ensure that exactly one index matched
    const errorMessage = 'Invalid index: Index out of bounds or multiple indices match!';
    totalIndex.assertEquals(1, errorMessage);

    return totalValues;
}

export function booleanElementAtIndex(BoolArray: Bool[], index: Field): Bool {
    const length = BoolArray.length;
    let totalIndex = Field(0);
    let result = Bool(false);

    for (let i = 0; i < length; i++) {
      const isIndex = index.equals(i); // `1` if index matches, otherwise `0`
      const value = isIndex.and(BoolArray[i]); // Multiply to retain only the matching element

      result = result.or(value); // Accumulate the value
      totalIndex = totalIndex.add(isIndex.toField());   // Track if exactly one index matched
    }

    // Ensure that exactly one index matched
    const errorMessage = 'Invalid index: Index out of bounds or multiple indices match!';
    totalIndex.assertEquals(1, errorMessage);

    return result;
}

export function integerDivision(x: Field, y: Field): Field {
    const x_seal = x.seal();
    const y_seal = y.seal();
    const integerDivision = Provable.witness(
      Field,
      () => new Field(x_seal.toBigInt() / y_seal.toBigInt())
    );
    //Gadgets.rangeCheck64(integerDivision); //They say this check makes sure 99.99% the value is not floating point, and explain with probability theory

    return integerDivision;
  }

export function modulo(x: Field, y: Field): Field {

    const quotient = integerDivision(x, y);
    const answer = x.sub(y.mul(quotient));

    //Gadgets.rangeCheck64(answer);
    answer.assertLessThan(y);
    return answer;
  }