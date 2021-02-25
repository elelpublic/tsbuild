/**
 * A test run is one execution of multiple tests each with multiple assertions.
 * It will create a summary about all the tests and measure the runtime.
 * 
 */
class TestRun {

  name: string;
  setupCode: Function;
  cleanupCode: Function;
  log = new Log();
  sums = new Summary();
  results: Array<TestResult> = [];
  newLogging = !commandLine.classicLogging;
  currentTest: TestResult;

  constructor( name: string, quiet: boolean = false ) {
    this.name = name;
    this.log.setQuiet( quiet );
    if( !this.newLogging ) {
      this.log.log( "\n============================================" );
      this.log.log( "Run: " + name );  
    }
  }

  getLog(): Log {
    return this.log;
  }

  assertTrue( description: string, actual : boolean ) : void {
    let status = Status.UNTESTED;
    let message = description + ", expected: true, actual: " + actual;
    if( actual ) {
      let status = Status.SUCCESS;
      if( !this.newLogging ) {
        this.log.logOk( "OK: " + message );
      }
      this.sums.addSuccess();
    }
    else {
      let status = Status.FAILED;
      if( !this.newLogging ) {
        this.log.logFailure( "Failed: " + message );
      }
      this.sums.addFailure();
    }  
    this.currentTest.addAssertionResult( status, "true", message );
  }
  
  assertEqual( description: string, expected: any, actual : any ) : void {
    let status = Status.UNTESTED;
    let message = description + ", expected: " + expected + ", actual: " + actual;
    if( expected == actual ) {
      status = Status.SUCCESS;
      if( !this.newLogging ) {
        this.log.logOk( "OK: " + message );
      }
      this.sums.addSuccess();
    }
    else {
      status = Status.FAILED;
      if( !this.newLogging ) {
        this.log.logFailure( "Failed: " + message );
      }
      this.sums.addFailure();
    }  
    this.currentTest.addAssertionResult( status, "equal", message );
  }
  
  assertNull( description: string, value: any ) : void {
    let status = Status.UNTESTED;
    let message = description + ", expected null, actual: " + value;
    if( value == null ) {
      status = Status.SUCCESS;
      if( !this.newLogging ) {
        this.log.logOk( "OK: " + message );
      }
      this.sums.addSuccess();
    }
    else {
      status = Status.FAILED;
      if( !this.newLogging ) {
        this.log.logFailure( "Failed: " + description + ", expected: null, actual: " + value );
      }
      this.sums.addFailure();
    }  
    this.currentTest.addAssertionResult( status, "null", message );
  }

  assertNotNull( description: string, value: any ) : void {
    let status = Status.UNTESTED;
    let message = description + ", expected not null, actual: " + value;
    if( value != null ) {
      status = Status.SUCCESS;
      if( !this.newLogging ) {
        this.log.logOk( "OK: " + message );
      }
      this.sums.addSuccess();
    }
    else {
      status = Status.FAILED;
      if( !this.newLogging ) {
        this.log.logFailure( "Failed: " + message );
      }
      this.sums.addFailure();
    }  
    this.currentTest.addAssertionResult( status, "notnull", message );
  }

  setup( setupCode: Function ) {
    this.setupCode = setupCode;
  }
  
  cleanup( cleanupCode: Function ) {
    this.cleanupCode = cleanupCode;
  }

  /**
   * Perform the test of one feature or story.
   * Perform setup code before the test and cleanup code after the test.
   * 
   * @param testName Name of the feature or story or test
   * @param testCode The code containing the assertions
   * 
   */
  test( testName: string, testCode: Function ) {

    this.sums.countTest();
    if( !this.newLogging ) {
      this.log.log( "" );
      this.log.log( "--------------------------------------------" );
      this.log.log( "Test: " + testName );
    }

    this.currentTest = new TestResult( testName );
    this.results.push( this.currentTest );

    this.currentTest.start();

    let tt0 = new Date().getTime();

    try {

      try {
        if( this.setupCode != null ) {
          this.setupCode();
        }
      }
      catch( ex ) {
        if( !this.newLogging ) {
          this.log.logError( "Error in setup: " + testName + " " + ex );
        }
        this.sums.addError();
        this.currentTest.logError( "Error in setup: " + ex );
        return;
      }

      try {
        testCode();
      }
      catch( ex ) {
        if( !this.newLogging ) {
          this.log.logError( "Error: " + testName + " " + ex );
        }
        this.sums.addError();
        this.currentTest.logError( "Error in test: " + ex );
      }

      try {
        if( this.cleanupCode != null ) {
          this.cleanupCode();
        }
      }
      catch( ex ) {
        if( !this.newLogging ) {
          this.log.log( "Error in cleanup: " + testName + " " + ex );
        }
        this.currentTest.logError( "Error in cleanup: " + ex );
      }

    }
    finally {
      this.currentTest.stop();
      if( !this.newLogging ) {
        this.log.log( "Runtime " + (new Date().getTime() - tt0) + " ms" );
      }
      this.currentTest = null;
    }

  }

  getSummary() {
    return this.sums;
  }

  logSummary() {
    if( this.newLogging ) {
      for( let i = 0; i < this.results.length; i++ ) {
        let result = this.results[ i ];
        console.log( "" );
        console.log( "--------------------------------------------------------" );
        console.log( "Test " + i + " " + result.testName );
        console.log( "runtime: " + result.runTime + " ms" );
        console.log( "result: " + result.status );
        if( result.message ) {
          console.log( result.message );
        }
        for( let a = 0; a < result.assertions.length; a++ ) {
          let assertion = result.assertions[ a ];
          console.log( "Assert " + assertion.assertion + ": " + Status[ assertion.status ] + " " + assertion.message );
        }
      }
    }
    this.sums.log( this.log );
  }

  /**
   * Create a html report of test results
   * 
   */
  report( config: ReportConfig ) {

    if( config.type == Type.TEXT ) {

      let content = "";

      for( let i = 0; i < this.results.length; i++ ) {
        let result = this.results[ i ];
        content += "\n";
        content += "--------------------------------------------------------\n";
        content += "Test " + i + " " + result.testName + "\n";
        content += "runtime: " + result.runTime + " ms\n";
        content += "result: " + result.status + "\n";
        if( result.message ) {
          content += result.message + "\n";
        }
        if( config.showAssertionResults ) {
          for( let a = 0; a < result.assertions.length; a++ ) {
            let assertion = result.assertions[ a ];
            content += "Assert " + assertion.assertion + ": " + Status[ assertion.status ] + " " + assertion.message + "\n";
          }  
        }
      }
      let log = new Log();
      this.sums.log( log );
      content += log.getText();

      console.log( content );

    }
    else if( config.type == Type.HTML ) {

      let content = "<html>\n";
      content += "<head>\n";
      content += "<title>\n";
      content += "Test results for " + this.name;
      content += "</title>\n";
      content += "</head>\n";
      content += "<body>\n";
      content += "<h1>\n";
      content += "Test results for " + this.name;
      content += "</h1>\n";

      content += "<table border=1>\n";
      content += "<tr>\n";
      content += "<th>Name</th>\n";
      content += "<th>Runtime ms</th>\n";
      content += "<th>Status</th>\n";
      content += "<th>Successes</th>\n";
      content += "<th>Failures</th>\n";
      content += "<th>Errors</th>\n";
      content += "<th>Untested</th>\n";
      content += "</tr>\n";

      for( let i = 0; i < this.results.length; i++ ) {
        let result = this.results[ i ];

        content += "<tr>\n";
        content += "<th>" + result.testName + "</th>\n";
        content += "<th>" + result.runTime + "</th>\n";
        content += "<th>" + result.status + "</th>\n";

        let noAssertions = result.assertions.length;
        let noSuccesses = 0;
        let noFailures = 0;
        let noErrors = 0;
        let noUntested = 0;
        for( let a = 0; a < result.assertions.length; a++ ) {
          let assertion = result.assertions[ a ];
          if( assertion.status == Status.SUCCESS ) {
            noSuccesses++;
          }
          if( assertion.status == Status.FAILED ) {
            noFailures++;
          }
          if( assertion.status == Status.ERROR ) {
            noErrors++;
          }
          if( assertion.status == Status.UNTESTED ) {
            noUntested++;
          }

        }  

        content += "<th>" + noSuccesses + "</th>\n";
        content += "<th>" + noFailures + "</th>\n";
        content += "<th>" + noErrors + "</th>\n";
        content += "<th>" + noUntested + "</th>\n";
        content += "</tr>\n";
  
      }

      content += "</table>\n";

      content += "</body>\n";
      content += "</html>\n";

      let fs = require( 'fs' );
      fs.writeFileSync( config.file, content );

    }

  }

}

class Log {

  quiet = false;
  logSuccesses = false;
  text = "";

  log( line: string ) {
    if( !this.quiet ) {
      console.log( line );
      this.text += line + "\n";
    }
  }

  logOk( line: string ) {
    if( this.logSuccesses ) {
      this.log( "_____ " + line );
    }
  }
  
  logFailure( line: string ) {
    this.log( "##### " + line );
  }

  logError( line: string ) {
    this.log( "%%%%% " + line );
  }

  setQuiet( quiet: boolean ) {
    this.quiet = quiet;
  }

  setLogSuccesses( logSuccesses: boolean ) {
    this.logSuccesses = logSuccesses;
  }

  getText() {
    return this.text;
  }

}

class Summary {
  
  testCount = 0;
  successCount = 0;
  failureCount = 0;
  errorCount = 0;
  t0 = new Date().getTime();

  countTest() {
    this.testCount++;
  }

  addSuccess() {
    this.successCount++;
  }

  addFailure() {
    this.failureCount++;
  }

  addError() {
    this.errorCount++;
  }

  allOk() : boolean {
    return this.failureCount + this.errorCount == 0;
  }

  getSuccesses() {
    return this.successCount;
  }

  getFailures() {
    return this.failureCount;
  }

  getErrors() {
    return this.errorCount;
  }

  noTests(): boolean {
    return this.successCount + this.failureCount + this.errorCount == 0;
  }

  getTestCount(): number {
    return this.testCount;
  }

  log( log: Log ) {
    
    log.log( "" );
    log.log( "--------------------------------------------" );
    log.log( "Summary" );
    log.log( "" );
    log.log( "Sucessful assertions : " + this.successCount );
    log.log( "Failed assertions    : " + this.failureCount );
    log.log( "Errors               : " + this.errorCount );
    log.log( "--------------------------------------------" );
    log.log( "Total test           : " + this.testCount );
    log.log( "Total assertions     : " + ( this.successCount + this.failureCount + this.errorCount ) );
    log.log( "Total runtime        : " + ( new Date().getTime() - this.t0 ) + " ms" );
    log.log( "" );

    if( this.noTests() ) {
      log.log( "FAILED: No tests found." );
    }
    else if( this.allOk() ) {
      log.log( "SUCCESS: All OK" );
    }
    else {
      log.log( "FAILED: " + ( this.failureCount + this.errorCount ) + " Problem(s)." );
    }

    log.log( "============================================\n" );

  }

}
