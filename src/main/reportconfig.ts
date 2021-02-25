/**
 * Configuration of test report
 * 
 */

class ReportConfig {

  type: Type = Type.TEXT;
  file: string = "target/testreport.txt";
  showAssertionResults: true;

}

enum Type {
    TEXT, HTML
}
