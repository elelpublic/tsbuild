// unit test for use with bee builder

export function run() {

  let testRun = new TestRun( "Demo" );
  testRun.getLog().setLogSuccesses( true );
  
  testRun.setup( () => {
    //
  });
  
  testRun.test( "demo1", () => {
  
    testRun.assertTrue( "demo1", false );
    
  });
  
  testRun.logSummary();
  
}




