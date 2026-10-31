import {createGame,startGame} from './game.js';
import {attachSurvivalEnding} from './survival-ending.js';
import {V31_SCENES} from './cf-v31-scenes.js';

/** Replace a trial at the existing route/adapters readiness boundary. */
export function createTrialSessionBridge({maze,getGame,setGame,view,weather,audio,input,ui,isDisposed,getReducedMotion=()=>false}) {
  return async function replaceTrialGame({checkpoint,trialAttempt,token,scene}) {
    const game=createGame(maze);
    attachSurvivalEnding(game,{briefing:false,completionMode:'v31'});
    startGame(game);
    setGame(game);
    weather?.reset();view.reset?.();audio.reset();input.clear();
    const trialStartRecipe={schema_version:1,build_id:checkpoint.build_id,run_id:checkpoint.run_id,
      checkpoint_id:'CP-18',baseline_id:'public-0a0fff3',config_identity:'existing-game-config',
      maze_options:{corridors:true,survival:false},initial_trial_seconds:180,
      initial_spawn:{x:game.player.x,y:0,z:game.player.z},initial_camera:{yaw:game.player.yaw,pitch:game.player.pitch},
      investigation_flags:[...checkpoint.story_flags],settings_ref:'existing_user_settings'};
    await view.ready;
    if(isDisposed()||getGame()!==game)throw new Error('Trial preparation invalidated');
    view.render(game,game.elapsed,getReducedMotion());
    ui.showIdentity({scene:scene||V31_SCENES['CF-S18'],token});
    const camera=view.camera;
    if(!ui.isReady()||!camera||!['x','y','z'].every(k=>Number.isFinite(camera.position[k]))||camera.position.x!==game.player.x||camera.position.z!==game.player.z)throw new Error('Trial camera/body/UI preparation failed');
    return {trialStartRecipe,trialGameRunId:game.runId,trialAttempt,
      presentationReady:{token,environmentId:'EXISTING_CORRIDORS',anchorId:'TRIAL_SPAWN',geometryReady:true,uiReady:true,bodyApplied:true,cameraApplied:true}};
  };
}
