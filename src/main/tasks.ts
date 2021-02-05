/**
 * A parameter defines one unit of input to a task
 */
class Parameter {
  name: string;
  description: string;
  type: string;
  optional = false;
  constructor( name: string, description: string, type: string, optional: boolean ) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.optional = optional;
  }
}

/**
 * A task can return ok, warning or error along with some text message
 */
class TaskResult {
  error = false;
  warning = false;
  ok: () => boolean = function() {
    return !this.error;
  };
  message: string;
  constructor( error: boolean, warning: boolean, message: string ) {
    this.error = error;
    this.warning = warning;
    this.message = message;
  }
  static OK = function() { return new TaskResult( false, false, null ) };
  static Message( message: string ) { return new TaskResult( false, false, message ) };  
  static Warning( message: string ) { return new TaskResult( false, true, message ) };  
  static Error( message: string ) { return new TaskResult( true, false, message ) };  
}

/**
 * A task is one operation which bee can perform
 */
class Task {
  description: string;
  parameters: Array<Parameter>;
  
  //run: Function;

  run: ( input ) => TaskResult;
  
  // run: function( config ) {
  //   bee.node.run( config );
  // }
  
  constructor( description: string, parameters: Array<Parameter>, run: ( input ) => TaskResult ) {
    this.description = description;
    this.parameters = parameters;
    this.run = run;
  }
}


let bee = {

  exec: new Task(
    "Execute a shell command.",
    [ new Parameter( "command", "Complete command line to be executed", "string", false ) ],
    function( input ) {
      let command;
      if( typeof input === 'string' || input instanceof String ) {
        command = "" + input;
      }
      else {
        command = input.command;
      }
      const { execSync } = require("child_process");
      try {
        if( commandLine.verbose ) {
          console.log( "Shell command: " + command );
        }
        let output = execSync( command );
        if( output ) {
          console.log( "" + output );
        }
      }
      catch( error ) {
        if( error.status ) {
          console.log( "Return code: " + error.status );
        }
        if( error.message ) {
          console.log( error.message );
        }
        if( error.stdout ) {
          console.log( "" + error.stdout );
        }
        if( error.stderr ) {
          console.log( "" + error.stderr );
        }
      }
      return TaskResult.OK();
    }

  ),
  
  tsc: new Task(
    "Compile typescript source file.",
    [
      new Parameter( "file", "File or wildcard of files to compile", "string", true ),
      new Parameter( "files", "List of files to compile", "string", true ),
      new Parameter( "outDir", "Target directory for compiles js files", "string", true ),
      new Parameter( "outFile", "Target javascript file", "string", true )
    ],
    function( config ) {
      let file = "";
      let outDir = "";
      if( config ) {
        if( config.file ) {
          file = " " + config.file;
        }
        if( config.files ) {
          for( let i = 0; i < config.files.length; i++ ) {
            file += " " + config.files[ i ];
          }
        }
        if( config.outDir ) {
          outDir = " -outDir " + config.outDir;
        }
        else if( config.outFile ) {
          outDir = " -outFile " + config.outFile;
        }
      }
      bee.exec.run( "tsc" + file + outDir );
      return TaskResult.OK();
    }
  ),
  
  node: new Task(
    "Call a node script.",
    [
      new Parameter( "file", "File name of node script", "string", false )
    ],
    function( config ) {
      if( !config || !config.file ) {
        message( "Error: no test script specified" );
      }
      else {
        bee.exec.run( "node " + config.file );
      }
      return TaskResult.OK();
    }
  ),
  
  test: new Task(
    "Perform unit tests.",
    [
      new Parameter( "file", "File name of unit test script", "string", false )
    ],
    function( config ) {
      bee.node.run( config );
      return TaskResult.OK();
    }
  ),
  
  rmdir: new Task(
    "Delete a directory and all its content.",
    [
      new Parameter( "dir", "Name of a directory below the project directory.", "string", false )
    ],
    function( config ) {
      if( !config.dir ) {
        throw "Error: missing parameter config.dir";
      }
      else {
        const path = require( 'path' );
        let workdir = path.resolve( "." );
        let deletedir = path.resolve( config.dir );
        if( !deletedir.startsWith( workdir ) ) {
          throw "Error: rmdir is not allowed outside of working directory."
        }
        bee.exec.run( "rm -r " + deletedir );
      }
      return TaskResult.OK();
    }
  )
  
}
