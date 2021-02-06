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
  tasks: Tasks;
  description: string;
  parameters: Array<Parameter>;
  
  //run: Function;

  run: ( input ) => TaskResult;
  
  // run: function( config ) {
  //   bee.node.run( config );
  // }
  
  constructor( tasks: Tasks, description: string, parameters: Array<Parameter>, run: ( input ) => TaskResult ) {
    this.tasks = tasks;
    this.description = description;
    this.parameters = parameters;
    this.run = run;
  }
}


class Tasks {
  
  exec: Task;
  node: Task;
  tsc: Task;
  test: Task;
  rmdir: Task;

  constructor() {

    let tasks = this;

    this.exec = new Task(

      tasks,
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
        
        let result = TaskResult.OK();
    
        const { execSync } = require("child_process");
        try {
          if( commandLine.verbose ) {
            console.log( "Shell command: " + command );
          }
          let output = execSync( command );
          if( output ) {
            result = TaskResult.Message( "" + output );
          }
        }
        catch( error ) {
          let message = "";
          if( error.status ) {
            message += "Return code: " + error.status + "\n";
          }
          if( error.message ) {
            message += error.message + "\n";
          }
          if( error.stdout ) {
            message += error.stdout + "\n";
          }
          if( error.stderr ) {
            message += error.stderr + "\n"
          }
          result = TaskResult.Error( message );
        }
        return result;
      }
    
    );
    
    this.tsc = new Task(
      tasks,
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
        return tasks.exec.run( "tsc" + file + outDir );
      }
    );
    
    this.node = new Task(
      tasks,
      "Call a node script.",
      [
        new Parameter( "file", "File name of node script", "string", false )
      ],
      function( config ) {
        if( !config || !config.file ) {
          return TaskResult.Error( "Error: no test script specified" );
        }
        else {
          return tasks.exec.run( "node " + config.file );
        }
      }
    );
    
    
    this.test = new Task(
      tasks,
      "Perform unit tests.",
      [
        new Parameter( "file", "File name of unit test script", "string", false )
      ],
      function( config ) {
        return tasks.node.run( config );
      }
    );
    
    this.rmdir = new Task(
      tasks,
      "Delete a directory and all its content.",
      [
        new Parameter( "dir", "Name of a directory below the project directory.", "string", false )
      ],
      function( config ) {
        if( !config.dir ) {
          return TaskResult.Error( "Error: missing parameter config.dir" );
        }
        else {
          const path = require( 'path' );
          let workdir = path.resolve( "." );
          let deletedir = path.resolve( config.dir );
          if( !deletedir.startsWith( workdir ) ) {
            throw "Error: rmdir is not allowed outside of working directory."
          }
          return tasks.exec.run( "rm -r " + deletedir );
        }
      }
    );
    
  }
};

class Bee {
  commandLine: CommandLine;
  constructor( commandLine: CommandLine ) {
    this.commandLine = commandLine;
  }
  tasks = new Tasks();
  run = function( result: TaskResult ) {
    if( result.error ) {
      let message = "Error";
      if( result.message ) {
        message = result.message;
      }
      if( this.commandLine.nofail ) {
        console.log( message );
        console.log( "Continuing... (because --nofail is set)" );
      }
      else {
        throw message;
      }
  }
    else if( result.warning ) {
      if( result.message ) {
        console.log( result.message );
      }
      else {
        console.log( "Warning" );
      }
    }
    else {
      if( result.message ) {
        console.log( result.message );
      }
    }
  }

}
