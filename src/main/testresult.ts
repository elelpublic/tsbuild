enum Status {
  UNTESTED, SUCCESS, FAILED, ERROR
}

function statusName( status: Status ) : String {
  return Status[ status ];
}

/**
 * Collect a compound status by adding states of partial executions
 * 
 * @param totalStatus Total compound status 
 * @param status Status to be added to total
 * 
 */
function addStatus( totalStatus: Status, status: Status ) : Status {
  if( totalStatus == Status.UNTESTED ) {
    return status;
  }
  else if( status == Status.ERROR ) {
    return status;
  }
  else if( status == Status.FAILED ) {
    return totalStatus == Status.ERROR ? Status.ERROR : Status.FAILED;
  }
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

