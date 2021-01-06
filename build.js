exports.setup = function( project ) {

  project.name = "bee";
  project.description = "An antlike builder for nodejs and especially for me.";
  project.defaultTarget = "build";

  project.targets[ "build" ] = {
    description: "Build the project, create distribution files.",
    depends: [ "test" ],
    code: function( bee ) {
      bee.tsc.run( { file: "src/main/*.ts", targetDir: "target" } );
    }
  };

  project.targets[ "install" ] = {
    description: "Install new version of bee in this project.",
    depends: [ "build" ],
    code: function( bee ) {
      bee.exec.run( { command: "cp target/bee.js bee" } );
    }
  };

  project.targets[ "test" ] = {
    description: "Run unit tests",
    depends: [],
    code: function( bee ) {
      bee.exec.run( "src/tests/alltests.js" );
    }
  };

  project.targets[ "clean" ] = {
    description: "Delete all artifactes which will be created by this project.",
    depends: [],
    code: function( bee ) {
      bee.rmdir.run({ dir: "target" });
    }
  };

}


