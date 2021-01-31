// unit test for use with bee builder

import { TestRun } from "../bee";

let testRun = new TestRun( "Demo" );
testRun.getLog().setLogSuccesses( true );

testRun.setup( () => {
  //
});

testRun.test( "demo2", () => {

  testRun.assertTrue( "demo2", false );
  
});

testRun.logSummary();



