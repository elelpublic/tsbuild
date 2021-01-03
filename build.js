exports.setup = function( project ) {

  project.name = "bee_build";
  project.description = "An antlike builder for nodejs and especially for me.";
  project.defaultTarget = "build";

  project.targets[ "build" ] = {
    description: "Build the project, create distribution files.",
    depends: [ "test" ],
    code: build
  };

  project.targets[ "test" ] = {
    description: "Run unit tests",
    depends: [],
    code: test
  };

}

function build( bee ) {
  console.log( "Hello build" );
}

function test( bee ) {
  console.log( "Hello test" );
  bee.exec.run( 'echo "Hello shell"' );
}

