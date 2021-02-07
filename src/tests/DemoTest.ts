import { MyMath } from "./DemoCode";
let sqrt = new MyMath().sqrt( 4 );
if( sqrt == 16 ) {
  console.log( "MyMath.sqrt OK" );
}
else {
  throw "Error in MyMath.sqrt(...). Expected 16, found " + sqrt;
}
