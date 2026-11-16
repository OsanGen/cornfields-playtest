// Time begins only after this particular card has been successfully presented.
// Pauses, hidden pages, preparation and errors discard their wall-time interval.
export function createCharacterTitleClock() {
  let key=null, stamp=null;
  function clear(){key=null;stamp=null;}
  function eligible(title,visible){return visible&&title?.kind==='character'&&!title.acknowledged&&typeof title.key==='string';}
  return Object.freeze({
    clear,
    presented(title,visible,time){
      if(!eligible(title,visible)||!Number.isFinite(time)){clear();return;}
      if(key!==title.key||stamp===null){key=title.key;stamp=time;}
    },
    advance(title,visible,time){
      if(!eligible(title,visible)||!Number.isFinite(time)){clear();return 0;}
      if(key!==title.key||stamp===null)return 0;
      const dt=Math.max(0,time-stamp)/1000;stamp=time;return dt;
    },
  });
}
