/** Browser interruptions must not resume a chase or its sound without a gesture. */
export function createAudioLifecycle(context, onInterruption) {
  let wanted=false, revision=0, previous=context.state, disposed=false;
  function suspend(){
    if(!['running','interrupted'].includes(context.state))return;
    try{Promise.resolve(context.suspend()).catch(()=>{});}catch{/* Browser may already have closed it. */}
  }
  function changed(){
    const state=context.state, interrupted=wanted&&(state==='interrupted'||(previous==='running'&&state==='suspended'));
    previous=state;
    if(interrupted){wanted=false;revision++;suspend();onInterruption();}
    else if(!wanted&&state==='running')suspend();
  }
  context.addEventListener('statechange',changed);
  return {
    async resume(){
      if(disposed)return false;
      const attempt=++revision;wanted=true;
      try{await context.resume();}catch(error){if(attempt===revision)wanted=false;throw error;}
      if(disposed)return false;
      if(attempt!==revision){if(!wanted)suspend();return false;}
      if(!wanted){suspend();return false;}
      previous=context.state;return context.state==='running';
    },
    pause(){wanted=false;revision++;suspend();},
    get active(){return wanted&&context.state==='running';},
    dispose({suspendContext=true}={}){if(disposed)return;disposed=true;wanted=false;revision++;context.removeEventListener('statechange',changed);if(suspendContext)suspend();},
  };
}
