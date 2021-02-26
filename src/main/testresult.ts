enum Status {
  UNTESTED, SUCCESS, FAILED, ERROR
}

class Assertion {
  status: Status;
  assertion: string;
  message: string;
  constructor( status: Status, assertion: string, message: string ) {
    this.status = status;
    this.assertion = assertion;
    this.message = message;
  }
}

class TestResult {

  testName: string;
  startTime: number;
  runTime: number;
  status = Status.UNTESTED;
  message: string;
  assertions: Array<Assertion> = [];

  constructor( testName: string ) {
    this.testName = testName;
  }

  /**
   * Start test, record time
   * 
   */
  start() {
    this.startTime = new Date().getTime();
    this.status = Status.SUCCESS;
  }

  /**
   * Stop test, record time
   * 
   */
  stop() {
    this.runTime = new Date().getTime() - this.startTime;
  }

  /**
   * Store an assertion result
   * 
   * @param status Result status
   * @param assertion Name of assertion
   * @param message Description of specific assertion
   * 
   */
  addAssertionResult( status: Status, assertion: string, message: string ) {
    this.assertions.push( new Assertion( status, assertion, message  ) );
  }

}

