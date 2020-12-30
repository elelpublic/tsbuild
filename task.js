exports.setup = function( project ) {

  project.name = "tsbuild";
  project.description = "An antlike builder for nodejs and especially for me.";
  project.defaultTask = "build";

  project.tasks["build"] = {
    description: "Build the project, create distribution files.",
    depends: [ "test" ],
    code: build
  };

  project.tasks["test"] = {
    description: "Run unit tests",
    depends: [],
    code: test
  };

}

function build( tsb ) {
  console.log( "Hello build" );
}

function test( tsb ) {
  console.log( "Hello test" );
  tsb.exec( 'echo "Hello shell"' );
}

