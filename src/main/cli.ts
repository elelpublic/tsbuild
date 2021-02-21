/**
 * Command Line Interface
 * 
 */

interface Process {
  argv: string[]
}

class CommandLine {
  isEmpty = true;
  targets = [];
  runDefaultTarget = false;
  showProjectInformation = false;
  showDependencies = false;
  showInternalTargets = false;
  nodeps = false;
  nofail = false;
  verbose = false;
  listTasks = false;
  targetFile: string;
  describeTask: string;
  showHelp = false;
}

/**
 * Parse command line arguments in to an object for easy access
 * 
 */
function parseCommandLine() : CommandLine {

  let commandLine = new CommandLine();

  let currentParamName = null;

  for( let i = 2; i < process.argv.length; i++ ) {
    commandLine.isEmpty = false;
    let arg = process.argv[ i ];
    if( currentParamName == null ) {
      if( arg == "-f" ) {
        currentParamName = "targetFile"
        commandLine.targets = [];
      }
      else if( arg == "-d" ) {
        commandLine.runDefaultTarget = true;
      }
      else if( arg == "-p" ) {
        commandLine.showProjectInformation = true;
      }
      else if( arg == "-pp" ) {
        commandLine.showProjectInformation = true;
        commandLine.showDependencies = true;
      }
      else if( arg == "-ppp" ) {
        commandLine.showProjectInformation = true;
        commandLine.showDependencies = true;
        commandLine.showInternalTargets = true;
      }
      else if( arg == "--nodeps" ) {
        commandLine.nodeps = true;
      }
      else if( arg == "--nofail" ) {
        commandLine.nofail = true;
      }
      else if( arg == "-v" ) {
        commandLine.verbose = true;
      }
      else if( arg == "-t" ) {
        commandLine.listTasks = true;
        currentParamName = "describeTask"
      }
      else if( arg == "-h" ) {
        commandLine.showHelp = true;
      }
      else {
        commandLine.targets.push( arg );
      }
    }
    else {
      commandLine[ currentParamName ] = arg;
      currentParamName = null;
    }
  }

  return commandLine;

}

