// Explicit story identities: inherited filenames are transport keys, not names.
// This registry is source configuration, never proof of rendered appearance.
import {V31_ASSET_VARIANTS} from './cf-v31-asset-variants.js';
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
export const V4_OPENING_IDENTITIES=freeze({
 passenger:{identity:'MIKE',displayName:'Mike',seat:'right',playerControlled:true,title:'MIKE',speaker:'MIKE',modelOriginal:'intro/cast-clarence.glb',modelResolved:V31_ASSET_VARIANTS['intro/cast-clarence.glb'],bodyAndArms:{status:'REQUIRES_RENDERED_IDENTITY_VERIFICATION',existingClarenceArmsAreNotMike:true}},
 driver:{identity:'CLARENCE',displayName:'Clarence',seat:'left',playerControlled:false,speaker:'CLARENCE',modelOriginal:'intro/cast-driver-clarence.glb',modelResolved:V31_ASSET_VARIANTS['intro/cast-driver-clarence.glb'],storyAppearance:'Black officer Clarence',appearanceVerification:'NOT_RENDER_VERIFIED'},
 wakeLine:{lineId:'CF-V4-S01-D01',speaker:'CLARENCE',listener:'MIKE'},
 exit:{character:'MIKE',door:'passenger',side:'right',preservePhysicalArrival:true},
 farmhouse:{player:'MIKE',companion:'CLARENCE'},
 afterChildhood:{player:'CLARENCE',policy:'replace'},
 voicePolicy:'Only reuse recordings when exact text, speaker, meaning and delivery still match.'
});
export function v4OpeningPrologueOptions(){return {driverAsset:'cast-driver-clarence.glb',driverIdentity:'Clarence',passengerIdentity:'Mike'};}
export function openingSpeakerRole(speaker){const key=String(speaker||'').trim().toUpperCase();return key==='CLARENCE'?'driver':key==='MIKE'?'passenger':key==='STANLEY'?'father':null;}
/** Compare supplied runtime diagnostics without guessing absent observations. */
export function inspectOpeningIdentity(observed={}){
 const expected={passenger:'Mike',driver:'Clarence',playerTitle:'MIKE',driverAsset:'cast-driver-clarence.glb',exitSide:'right'};
 const mismatches=[],missing=[];
 for(const [key,value]of Object.entries(expected)){if(observed[key]==null)missing.push(key);else if(observed[key]!==value)mismatches.push({key,expected:value,actual:observed[key]});}
 return {configMatches:mismatches.length===0&&missing.length===0,mismatches,missing,renderedAppearanceVerified:observed.renderedAppearanceVerified===true,bodyAndArmsVerified:observed.bodyAndArmsVerified===true};
}
