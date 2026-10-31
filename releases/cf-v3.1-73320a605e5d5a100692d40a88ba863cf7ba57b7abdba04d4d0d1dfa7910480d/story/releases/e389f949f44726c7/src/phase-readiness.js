/** Story equipment/corn are needed at Start; trial-only surfaces can settle later. */
export function phaseReadiness({field,hands,sky,details}){
  const story=Promise.all([field,hands]);
  const trial=Promise.all([story,sky,details]);
  // A later phase retains its rejection for its caller without an unhandled gap.
  void story.catch(()=>{});void trial.catch(()=>{});
  return Object.freeze({story,trial});
}
