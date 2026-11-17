/** One activity decision for simulation, presentation and automatic quality. */
export function sessionActivity({storyEnabled=false,story=null,intro=null,gameMode,hidden=false,ready=true,interaction=false}={}){
  if(hidden||!ready)return {animate:false,simulate:false,quality:false};
  if(storyEnabled){
    const active=story?.state?.status==='active';
    return {animate:active,simulate:active,quality:active&&story.presentation?.ready!==false&&!interaction};
  }
  if(intro?.active){const active=intro.phase==='playing';return {animate:active,simulate:active,quality:false};}
  const active=gameMode==='playing';return {animate:active||gameMode==='menu',simulate:active,quality:active&&!interaction};
}
