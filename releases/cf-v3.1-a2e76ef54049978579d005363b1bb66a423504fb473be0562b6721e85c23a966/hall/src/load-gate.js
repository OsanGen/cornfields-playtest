export function createLoadGate(){let token=0,closed=false;return{begin(){if(closed)return null;return ++token;},current(t){return !closed&&t!==null&&t===token;},close(){closed=true;token++;}};}
