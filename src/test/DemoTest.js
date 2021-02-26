exports.test = function( bee ) {

  let testRun = bee.getTestRun();
  //testRun.newLogging = true;

  //let s: Superclass;

  // setup code will be performed before every test
  testRun.setup( () => {
    //s = new Superclass();
  });
  
  // cleanup code will be performed after every test
  testRun.cleanup( () => {
    //s.shutdown();
  });
  
  // a test has a name and may contain a number of assertions
  testRun.test( "Initialization", () => {
  
    testRun.assertTrue( "s should be empty", false );
    testRun.assertEqual( "size is 0 initially", 0, 0 );
    // testRun.assertNull( "result should be null", s.getResult() );
    // testRun.assertNotNull( "name should not be null", s.getName() );
  
  });
  
  // a test has a name and may contain a number of assertions
  testRun.test( "Exception", () => {

    throw "Error in test code"
  
  });

  // ... add more tests here
  
  // finally print some summary information about the tests
  let testReport = "target/testreport.html";
  testRun.logSummary();
  let config = {
    type: 1,
    file: testReport,
    showAssertionResults: true
  };
  testRun.report( config );
  bee.tasks.open.run( bee, { file: "target/testreport.html" });

}


// -----------------

// exports.test = function( bee ) {
//   console.log( "MyMath.sqrt OK" );
// }

// -----------------

// import { MyMath } from "./DemoCode";

// exports.test = function( bee ) {

//   let sqrt = new MyMath().sqrt( 4 );
//   if( sqrt == 16 ) {
//     console.log( "MyMath.sqrt OK" );
//   }
//   else {
//     throw "Error in MyMath.sqrt(...). Expected 16, found " + sqrt;
//   }
  
// }
