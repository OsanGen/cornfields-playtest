/** Host-owned readiness; controls must not override these clock/input gates. */
export function storyInputReadiness({story,touch=false,width=1,height=1,pointerLocked=false,focused=true,hidden=false,coreReady=true,graphicsError=false}={}){
 const paused=story?.state?.status!=='active';
 const loading=!coreReady||graphicsError||story?.presentation?.ready===false;
 const pointerReady=!!focused&&!hidden&&!loading&&(touch?width>=height:!!pointerLocked);
 return {paused,hidden:!!hidden,focused:!!focused,loading,pointerReady};
}
