import { DataStructures } from './SmartContract';
import { AOCL, AOCLReturn } from './AOCL';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate,SmartContract,
    Poseidon, State,state,method,UInt32, UInt64 } from 'o1js';
import { elementAtIndex } from './utils';
import { SWBF, SWBFReturn } from './SWBF';


let proofsEnabled = true;

describe('Data Structures Test ', () => {
  let 
    contract: DataStructures,
    initialBalance = 10_000_000_000,
    contractAccount: Mina.TestPublicKey,
    feePayer : Mina.TestPublicKey;
    
  beforeAll(async () => {
    
    let Local = await Mina.LocalBlockchain({ proofsEnabled: proofsEnabled });
    Mina.setActiveInstance(Local);

    [feePayer] = Local.testAccounts;
    contractAccount = Mina.TestPublicKey.random();

    contract = new DataStructures(contractAccount);

    // check how many rows are generated
    //const res_analyzemethods = await AOCL_Update.analyzeMethods()
    //console.log('The result of the analyze methods is: ', res_analyzemethods );
    
    console.log('Compiling the smart contract');
    if (proofsEnabled) {
      await DataStructures.compile();
    }

  });

  it('generates and deploys the smart contract', async () => {
    let tx = await Mina.transaction(feePayer, async () => {
      AccountUpdate.fundNewAccount(feePayer).send({
        to: contractAccount,
        amount: initialBalance,
      });
      await contract.deploy();
    });
    await tx.prove();
    await tx.sign([feePayer.key, contractAccount.key]).send();
  });
/*
  it('add an element to the AOCL', async () => {
    let aocl = new AOCL();
    const random_num = Field.random();

    let tx = await Mina.transaction(feePayer, async () => {
        let res = await contract.add_element_aocl(aocl, Field(22), random_num);
      });

    await tx.prove();
    await tx.sign([feePayer.key, contractAccount.key]).send();

    aocl.add(Field(22), random_num);
    await contract.commitment.get().assertEquals(elementAtIndex(aocl.commitmentList, Field.from(0)));
  });

  it('check the verify method', async () => {
    let aocl = new AOCL();
    const random_num = Field.random();

    let tx = await Mina.transaction(feePayer, async () => {
        let res = await contract.add_element_aocl(aocl, Field(22), random_num);
        let res2 = await contract.verify_element_aocl(aocl, Field(22), Field(0), random_num);
      });

    await tx.prove();
    await tx.sign([feePayer.key, contractAccount.key]).send();
  });
*/
  it('add an element to the SWBF', async () => {
    let swbf = new SWBF();
    const random_num = Field.random();
    const timestamp = Field(0);

    let tx = await Mina.transaction(feePayer, async () => {
        let res = await contract.add_element_swbf(swbf, Field(22),timestamp, random_num);
      });

    await tx.prove();
    await tx.sign([feePayer.key, contractAccount.key]).send();

    const indices : SWBFReturn = swbf.add(Field(22), timestamp, random_num);
    await contract.commitment.get().assertEquals(Poseidon.hash(indices.indices));
  });

  it('check the probe method', async () => {
    let swbf = new SWBF();
    const random_num = Field.random();
    const timestamp = Field(0);

    let tx = await Mina.transaction(feePayer, async () => {
        let res = await contract.add_element_swbf(swbf, Field(22),timestamp, random_num);
        let res2 = await contract.probe_element_swbf(swbf, Field(22),timestamp, random_num);
      });

    await tx.prove();
    await tx.sign([feePayer.key, contractAccount.key]).send();
  });

  it('probe wrong indices', async () => {
    let swbf = new SWBF();
    const random_num = Field.random();
    const timestamp = Field(0);

    let tx = await Mina.transaction(feePayer, async () => {
        let res = await contract.add_element_swbf(swbf, Field(22),timestamp, random_num);
        let res2 = await contract.probe_element_swbf(swbf, Field(22),timestamp, random_num);
      });

    await tx.prove();
    await tx.sign([feePayer.key, contractAccount.key]).send();
  });




});