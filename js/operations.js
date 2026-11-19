import { rt } from './runtime.js';
let locked=false;
export function perform(operation,validate=()=>true){
 if(locked||rt.busy||!validate())return false;
 locked=true;
 try{operation();return true;}finally{locked=false;}
}
