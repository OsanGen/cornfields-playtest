// CF-V3.1 canonical static data. No DOM, callbacks, asset loading or route effects.
// Derived from master Section 05; dialogue text has one runtime store only.
// Baseline/source fidelity does not constitute runtime, GPU or playthrough evidence.
// Completion adapter_condition is traceable prose, never eval/executable data.
// Recaps reuse exact canonical line IDs; no invented dialogue or knowledge grants.
function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}
export const V31_SPEC_ID = deepFreeze("CORNFIELDS_V3_1_MASTER");

export const V31_ROUTE_ID = deepFreeze("BOOK_FIRST_CORNFIELD_1955");

export const V31_SCENE_IDS = deepFreeze([
  "CF-S01",
  "CF-S02",
  "CF-S03",
  "CF-S04",
  "CF-S05",
  "CF-S06",
  "CF-S07",
  "CF-S08",
  "CF-S09",
  "CF-S10",
  "CF-S11",
  "CF-S12",
  "CF-S13",
  "CF-S14",
  "CF-S15",
  "CF-S16",
  "CF-S17",
  "CF-S18",
  "CF-S19",
  "CF-S20",
  "CF-S21",
  "CF-S22",
  "CF-S23",
  "CF-S24"
]);

export const V31_CHECKPOINT_IDS = deepFreeze([
  "CP-01",
  "CP-02",
  "CP-03",
  "CP-04",
  "CP-05",
  "CP-06",
  "CP-07",
  "CP-08",
  "CP-09",
  "CP-10",
  "CP-11",
  "CP-12",
  "CP-13",
  "CP-14",
  "CP-15",
  "CP-16",
  "CP-17",
  "CP-18",
  "CP-19",
  "CP-20",
  "CP-21",
  "CP-22",
  "CP-23",
  "CP-24"
]);

export const V31_END_SCENE_ID = deepFreeze("END_AVAILABLE_EXCERPT");

export const V31_PHYSICAL_SET_IDS = deepFreeze([
  "FARM_FRONT",
  "FARM_INTERIOR",
  "FARM_YARD",
  "SEARCH_TRAIL",
  "CLASSROOM",
  "CHILDHOOD_POCKET",
  "CREATURE_REVEAL",
  "HISTORICAL_TABLE",
  "HISTORICAL_WORK_LUNCH",
  "HISTORICAL_DINNER",
  "HISTORICAL_STORE"
]);

export const V31_ADAPTER_KEYS = deepFreeze([
  "call",
  "cruiser",
  "farm",
  "schoolMemory",
  "childMemory",
  "search",
  "hand",
  "recovery",
  "investigationCutaway",
  "sky",
  "projector",
  "trial",
  "revelation",
  "title1955",
  "historical"
]);

export const V31_KNOWLEDGE_RECIPIENTS = deepFreeze([
  "audience",
  "clarence",
  "glenda",
  "stanley",
  "mike",
  "dale"
]);

export const V31_PROHIBITED_FLAGS = deepFreeze([
  "pregnancy_confirmed",
  "mike_dead",
  "creatures_caused_school_behavior",
  "projector_is_ring_leader",
  "sadie_rescued"
]);

export const V31_CUE_DECISIONS = deepFreeze([
  {
    "id": "CUE-FIX-01",
    "scene": "CF-S04",
    "source": "D09",
    "bound": "D08",
    "reason": "Glenda kitchen-side visual belongs to Glenda D08; D09 is Stanley. No dialogue edit."
  },
  {
    "id": "CUE-FIX-02",
    "scene": "CF-S05",
    "source": "D07",
    "bound": "D06",
    "reason": "Mike property-search visual belongs to Mike D06; D07 is Glenda. No dialogue edit."
  }
]);

export const V31_LINES = deepFreeze({
  "CF-S01-D01": {
    "speaker": "PATTY",
    "text": "Chief, line three.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "businesslike; offscreen",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S01-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S01-D02": {
    "speaker": "STANLEY",
    "text": "Officer my name is Stanley Yates and my daughter Sadie has gone missing.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.02:18"
    ],
    "delivery": "breathless, trying to become clear",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S01-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S01-D03": {
    "speaker": "MIKE",
    "text": "Where do you live, Mr. Yates?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.02:21"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S01-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S01-D04": {
    "speaker": "STANLEY",
    "text": "79 Ridgefellow Avenue.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.02:22"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S01-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S01-D05": {
    "speaker": "MIKE",
    "text": "We’ll have a cruiser over in fifteen.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.02:23"
    ],
    "delivery": "steady; this is fictional dialogue, not a real response-time commitment",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S01-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S01-D06": {
    "speaker": "MIKE",
    "text": "Clarence. We have a missing child. Come on.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S01-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S02-D01": {
    "speaker": "CLARENCE",
    "text": "You’re thinking about the standoff again. The one in 2002.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.01:5-7"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S02-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S02-D02": {
    "speaker": "MIKE",
    "text": "Bruins hoodie. Hockey mask. He opened fire in broad daylight. My partner went into cardiac arrest.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.01:5-7"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S02-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S02-D03": {
    "speaker": "MIKE",
    "text": "I keep seeing it. The mask. The guns. It plays over and over in my head.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.01:7"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S02-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S02-D04": {
    "speaker": "CLARENCE",
    "text": "You’re making me nervous, Mike.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.01:10"
    ],
    "delivery": "half a joke, not entirely",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S02-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S02-D05": {
    "speaker": "MIKE",
    "text": "Don’t be nervous. Be ready. That’s what’ll make you the man who tells the story back and wears it like a crown.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.01:11"
    ],
    "delivery": "attempt at reassurance, with worn confidence",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S02-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S02-D06": {
    "speaker": "MIKE",
    "text": "That’s the place. Let me do the first questions. Keep your eyes open.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S02-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S03-D01": {
    "speaker": "MIKE",
    "text": "Afternoon, Mr. Yates",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.03:28"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S03-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S03-D02": {
    "speaker": "STANLEY",
    "text": "Afternoon",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.03:29"
    ],
    "delivery": "flat, exhausted",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S03-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S03-D03": {
    "speaker": "CLARENCE",
    "text": "This must be your puppy",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.03:30"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S03-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S03-D04": {
    "speaker": "CLARENCE",
    "text": "I surrender",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.03:31"
    ],
    "delivery": "after the bark, backing off",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S03-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S03-D05": {
    "speaker": "STANLEY",
    "text": "Easy. I’m sorry, officer. The dog’s been distraught. Last one with her.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.03:32"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S03-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S03-D06": {
    "speaker": "MIKE",
    "text": "Mind if we come inside, sir?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.03:34"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S03-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S03-D07": {
    "speaker": "MIKE",
    "text": "In my thirty years as a cop, I’ve never seen someone get so scared of a border collie.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.03:36"
    ],
    "delivery": "quiet aside after they enter",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S03-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S03-D08": {
    "speaker": "CLARENCE",
    "text": "I was being polite.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "dry reply; no additional joke exchange",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S03-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D01": {
    "speaker": "STANLEY",
    "text": "Sadie’s a curious child. What happened today started weeks ago. She kept looking out at the corn.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:40-41",
      "BK:I.04:51"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D02": {
    "speaker": "MIKE",
    "text": "When did she go missing exactly?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.04:50"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D03": {
    "speaker": "STANLEY",
    "text": "About two hours ago. I was in the backyard with her, taking the dog out.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:51"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D04": {
    "speaker": "STANLEY",
    "text": "The dog started barking like mad. I turned toward it. When I looked back, Sadie was gone.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:51"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D05": {
    "speaker": "CLARENCE",
    "text": "And did you hear anything? Were there footsteps?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.04:52"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D06": {
    "speaker": "STANLEY",
    "text": "Nothing. One moment she was there. Then she wasn’t.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:53"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D07": {
    "speaker": "STANLEY",
    "text": "We own seven hundred acres. Those fields go much farther than that. Farther than we’ve ever gone.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:48"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D08": {
    "speaker": "GLENDA",
    "text": "Out there, it’s hard to keep any sense of direction. Even with a compass.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:48"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D09": {
    "speaker": "STANLEY",
    "text": "Our rule was simple. Only go as far as the mind sees north. If that gets blurry, turn back. Sadie knew it.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:48-49"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D09",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D10": {
    "speaker": "MIKE",
    "text": "Where’s your son this afternoon, Mrs. Yates?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.04:57"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D10",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S04-D11": {
    "speaker": "GLENDA",
    "text": "Owen’s at his friend Finn’s house. The Harrises.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:58",
      "BK:I.06:90"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S04-D11",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S05-D01": {
    "speaker": "RADIO_OFFICER",
    "text": "We’re at the Harris house. Owen is here with Finn. We’ve told him Sadie is missing.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "radio; no police-procedure claim",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S05-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S05-D02": {
    "speaker": "RADIO_OFFICER",
    "text": "He wants to go home. We’re bringing him back.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.06:103"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S05-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S05-D03": {
    "speaker": "NARRATOR",
    "text": "While Owen watched television with his friend, his whole life had changed. The officers had not found Sadie’s body. They could not tell him she was safe.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.06:100-101"
    ],
    "delivery": "quiet narrative bridge",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S05-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S05-D04": {
    "speaker": "GLENDA",
    "text": "Owen. Your sister...",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.06:105-106"
    ],
    "delivery": "from the porch; catches her breath",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S05-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S05-D05": {
    "speaker": "OWEN",
    "text": "Calm down, Ma. The officers told me already",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.06:107"
    ],
    "delivery": "low and controlled; offscreen",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S05-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S05-D06": {
    "speaker": "MIKE",
    "text": "We’ll sweep the property, inside and out. Then the team goes into the corn.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.06:109"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S05-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S05-D07": {
    "speaker": "GLENDA",
    "text": "Inside the house? You think we did this?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.06:110"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S05-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S05-D08": {
    "speaker": "MIKE",
    "text": "It’s a precaution. We’re not saying you or your husband were involved.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.06:111"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S05-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S05-D09": {
    "speaker": "GLENDA",
    "text": "Go right ahead.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.06:112"
    ],
    "delivery": "hurt, not an admission",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S05-D09",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D01": {
    "speaker": "GLENDA",
    "text": "Her teacher, Mrs. Anderson, found her on the carpet after circle time. Everyone else had moved on. Sadie was still staring.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.07:117"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D02": {
    "speaker": "GLENDA",
    "text": "We took her to Dr. Melbourne. A child psychologist.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.07:117-118"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D03": {
    "speaker": "GLENDA",
    "text": "She said Sadie had a strong imagination. So strong it could seem real.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.07:118"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D04": {
    "speaker": "STANLEY",
    "text": "But she was always staring out at those fields. I didn’t think we were taking it seriously enough.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.07:119-122"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D05": {
    "speaker": "GLENDA",
    "text": "I trusted Dr. Mel. I wanted us to support Sadie, not make her frightened of herself.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.07:120"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D06": {
    "speaker": "STANLEY",
    "text": "I even talked to Paul and Dave at O’Larry’s. They listened, but they didn’t have children. I left early. We had to decide about a learning plan.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.07:121-130"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D07": {
    "speaker": "GLENDA",
    "text": "We agreed to an IEP. She spent weeks with the school specialist, working through the assessments.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.07:134-135"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D08": {
    "speaker": "STANLEY",
    "text": "After the first day, she asked what was at the end of the cornfields. I told her I didn’t know. I’d never been that far.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.07:135-136"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D09": {
    "speaker": "GLENDA",
    "text": "She stopped asking. But she kept staring. For years.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.07:137"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D09",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D10": {
    "speaker": "STANLEY",
    "text": "Sometimes I’d look at her photograph and think about the little girl I remembered.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.07:131-132"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D10",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S06-D11": {
    "speaker": "GLENDA",
    "text": "Mrs. Anderson said the room had already emptied. Just Sadie, sitting there.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S06-D11",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S07-D01": {
    "speaker": "MRS_ANDERSON",
    "text": "Sadie?",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "gentle; offscreen near the classroom doorway",
    "audience": "SADIE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S07-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S07-D02": {
    "speaker": "MRS_ANDERSON",
    "text": "Circle time is over. The others have gone to their tables.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "calm, not threatening",
    "audience": "SADIE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S07-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S07-D03": {
    "speaker": "MRS_ANDERSON",
    "text": "Sadie, can you hear me?",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "one clear repeat, no panic",
    "audience": "SADIE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S07-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S08-D01": {
    "speaker": "MIKE",
    "text": "And the man you said she saw?",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S08-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S08-D02": {
    "speaker": "STANLEY",
    "text": "A few weeks ago, at dinner, she asked who lived in the cornfields behind the house.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:41"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S08-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S08-D03": {
    "speaker": "STANLEY",
    "text": "We told her nobody lived there. Asked why she wanted to know.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:42"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S08-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S08-D04": {
    "speaker": "STANLEY_QUOTING_SADIE",
    "text": "I saw something earlier out there. A man. He had a gray jacket with holes in it.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.04:43"
    ],
    "delivery": "explicitly a recollection of Sadie’s words",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S08-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S08-D05": {
    "speaker": "GLENDA",
    "text": "I asked if she felt all right. She said she’d never seen him before.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:45-46"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S08-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S08-D06": {
    "speaker": "STANLEY",
    "text": "After that, one of us was always outside with either of the children.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.04:47"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S08-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S08-D07": {
    "speaker": "CLARENCE_INNER",
    "text": "A torn jacket.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "private thought, not audible to the family",
    "audience": "CLARENCE_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S08-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S09-D01": {
    "speaker": "CLARENCE_INNER",
    "text": "I was almost six. A hot afternoon in July. There were roses beside the trail.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.05:61",
      "BK:I.05:69"
    ],
    "delivery": "restrained; conversational",
    "audience": "CLARENCE_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S09-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S09-D02": {
    "speaker": "CLARENCE_INNER",
    "text": "I left my bike. Then I heard the bushes moving. A grunt.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.05:69-71"
    ],
    "delivery": "restrained; conversational",
    "audience": "CLARENCE_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S09-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S09-D03": {
    "speaker": "CLARENCE_INNER",
    "text": "Torn leather. Gray skin. He looked dead. But he was standing there, chewing grass.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.05:71-72"
    ],
    "delivery": "restrained; conversational",
    "audience": "CLARENCE_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S09-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S09-D04": {
    "speaker": "YOUNG_CLARENCE",
    "text": "Ma! Help!",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.05:73-74"
    ],
    "delivery": "brief frightened call during retreat",
    "audience": "MEMORY_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S09-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S09-D05": {
    "speaker": "CLARENCE_INNER",
    "text": "I got back on my bike and pedaled home. I told Ma I’d nearly stepped on a dead possum. She believed me.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.05:73-74"
    ],
    "delivery": "restrained; conversational",
    "audience": "CLARENCE_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S09-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S10-D01": {
    "speaker": "CLARENCE_INNER",
    "text": "My father, Billy, came and went. Drink. Cocaine. But he talked to me honestly: sex, growing up, being Black in America. Things other parents avoided.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.05:61-67"
    ],
    "delivery": "restrained; conversational",
    "audience": "CLARENCE_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S10-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S10-D02": {
    "speaker": "CLARENCE_INNER",
    "text": "I still couldn’t tell him about the thing in the woods. I was afraid he wouldn’t believe me. I was more afraid he would.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.05:68"
    ],
    "delivery": "restrained; conversational",
    "audience": "CLARENCE_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S10-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S10-D03": {
    "speaker": "CLARENCE_INNER",
    "text": "Years later, I finished school with a 4.0 and studied advanced physics. Ma put an MIT brochure beside my plate.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.05:77-79"
    ],
    "delivery": "restrained; conversational",
    "audience": "CLARENCE_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S10-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S10-D04": {
    "speaker": "DARLENE_MEMORY",
    "text": "Your future. It’s important to me that you look into this opportunity, Clarence. This is MIT. This would mean big.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.05:79"
    ],
    "delivery": "restrained; conversational",
    "audience": "MEMORY_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S10-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S10-D05": {
    "speaker": "CLARENCE_MEMORY",
    "text": "I wanted to go. But Dad had been gone three years. What if he came back while I was away?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.05:81-83"
    ],
    "delivery": "restrained; conversational",
    "audience": "MEMORY_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S10-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S10-D06": {
    "speaker": "DARLENE_MEMORY",
    "text": "Then you are at MIT building a future for yourself, while your father comes back for spilled food and then waltzes out again.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.05:84"
    ],
    "delivery": "restrained; conversational",
    "audience": "MEMORY_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S10-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S10-D07": {
    "speaker": "DARLENE_MEMORY",
    "text": "It’s your future, Clarence. Think about it.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.05:86"
    ],
    "delivery": "restrained; conversational",
    "audience": "MEMORY_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S10-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S10-D08": {
    "speaker": "CLARENCE_INNER",
    "text": "None of it made me tell them what I’d seen.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "CLARENCE_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S10-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S10-D09": {
    "speaker": "MIKE",
    "text": "Clarence? We’re going around the back.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S10-D09",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S10-D10": {
    "speaker": "CLARENCE",
    "text": "I’m coming.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S10-D10",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S11-D01": {
    "speaker": "STANLEY",
    "text": "Here. This is where she was standing.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S11-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S11-D02": {
    "speaker": "MIKE",
    "text": "We’ll follow the trail. Stay with your family, Mr. Yates.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S11-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S11-D03": {
    "speaker": "NARRATOR",
    "text": "The first ten officers on the scene entered the cornfields. Dogs worked along the dry ground. Dispatch voices followed them between the stalks.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.08:142"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S11-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S11-D04": {
    "speaker": "PATCHWORK",
    "text": "Alan, what do you make of this?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.08:143"
    ],
    "delivery": "low voice ahead of Clarence",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S11-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S11-D05": {
    "speaker": "ALAN_WRIGHT",
    "text": "I think the parents killed her. That woman was too nervous.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.08:144"
    ],
    "delivery": "a biased suspicion, not narrator confirmation",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S11-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S11-D06": {
    "speaker": "ALAN_WRIGHT",
    "text": "Afternoon, Clarence",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.08:146"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S11-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S11-D07": {
    "speaker": "CLARENCE",
    "text": "Afternoon, gentleman. Beautiful day, isn’t it?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.08:147"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S11-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S11-D08": {
    "speaker": "CLARENCE",
    "text": "Officer Dale, is he smelling something?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.08:149"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S11-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S11-D09": {
    "speaker": "OFFICER_DALE",
    "text": "All good back here.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.08:150"
    ],
    "delivery": "distant voice from the search line",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S11-D09",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S12-D01": {
    "speaker": "CLARENCE",
    "text": "Halt!",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.08:152"
    ],
    "delivery": "sharp; audible to the search line",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S12-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S12-D02": {
    "speaker": "CLARENCE",
    "text": "411. Sight of a hand on the trail. I repeat, 411.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.08:153"
    ],
    "delivery": "radio; source’s fictional call wording",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S12-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S12-D03": {
    "speaker": "CLARENCE_INNER",
    "text": "That gray. I’ve seen it before.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "barely controlled",
    "audience": "CLARENCE_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S12-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D01": {
    "speaker": "GLENDA",
    "text": "Come to, dear. The world is sunnier with you in it",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.08:159"
    ],
    "delivery": "warm, grounded",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D02": {
    "speaker": "CLARENCE",
    "text": "Why did we leave the fields? What happened to the hand?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.08:160"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D03": {
    "speaker": "MIKE",
    "text": "It’s been sent for examination. It isn’t Sadie’s hand.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.08:161"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D04": {
    "speaker": "CLARENCE",
    "text": "It’s not a human hand, Officer.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.08:162"
    ],
    "delivery": "Clarence’s belief, not settled evidence",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D05": {
    "speaker": "MIKE",
    "text": "I beg your pardon, Officer Lemons?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.08:164"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D06": {
    "speaker": "MIKE",
    "text": "You fainted over what we presume is a human hand. You’re saying you think it isn’t?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.08:166"
    ],
    "delivery": "skeptical, then steps away",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D07": {
    "speaker": "GLENDA",
    "text": "I’m sorry he isn’t listening. I believe you’re telling the truth.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.08:168"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D08": {
    "speaker": "CLARENCE",
    "text": "Ma’am there’s something you need to know. Something that I think might help find your daughter.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.08:169"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D09": {
    "speaker": "CLARENCE",
    "text": "When I was a boy, I saw a man in the woods. He looked dead. But he was moving. That hand looks like his.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.08:170",
      "BK:I.10:208"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D09",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D10": {
    "speaker": "CLARENCE",
    "text": "I never told my parents. Not even my father. We could talk about almost anything. I thought no one would believe this.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.05:61-68",
      "BK:I.08:170"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D10",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S13-D11": {
    "speaker": "GLENDA",
    "text": "Then Stanley needs to hear it too.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S13-D11",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D01": {
    "speaker": "NARRATOR",
    "text": "The hand went to pathologist Wayne Probst. Twenty-five, recently hired after Tufts, he was already thinking about his friend Troy’s birthday and another weekend of drink, women and cocaine.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.09:173-174",
      "BK:I.09:196"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D02": {
    "speaker": "NARRATOR",
    "text": "The box looked absurdly like a present. In the car, its cooler struck the floor and became wedged. Wayne stopped, freed it and moved it to the trunk.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.09:173",
      "BK:I.09:175-182"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D03": {
    "speaker": "NARRATOR",
    "text": "At the laboratory, he opened the cooler under a bright lamp. The gray hand was dry, cracked and foul-smelling. He made notes.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.09:184-188"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D04": {
    "speaker": "NARRATOR",
    "text": "It fell to the floor. Then its fingers curled as though reaching for something.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.09:189"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D05": {
    "speaker": "NARRATOR",
    "text": "He was sick in the bathroom. For a moment, he blamed the way he had been living. Then something tapped on the door.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.09:190-195"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D06": {
    "speaker": "NARRATOR",
    "text": "The hallway was empty. The hand came around the corner and struck his face. He tore it away, but it crawled back toward him.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.09:196-200"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D07": {
    "speaker": "NARRATOR",
    "text": "He climbed onto the sink, stumbled toward the closed door and knocked himself unconscious.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.09:200"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D08": {
    "speaker": "NARRATOR",
    "text": "The police later found him dead. His eyes were missing.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.09:201"
    ],
    "delivery": "factual and restrained; no graphic imagery",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D09": {
    "speaker": "STANLEY",
    "text": "Something more serious than our daughter going missing?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.10:207"
    ],
    "delivery": "restrained; conversational",
    "audience": "GLENDA_AND_STANLEY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D09",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D10": {
    "speaker": "GLENDA",
    "text": "Clarence told me what he saw as a boy. A thing that looked like a dead man, walking in the woods. He says the hand matches it.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.10:208"
    ],
    "delivery": "restrained; conversational",
    "audience": "GLENDA_AND_STANLEY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D10",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D11": {
    "speaker": "STANLEY",
    "text": "We find one hand. What does that actually mean?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.10:210"
    ],
    "delivery": "restrained; conversational",
    "audience": "GLENDA_AND_STANLEY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D11",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D12": {
    "speaker": "GLENDA",
    "text": "It means someone needs to listen. He’s afraid they’ll think he’s crazy.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.10:211"
    ],
    "delivery": "restrained; conversational",
    "audience": "GLENDA_AND_STANLEY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D12",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D13": {
    "speaker": "STANLEY",
    "text": "It sounds crazy.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.10:212"
    ],
    "delivery": "restrained; conversational",
    "audience": "GLENDA_AND_STANLEY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D13",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D14": {
    "speaker": "GLENDA",
    "text": "But I believe him. It could be a link to finding Sadie.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.10:213"
    ],
    "delivery": "restrained; conversational",
    "audience": "GLENDA_AND_STANLEY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D14",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D15": {
    "speaker": "STAGE_CAPTION",
    "text": "A knock. Mike enters the kitchen.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "caption only; not a spoken character",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D15",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D16": {
    "speaker": "MIKE",
    "text": "The forensics team found Wayne Probst dead at the laboratory. His eyes were missing. The hand from the field is gone.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.10:215"
    ],
    "delivery": "only what the police found; not the unseen cause",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D16",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S14-D17": {
    "speaker": "STANLEY",
    "text": "I think I’d like to have a word with Clarence.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.10:217"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S14-D17",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D01": {
    "speaker": "NARRATOR",
    "text": "Half the search team returned after the hand was found. The others pressed deeper. Brad Iris’s bloodhound, Olive, stopped at a pile of sticks and rocks as thunder rolled overhead.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.11:220-225"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D02": {
    "speaker": "NARRATOR",
    "text": "A gray arm reached from the corn and seized Randall by the throat. Iris fired into the hand. Randall fell free.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.11:226-229"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D03": {
    "speaker": "RANDALL",
    "text": "RUN!",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.11:230"
    ],
    "delivery": "over radio or cutaway audio",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D04": {
    "speaker": "NARRATOR",
    "text": "They ran toward the house. Another hand caught Randall’s foot and pulled him down. Olive charged, then retreated when a tall gray figure stepped out.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.11:231-235"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D05": {
    "speaker": "BRAD_IRIS",
    "text": "Freeze! Put your hands in the air! Holbrook PD!",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.11:236"
    ],
    "delivery": "urgent, directed at the figure",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D06": {
    "speaker": "NARRATOR",
    "text": "The creature ignored the order and bit Randall’s ankle. Iris fired again. The figure stumbled back into the stalks. Randall was badly hurt.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.11:237-242"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D07": {
    "speaker": "BRAD_IRIS",
    "text": "I need a medic. We have a man incapacitated",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.11:243"
    ],
    "delivery": "radio report audible at the farm",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D08": {
    "speaker": "STANLEY",
    "text": "Tell me about what you saw. If Sadie’s with one of those things, she could be in terrible trouble.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.12:246-248"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D09": {
    "speaker": "CLARENCE",
    "text": "I never saw anything like it again. Not until the hand today.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.12:247"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D09",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D10": {
    "speaker": "CLARENCE",
    "text": "I wouldn’t jump to conclusions. The thing I saw barely noticed me. We don’t know what has happened to your daughter.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.12:249"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D10",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D11": {
    "speaker": "STANLEY",
    "text": "Then what would they want her for? To eat her? To make her one of them?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.12:250"
    ],
    "delivery": "frightened speculation, not exposition",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D11",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D12": {
    "speaker": "CLARENCE",
    "text": "Perhaps an hour or two of rest would do you some good right about now, Mr. Yates?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.12:252"
    ],
    "delivery": "trying to steady him",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D12",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D13": {
    "speaker": "NARRATOR",
    "text": "Stanley nodded. As Clarence helped him toward the house, he felt the man trembling.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.12:253"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D13",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S15-D14": {
    "speaker": "MIKE",
    "text": "Clarence. With me. We’re checking the field edge.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S15-D14",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S16-D01": {
    "speaker": "MIKE",
    "text": "Stay close.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S16-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S16-D02": {
    "speaker": "CLARENCE",
    "text": "Mike?",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "voice changes from calling to alarm",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S16-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S16-D03": {
    "speaker": "UNIDENTIFIED_VOICE",
    "text": "WE ARE ONE.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "existing effect if available; subtitle remains readable",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S16-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S16-D04": {
    "speaker": "CLARENCE",
    "text": "Mike? Where did you go?",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S16-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S17-D01": {
    "speaker": "PROJECTED_VOICE",
    "text": "Help me. I’m trapped here.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S17-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S17-D02": {
    "speaker": "CLARENCE",
    "text": "I’m looking for Sadie Yates.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S17-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S17-D03": {
    "speaker": "PROJECTED_VOICE",
    "text": "Trial access granted.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S17-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S17-D04": {
    "speaker": "PROJECTED_VOICE",
    "text": "Survive the trial. Keep moving. The corridors will not remain where you left them.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S17-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S17-D05": {
    "speaker": "PROJECTED_VOICE",
    "text": "If the passage fails, enter the corn and remain still.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S17-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S17-D06": {
    "speaker": "PROJECTED_VOICE",
    "text": "The glowing scarecrows can restore you. Each will answer once.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S17-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S17-D07": {
    "speaker": "PROJECTED_VOICE",
    "text": "Your weapon can buy time. It will not give you control of this place.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S17-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S17-D08": {
    "speaker": "PROJECTED_VOICE",
    "text": "These rules are not mine. They are binding.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S17-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S17-D09": {
    "speaker": "CLARENCE",
    "text": "Then I’ll keep looking.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S17-D09",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S18-D01": {
    "speaker": "CLARENCE",
    "text": "Sadie. I’m still looking.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "entry only; do not repeat on every retry",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S18-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S18-D02": {
    "speaker": "PROJECTED_VOICE",
    "text": "The trial is complete.",
    "origin": "GAME_ORIGINAL",
    "source_refs": [],
    "delivery": "once on successful completion",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S18-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S19-D01": {
    "speaker": "NARRATOR",
    "text": "A gray creature on a leash begged not to be locked in the safe. The ring leader called it vermin.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.13:256"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S19-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S19-D02": {
    "speaker": "NARRATOR",
    "text": "The safe ran forty feet long, seven feet into the ground. Some of their liveliest stock had gone out and not returned. The family was frightened.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.13:257"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S19-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S19-D03": {
    "speaker": "LEASHED_CREATURE",
    "text": "Don’t lock me in.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.13:256"
    ],
    "delivery": "adapted plea; restrained, intelligible",
    "audience": "CREATURES_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S19-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S19-D04": {
    "speaker": "NARRATOR",
    "text": "The leader tugged the leash. The others gathered, asking where the rest of their pack had gone.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:I.13:258-260"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S19-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S19-D05": {
    "speaker": "LEASHED_CREATURE",
    "text": "Tell them",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.13:261"
    ],
    "delivery": "quiet and deliberate",
    "audience": "CREATURES_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S19-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S19-D06": {
    "speaker": "LEASHED_CREATURE",
    "text": "Tell them we have the farmer’s little girl",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:I.13:262"
    ],
    "delivery": "plain speech; do not bury it under distortion",
    "audience": "CREATURES_AND_AUDIENCE",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S19-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S20-D01": {
    "speaker": "TITLE_CARD",
    "text": "PART II\n1955",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "on-screen text only",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S20-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S21-D01": {
    "speaker": "NARRATOR",
    "text": "In 1955, Dale Arkins walked into Friendly’s. He was thirty-two, a new landowner, and thinking of Pam.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.01:269-271"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S21-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S21-D02": {
    "speaker": "NARRATOR",
    "text": "He remembered their wedding night and the envelope he had put down in front of her.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.01:271"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S21-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S21-D03": {
    "speaker": "PAM_MEMORY",
    "text": "What’s this now, Honey?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.01:272"
    ],
    "delivery": "restrained; conversational",
    "audience": "MEMORY_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S21-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S21-D04": {
    "speaker": "DALE",
    "text": "Land, baby. Fresh land. I just closed the deal earlier today. We’re home owners, baby.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.01:273"
    ],
    "delivery": "proud, in the wedding recollection",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S21-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S21-D05": {
    "speaker": "PAM_MEMORY",
    "text": "I could be the luckiest woman in the world.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.01:274"
    ],
    "delivery": "restrained; conversational",
    "audience": "MEMORY_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S21-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S21-D06": {
    "speaker": "NARRATOR",
    "text": "They looked at photographs of a farm and the cornfields stretching beyond it. For Pam, the promise of the place was intimate and exciting.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.01:275-276"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S21-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S21-D07": {
    "speaker": "DALE",
    "text": "As far as the eye could see",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.01:275"
    ],
    "delivery": "looking at the photograph",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S21-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S22-D01": {
    "speaker": "NARRATOR",
    "text": "Pam worked as a secretary at the law firm where Dale’s friend had helped her get a job. She indexed papers and prepared labels.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.02:279"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S22-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S22-D02": {
    "speaker": "NARRATOR",
    "text": "Her boss, Pete Gateman, treated her appearance as part of the job. He made sexual remarks and grabbed her buttocks.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.02:279"
    ],
    "delivery": "plain description, no reenactment",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S22-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S22-D03": {
    "speaker": "NARRATOR",
    "text": "At lunch in Newton, she visited Del’Amo’s Classic Italian. Diego brought a menu and offered her a cigarette. She accepted, and he flirted with her.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.02:280-286"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S22-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S22-D04": {
    "speaker": "NARRATOR",
    "text": "She ordered a hot dog and onion rings. She felt attracted to him, even as she reminded him of her marriage.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.02:287-290"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S22-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S22-D05": {
    "speaker": "PAM",
    "text": "Sir, I have a husband. Dale is his name. He’s a good man. And I love him deeply.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.02:291"
    ],
    "delivery": "firm, but not completely untroubled",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S22-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S22-D06": {
    "speaker": "DIEGO",
    "text": "I didn’t mean to bother you. You sound like you have a lovely life. I don’t want to get in the middle of it.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.02:293"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S22-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S22-D07": {
    "speaker": "PAM",
    "text": "Maybe I’ll see you around some time.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.02:294"
    ],
    "delivery": "the hesitation matters",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S22-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S22-D08": {
    "speaker": "STAGE_CAPTION",
    "text": "Later, at dinner.",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "caption only",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S22-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D01": {
    "speaker": "DALE",
    "text": "You’re quiet. Are you all right?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.03:297"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D02": {
    "speaker": "PAM",
    "text": "Yeah, I’m OK. Just a long day of chores.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.03:298"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D03": {
    "speaker": "DALE",
    "text": "The invoices keep stacking up. And the calls from the property owner.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.03:299"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D04": {
    "speaker": "PAM",
    "text": "The one who is selling you the cornfields, right?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.03:300"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D04",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D05": {
    "speaker": "DALE",
    "text": "Right. Is something wrong?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.03:301"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D05",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D06": {
    "speaker": "PAM",
    "text": "I don’t know about those cornfields. The price is good. But why would so much land be so cheap?",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.03:302"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D06",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D07": {
    "speaker": "DALE",
    "text": "A man’s price for a patch of land is nothing compared to what lies within it.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.03:303"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D07",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D08": {
    "speaker": "PAM",
    "text": "Fancy yourself a poet, huh?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.03:304"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D08",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D09": {
    "speaker": "DALE",
    "text": "Not a poet, but a husband and a landowner and a father some day. Not sure when that day will come though.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.03:305"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D09",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D10": {
    "speaker": "STAGE_CAPTION",
    "text": "Pam’s hand pauses over her stomach.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.03:306"
    ],
    "delivery": "caption if the action is not visually implemented",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D10",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D11": {
    "speaker": "DALE",
    "text": "Something the matter, dear?",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.03:307"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D11",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D12": {
    "speaker": "PAM",
    "text": "No. Nothing's the matter, dear. Nothing at all.",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.03:308"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D12",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S23-D13": {
    "speaker": "DALE",
    "text": "Right you are then",
    "origin": "BOOK_EXCERPT",
    "source_refs": [
      "BK:II.03:309"
    ],
    "delivery": "restrained; conversational",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S23-D13",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S24-D01": {
    "speaker": "NARRATOR",
    "text": "The following day, Pam went to the grocery market. The aisles were crowded. Outside Joe’s, cars stalled and horns sounded as people waited for the storm.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.04:312"
    ],
    "delivery": "restrained; conversational",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S24-D01",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S24-D02": {
    "speaker": "WEATHER_VOICE",
    "text": "An unusual nor’easter is forecast for Massachusetts tomorrow. Torrential rain, hurricane-force winds and hail are expected across much of the region.",
    "origin": "ADAPTED",
    "source_refs": [
      "BK:II.04:312"
    ],
    "delivery": "period radio performance; adaptation of the narrator’s forecast, not a real historic bulletin",
    "audience": "SCENE_PARTICIPANTS",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S24-D02",
    "optional_voice_asset": null,
    "subtitle_required": true
  },
  "CF-S24-D03": {
    "speaker": "TITLE_CARD",
    "text": "END OF AVAILABLE STORY\nTO BE CONTINUED",
    "origin": "BRIDGE",
    "source_refs": [],
    "delivery": "on-screen text only",
    "audience": "AUDIENCE_ONLY",
    "trigger": "PREVIOUS_CUE_COMPLETE",
    "line_id": "CF-S24-D03",
    "optional_voice_asset": null,
    "subtitle_required": true
  }
});

export const V31_SCENES = deepFreeze({
  "CF-S01": {
    "scene_id": "CF-S01",
    "title": "The call becomes the drive",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.01:12-14",
      "BK:I.02:17-23"
    ],
    "fidelity": [
      "COMPRESSED",
      "RELOCATED"
    ],
    "perspective": {
      "character": "NONE",
      "period": "PRESENT",
      "mode": "NONPLAYABLE_AUDIO_OPEN"
    },
    "environment": "BLACK_FRAME_THEN_CRUISER",
    "title_card": null,
    "controls": "DIALOGUE_ONLY",
    "objective": "Listen to the missing-child report.",
    "narrative": "Open on Stanley calling the station. Preserve the missing-child report and address, then carry the call audio into the cruiser transition. This replaces a station interior, not the call itself. The player does not become Stanley or Mike during this audio prologue.",
    "blocking": "Black frame; no actor geometry.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Black frame. A phone rings once. No station, receptionist model or animated phone interface."
      },
      {
        "cue": "D02",
        "image": "Keep black while Stanley struggles to speak; add distant dogs only if reusable audio exists."
      },
      {
        "cue": "AFTER_D06",
        "image": "Cut to the existing passenger-seat opening. Phone noise resolves into cruiser engine noise. Show the Clarence card before player camera control in S02."
      }
    ],
    "audio": {
      "ambience": "One phone ring; caller breathing; distant dogs.",
      "cue_policy": "After D06, crossfade telephone texture to existing engine noise. No second missing-child dispatch.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Continue each subtitle or let existing recorded lines complete. The six lines run in order. No phone-answer minigame.",
    "build": {
      "preferred": "Reuse black/title overlay, subtitle channel and cruiser scene loading. The call is audio or subtitles, not a new station level.",
      "fallback": "Subtitles on black plus the existing cruiser ambience; no new voice-service dependency.",
      "new_minimum": [
        "Opening script data"
      ]
    },
    "continuity": [
      "Mike takes the call. Clarence remains the subsequent playable officer.",
      "The source break-room conversation moves into S02; its original order relative to the call changes."
    ],
    "entry": {
      "previous_scene": null,
      "checkpoint": "CP-01",
      "requirements": []
    },
    "exit": {
      "next_scene": "CF-S02",
      "condition": "All six lines and the audio-to-car cut complete.",
      "sets_flags": [
        "call_received",
        "address_known"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "No controllable unnamed body appears during the call.",
      "The call cannot fire a second time when the car scene becomes ready.",
      "No loading or skipped-audio failure prevents S02."
    ],
    "line_ids": [
      "CF-S01-D01",
      "CF-S01-D02",
      "CF-S01-D03",
      "CF-S01-D04",
      "CF-S01-D05",
      "CF-S01-D06"
    ],
    "adapter_key": "call",
    "cues": [
      "ENTRY",
      "D02",
      "AFTER_D06",
      "line:CF-S01-D01:start",
      "line:CF-S01-D01:complete",
      "line:CF-S01-D02:start",
      "line:CF-S01-D02:complete",
      "line:CF-S01-D03:start",
      "line:CF-S01-D03:complete",
      "line:CF-S01-D04:start",
      "line:CF-S01-D04:complete",
      "line:CF-S01-D05:start",
      "line:CF-S01-D05:complete",
      "line:CF-S01-D06:start",
      "line:CF-S01-D06:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Black frame. A phone rings once. No station, receptionist model or animated phone interface."
      },
      {
        "source_cue": "D02",
        "bound_cue": "D02",
        "trigger": "On canonical line display start.",
        "visual": "Keep black while Stanley struggles to speak; add distant dogs only if reusable audio exists."
      },
      {
        "source_cue": "AFTER_D06",
        "bound_cue": "AFTER_D06",
        "trigger": "After full acknowledgement of D06.",
        "visual": "Cut to the existing passenger-seat opening. Phone noise resolves into cruiser engine noise. Show the Clarence card before player camera control in S02."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S01-D01",
        "scene_id": "CF-S01",
        "line_id": "CF-S01-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S01-D02",
        "scene_id": "CF-S01",
        "line_id": "CF-S01-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S01-D03",
        "scene_id": "CF-S01",
        "line_id": "CF-S01-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S01-D04",
        "scene_id": "CF-S01",
        "line_id": "CF-S01-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S01-D05",
        "scene_id": "CF-S01",
        "line_id": "CF-S01-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S01-D06",
        "scene_id": "CF-S01",
        "line_id": "CF-S01-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "mike",
          "clarence"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Audience all; mike D01-D06; stanley D02-D05; clarence D06 only. Global call/address flags are not shared omniscience.",
    "logical_set_id": "BLACK_CALL",
    "physical_view_sets": [],
    "renderer_binding": "overlay",
    "anchor": "NONE",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Six canonical lines, then audio-to-cruiser cut once. No second dispatch or controllable body.",
    "required_asset_keys": [
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Subtitles on black plus the existing cruiser ambience; no new voice-service dependency.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S01-D02",
      "CF-S01-D04",
      "CF-S01-D06"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S01-D01",
        "CF-S01-D02",
        "CF-S01-D03",
        "CF-S01-D04",
        "CF-S01-D05",
        "CF-S01-D06"
      ],
      "required_cues": [
        "ENTRY",
        "D02",
        "AFTER_D06"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "All six lines and the audio-to-car cut complete."
    }
  },
  "CF-S02": {
    "scene_id": "CF-S02",
    "title": "Clarence rides; Mike drives",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.01:5-11"
    ],
    "fidelity": [
      "RELOCATED",
      "COMPRESSED"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON_PASSENGER"
    },
    "environment": "EXISTING_CRUISER_AND_APPROACH",
    "title_card": {
      "main": "CLARENCE",
      "sub": "PRESENT"
    },
    "controls": "LOOK_ONLY",
    "objective": "Ride with Mike to the Yates farm.",
    "narrative": "Mike talks about the standoff that still replays in his head. His partner had cardiac arrest during the 2002 event. The supplied novel does not establish that partner’s death. Clarence listens from the passenger seat while Mike drives. The drive ends at the farm without a crash.",
    "blocking": "Mike at driver transform, eyes toward road; Clarence camera at passenger transform.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Reveal passenger-side eye height after the card; Mike occupies the driver seat. Keep the existing rig and road segment."
      },
      {
        "cue": "D02",
        "image": "Road remains legible. Mike glances only through an existing animation or a static head pose; no newly choreographed driving."
      },
      {
        "cue": "AFTER_D06",
        "image": "Cruiser rolls or cuts into the gravel driveway. Farmhouse ahead, corn behind the house. Daylight is overcast, not already the full nightmare storm."
      }
    ],
    "audio": {
      "ambience": "Existing cruiser engine/road; conversation foreground.",
      "cue_policy": "No crash impact. Engine settles on arrival.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Look around without steering. Existing skip/continue applies. Exit the cruiser through the ordinary interaction or a cut to a safe standing position.",
    "build": {
      "preferred": "Swap the old player/companion bindings, not only name labels. Keep seat transforms, road staging and vehicle movement already implemented.",
      "fallback": "Stationary cruiser plus exterior movement/engine audio, then a clean arrival cut. A convincing drive is not a driving simulation.",
      "new_minimum": [
        "Role binding correction",
        "Arrival endpoint without crash"
      ]
    },
    "continuity": [
      "Never render Clarence driving in this route.",
      "Do not reuse the old line claiming the 2002 partner died. Cardiac arrest is the supported event.",
      "Preserve Mike’s personal history; do not transfer it to Clarence.",
      "The source is inconsistent about the interval since 2002. Do not specify a new present-day calendar year."
    ],
    "entry": {
      "previous_scene": "CF-S01",
      "checkpoint": "CP-02",
      "requirements": [
        "call_received"
      ]
    },
    "exit": {
      "next_scene": "CF-S03",
      "condition": "Conversation completed; arrival/exit acknowledged.",
      "sets_flags": [
        "arrived_at_farm"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Driver binding is Mike and camera binding is Clarence.",
      "No crash, glass task, arrest, shooting or custody route starts.",
      "Skip reaches the same safe driveway state as normal playback."
    ],
    "line_ids": [
      "CF-S02-D01",
      "CF-S02-D02",
      "CF-S02-D03",
      "CF-S02-D04",
      "CF-S02-D05",
      "CF-S02-D06"
    ],
    "adapter_key": "cruiser",
    "cues": [
      "ENTRY",
      "D02",
      "AFTER_D06",
      "line:CF-S02-D01:start",
      "line:CF-S02-D01:complete",
      "line:CF-S02-D02:start",
      "line:CF-S02-D02:complete",
      "line:CF-S02-D03:start",
      "line:CF-S02-D03:complete",
      "line:CF-S02-D04:start",
      "line:CF-S02-D04:complete",
      "line:CF-S02-D05:start",
      "line:CF-S02-D05:complete",
      "line:CF-S02-D06:start",
      "line:CF-S02-D06:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Reveal passenger-side eye height after the card; Mike occupies the driver seat. Keep the existing rig and road segment."
      },
      {
        "source_cue": "D02",
        "bound_cue": "D02",
        "trigger": "On canonical line display start.",
        "visual": "Road remains legible. Mike glances only through an existing animation or a static head pose; no newly choreographed driving."
      },
      {
        "source_cue": "AFTER_D06",
        "bound_cue": "AFTER_D06",
        "trigger": "After full acknowledgement of D06.",
        "visual": "Cruiser rolls or cuts into the gravel driveway. Farmhouse ahead, corn behind the house. Daylight is overcast, not already the full nightmare storm."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S02-D01",
        "scene_id": "CF-S02",
        "line_id": "CF-S02-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S02-D02",
        "scene_id": "CF-S02",
        "line_id": "CF-S02-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S02-D03",
        "scene_id": "CF-S02",
        "line_id": "CF-S02-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S02-D04",
        "scene_id": "CF-S02",
        "line_id": "CF-S02-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S02-D05",
        "scene_id": "CF-S02",
        "line_id": "CF-S02-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S02-D06",
        "scene_id": "CF-S02",
        "line_id": "CF-S02-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Audience + clarence + mike; cardiac arrest account remains Mike's, no partner-death fact.",
    "logical_set_id": "CRUISER",
    "physical_view_sets": [],
    "renderer_binding": "existing-cruiser",
    "anchor": "EXISTING_PASSENGER_SEAT",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Actual inspected driver/passenger roles already Mike/Clarence despite legacy actor key clarence. Preserve correct rig; replace script and bypass old opening/crash route. Stationary cruiser + arrival cut is permitted if driving is unavailable.",
    "required_asset_keys": [
      "A01",
      "A02",
      "A03",
      "A06",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Stationary cruiser plus exterior movement/engine audio, then a clean arrival cut. A convincing drive is not a driving simulation.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S02-D01",
      "CF-S02-D02",
      "CF-S02-D06"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S02-D01",
        "CF-S02-D02",
        "CF-S02-D03",
        "CF-S02-D04",
        "CF-S02-D05",
        "CF-S02-D06"
      ],
      "required_cues": [
        "ENTRY",
        "D02",
        "AFTER_D06"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Conversation completed; arrival/exit acknowledged."
    }
  },
  "CF-S03": {
    "scene_id": "CF-S03",
    "title": "At the Yates doorstep",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.03:26-37"
    ],
    "fidelity": [
      "DIRECT",
      "COMPRESSED"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON"
    },
    "environment": "FARM_FRONT_AND_INTERVIEW_ROOM",
    "title_card": null,
    "controls": "WALK_AND_LOOK_NO_COMBAT",
    "objective": "Follow Stanley inside.",
    "narrative": "Stanley meets the officers at the gravel drive. The protective border collie reacts to Clarence. Stanley says the dog was the last one with Sadie. The officers enter a small living space, retaining the source’s nervous encounter and Mike’s teasing.",
    "blocking": "Stanley by porch; Mike beside him; Glenda can remain offscreen inside.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Stanley is a stationary actor near the porch. A dog can be represented just offscreen by bark audio and the characters looking down."
      },
      {
        "cue": "D03",
        "image": "Clarence looks downward; do not require an animated reaching hand or dog interaction."
      },
      {
        "cue": "AFTER_D06",
        "image": "Open the front door into a compact foyer/living-room/kitchen connection. Use one visible corridor, not a mansion maze."
      }
    ],
    "audio": {
      "ambience": "Gravel steps, one protective dog bark, doorway sound.",
      "cue_policy": "Bark before D04; stop barking once interview starts.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "One short walk into the living room. One interaction opens the door. The first mandatory conversation position is clearly marked without a collectible puzzle.",
    "build": {
      "preferred": "Use the current house exterior, one room/corridor shell and existing Stanley/Mike models. Keep a continuous front-door threshold where feasible.",
      "fallback": "Door interaction masks a room load; place the return door consistently. Dog stays offscreen.",
      "new_minimum": [
        "Interview interior only if not present",
        "Door/arrival trigger"
      ]
    },
    "continuity": [
      "The manuscript alternates Duke/Maury and animal gender. Use “the dog” in adapted dialogue; retain the source conflict in the ledger.",
      "The corn is behind the Yates house in the novel. Earlier across-the-road concept art is superseded."
    ],
    "entry": {
      "previous_scene": "CF-S02",
      "checkpoint": "CP-03",
      "requirements": [
        "arrived_at_farm"
      ]
    },
    "exit": {
      "next_scene": "CF-S04",
      "condition": "Player reaches the interview anchor; introduction finishes.",
      "sets_flags": [
        "family_met"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "No full dog model is required to advance.",
      "House entry and return threshold are collision-safe.",
      "No opening companion is silently removed before the interview."
    ],
    "line_ids": [
      "CF-S03-D01",
      "CF-S03-D02",
      "CF-S03-D03",
      "CF-S03-D04",
      "CF-S03-D05",
      "CF-S03-D06",
      "CF-S03-D07",
      "CF-S03-D08"
    ],
    "adapter_key": "farm",
    "cues": [
      "ENTRY",
      "D03",
      "AFTER_D06",
      "line:CF-S03-D01:start",
      "line:CF-S03-D01:complete",
      "line:CF-S03-D02:start",
      "line:CF-S03-D02:complete",
      "line:CF-S03-D03:start",
      "line:CF-S03-D03:complete",
      "line:CF-S03-D04:start",
      "line:CF-S03-D04:complete",
      "line:CF-S03-D05:start",
      "line:CF-S03-D05:complete",
      "line:CF-S03-D06:start",
      "line:CF-S03-D06:complete",
      "line:CF-S03-D07:start",
      "line:CF-S03-D07:complete",
      "line:CF-S03-D08:start",
      "line:CF-S03-D08:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Stanley is a stationary actor near the porch. A dog can be represented just offscreen by bark audio and the characters looking down."
      },
      {
        "source_cue": "D03",
        "bound_cue": "D03",
        "trigger": "On canonical line display start.",
        "visual": "Clarence looks downward; do not require an animated reaching hand or dog interaction."
      },
      {
        "source_cue": "AFTER_D06",
        "bound_cue": "AFTER_D06",
        "trigger": "After full acknowledgement of D06.",
        "visual": "Open the front door into a compact foyer/living-room/kitchen connection. Use one visible corridor, not a mansion maze."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S03-D01",
        "scene_id": "CF-S03",
        "line_id": "CF-S03-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S03-D02",
        "scene_id": "CF-S03",
        "line_id": "CF-S03-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S03-D03",
        "scene_id": "CF-S03",
        "line_id": "CF-S03-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S03-D04",
        "scene_id": "CF-S03",
        "line_id": "CF-S03-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S03-D05",
        "scene_id": "CF-S03",
        "line_id": "CF-S03-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S03-D06",
        "scene_id": "CF-S03",
        "line_id": "CF-S03-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S03-D07",
        "scene_id": "CF-S03",
        "line_id": "CF-S03-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S03-D08",
        "scene_id": "CF-S03",
        "line_id": "CF-S03-D08",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Audience and present Clarence/Mike/Stanley.",
    "logical_set_id": "FARM_FRONT_TO_INTERVIEW",
    "physical_view_sets": [
      "FARM_FRONT",
      "FARM_INTERIOR"
    ],
    "renderer_binding": "v31-view",
    "anchor": "FARM_FRONT -> FRONT_DOOR -> INTERVIEW",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "D01-D06 at front; door interaction after D06 masks shell load if needed; D07-D08 finish at interview anchor. Existing house is exterior only: minimal shell required, not claim of existing interior.",
    "required_asset_keys": [
      "A01",
      "A03",
      "A04",
      "A06",
      "A07",
      "A13",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Door interaction masks a room load; place the return door consistently. Dog stays offscreen.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S03-D01",
      "CF-S03-D05",
      "CF-S03-D06"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S03-D01",
        "CF-S03-D02",
        "CF-S03-D03",
        "CF-S03-D04",
        "CF-S03-D05",
        "CF-S03-D06",
        "CF-S03-D07",
        "CF-S03-D08"
      ],
      "required_cues": [
        "ENTRY",
        "D03",
        "AFTER_D06"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Player reaches the interview anchor; introduction finishes."
    }
  },
  "CF-S04": {
    "scene_id": "CF-S04",
    "title": "What happened to Sadie",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.04:40-58"
    ],
    "fidelity": [
      "DIRECT",
      "COMPRESSED"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON"
    },
    "environment": "YATES_INTERVIEW_ROOM",
    "title_card": null,
    "controls": "LOOK_AND_DIALOGUE",
    "objective": "Hear Stanley’s account.",
    "narrative": "Stanley describes the disappearance, the endless corn, parental supervision and the direction rule. Save the explicit torn-jacket description for S08 so it triggers Clarence’s memory after Sadie’s classroom sequence. The case remains open; Stanley’s fear is not proof of abduction or parental guilt.",
    "blocking": "Stanley opposite camera, Glenda kitchen side, Mike at table corner; static idle poses.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Stanley seated at the table; Glenda near an untouched coffee. Mike opposite or at the table corner. Clarence remains the camera."
      },
      {
        "cue": "D04",
        "image": "Frame the back window and corn when Stanley describes looking away. No reenactment that reveals what took Sadie."
      },
      {
        "cue": "D09",
        "image": "Glenda can speak from the kitchen side without walking animation. Keep everyone’s direction toward the same fields."
      }
    ],
    "audio": {
      "ambience": "Quiet room, distant farm wind; no horror sting.",
      "cue_policy": "Keep ambience low enough for every line. Silence after Stanley describes the disappearance.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Look freely within a comfortable seated or standing range. Advance dialogue. No deduction wheel and no branching interrogation.",
    "build": {
      "preferred": "One stationary interview arrangement. Reuse subtitles, ambient room audio and existing idle poses.",
      "fallback": "Show Glenda over the shoulder or let her speak offscreen from the kitchen if no model is available.",
      "new_minimum": [
        "Interview script and staging"
      ]
    },
    "continuity": [
      "Sadie is missing, not confirmed dead, transformed, rescued or seen in the present.",
      "Do not stage a visible captor in the disappearance account.",
      "The compass statement is the family’s description, not a real-world navigation tutorial."
    ],
    "entry": {
      "previous_scene": "CF-S03",
      "checkpoint": "CP-04",
      "requirements": [
        "family_met"
      ]
    },
    "exit": {
      "next_scene": "CF-S05",
      "condition": "All interview lines acknowledged.",
      "sets_flags": [
        "sadie_disappearance_known",
        "north_rule_known",
        "owen_location_known"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Both parents’ statements are labeled as their accounts.",
      "Gray-jacket trigger has not fired yet.",
      "Narrative sequence does not require a family photograph asset."
    ],
    "line_ids": [
      "CF-S04-D01",
      "CF-S04-D02",
      "CF-S04-D03",
      "CF-S04-D04",
      "CF-S04-D05",
      "CF-S04-D06",
      "CF-S04-D07",
      "CF-S04-D08",
      "CF-S04-D09",
      "CF-S04-D10",
      "CF-S04-D11"
    ],
    "adapter_key": "farm",
    "cues": [
      "ENTRY",
      "D04",
      "D08",
      "line:CF-S04-D01:start",
      "line:CF-S04-D01:complete",
      "line:CF-S04-D02:start",
      "line:CF-S04-D02:complete",
      "line:CF-S04-D03:start",
      "line:CF-S04-D03:complete",
      "line:CF-S04-D04:start",
      "line:CF-S04-D04:complete",
      "line:CF-S04-D05:start",
      "line:CF-S04-D05:complete",
      "line:CF-S04-D06:start",
      "line:CF-S04-D06:complete",
      "line:CF-S04-D07:start",
      "line:CF-S04-D07:complete",
      "line:CF-S04-D08:start",
      "line:CF-S04-D08:complete",
      "line:CF-S04-D09:start",
      "line:CF-S04-D09:complete",
      "line:CF-S04-D10:start",
      "line:CF-S04-D10:complete",
      "line:CF-S04-D11:start",
      "line:CF-S04-D11:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Stanley seated at the table; Glenda near an untouched coffee. Mike opposite or at the table corner. Clarence remains the camera."
      },
      {
        "source_cue": "D04",
        "bound_cue": "D04",
        "trigger": "On canonical line display start.",
        "visual": "Frame the back window and corn when Stanley describes looking away. No reenactment that reveals what took Sadie."
      },
      {
        "source_cue": "D09",
        "bound_cue": "D08",
        "trigger": "On canonical line display start.",
        "visual": "Glenda can speak from the kitchen side without walking animation. Keep everyone’s direction toward the same fields."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S04-D01",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S04-D02",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S04-D03",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S04-D04",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S04-D05",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S04-D06",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S04-D07",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S04-D08",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D08",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S04-D09",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D09",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S04-D10",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D10",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S04-D11",
        "scene_id": "CF-S04",
        "line_id": "CF-S04-D11",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Audience and present Clarence/Mike/Stanley/Glenda; attributed reports, no guilt/captor proof.",
    "logical_set_id": "INTERVIEW",
    "physical_view_sets": [
      "FARM_INTERIOR"
    ],
    "renderer_binding": "v31-view",
    "anchor": "INTERVIEW",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "CUE-FIX-01 binds Glenda kitchen-side visual to D08, not source D09 (Stanley). No line text/order changes. Glenda offscreen captions by default unless suitable model verified.",
    "required_asset_keys": [
      "A03",
      "A04",
      "A05",
      "A07",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Show Glenda over the shoulder or let her speak offscreen from the kitchen if no model is available.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S04-D01",
      "CF-S04-D03",
      "CF-S04-D04",
      "CF-S04-D09",
      "CF-S04-D11"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S04-D01",
        "CF-S04-D02",
        "CF-S04-D03",
        "CF-S04-D04",
        "CF-S04-D05",
        "CF-S04-D06",
        "CF-S04-D07",
        "CF-S04-D08",
        "CF-S04-D09",
        "CF-S04-D10",
        "CF-S04-D11"
      ],
      "required_cues": [
        "ENTRY",
        "D04",
        "D08"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "All interview lines acknowledged."
    }
  },
  "CF-S05": {
    "scene_id": "CF-S05",
    "title": "Owen comes home; the search gathers",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.06:90-114"
    ],
    "fidelity": [
      "RELOCATED",
      "AUDIO_ONLY",
      "COMPRESSED"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON_OBSERVER"
    },
    "environment": "YATES_INTERVIEW_ROOM_AND_PORCH",
    "title_card": null,
    "controls": "LOOK_AND_DIALOGUE",
    "objective": "Wait for the family reunion and search briefing.",
    "narrative": "Retain Owen learning that his sister disappeared while he watched television at Finn’s, his return and Glenda’s frightened embrace. Avoid a second house by reporting the visit through a patrol officer and staging the reunion just beyond the doorway. This changes who escorts Owen: the novel sends Mike and Clarence; the MVP uses an offscreen unit.",
    "blocking": "Move Glenda out of frame before reunion lines; imply Owen through doorway framing.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Radio and driveway sounds establish arriving patrol cars. No crowd of vehicles needs independent AI."
      },
      {
        "cue": "D03",
        "image": "Brief audience-only narrated insert on the living-room doorway, not Clarence reading Owen’s mind."
      },
      {
        "cue": "D04",
        "image": "Glenda moves out of frame or cuts to the porch. Owen speaks offscreen; an embrace can remain implied by framing."
      },
      {
        "cue": "D07",
        "image": "Return to the interview room as Mike explains the property search."
      }
    ],
    "audio": {
      "ambience": "Patrol radio, tires on gravel, offscreen reunion.",
      "cue_policy": "Glenda and Owen voices from porch; no looped crying.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "One short observational beat; continue dialogue returns control in the interview room. No player task to find Owen.",
    "build": {
      "preferred": "Radio voice/subtitles, one doorway sound cue and Glenda’s existing idle. Owen can remain an offscreen voice.",
      "fallback": "All reunion action appears as narrated captions while the camera holds the doorway. Do not omit the emotional event just because a child model is unavailable.",
      "new_minimum": [
        "Owen/reunion dialogue and search briefing"
      ]
    },
    "continuity": [
      "This is a disclosed compression of the Harris visit, not its exact staging.",
      "Omit the source’s 48-hour claim from playable instructions; record it as unused fictional dialogue, not silently corrected canon.",
      "Suspicion remains character attitude; the game never confirms the parents’ guilt."
    ],
    "entry": {
      "previous_scene": "CF-S04",
      "checkpoint": "CP-05",
      "requirements": [
        "owen_location_known"
      ]
    },
    "exit": {
      "next_scene": "CF-S06",
      "condition": "Reunion and property-search exchange complete.",
      "sets_flags": [
        "owen_informed",
        "owen_returned",
        "search_organized"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Owen’s return is stated even with no Owen model.",
      "Glenda is not simultaneously at the porch and visibly seated.",
      "No missing-person waiting period is encoded as a game gate."
    ],
    "line_ids": [
      "CF-S05-D01",
      "CF-S05-D02",
      "CF-S05-D03",
      "CF-S05-D04",
      "CF-S05-D05",
      "CF-S05-D06",
      "CF-S05-D07",
      "CF-S05-D08",
      "CF-S05-D09"
    ],
    "adapter_key": "farm",
    "cues": [
      "ENTRY",
      "D03",
      "D04",
      "D06",
      "line:CF-S05-D01:start",
      "line:CF-S05-D01:complete",
      "line:CF-S05-D02:start",
      "line:CF-S05-D02:complete",
      "line:CF-S05-D03:start",
      "line:CF-S05-D03:complete",
      "line:CF-S05-D04:start",
      "line:CF-S05-D04:complete",
      "line:CF-S05-D05:start",
      "line:CF-S05-D05:complete",
      "line:CF-S05-D06:start",
      "line:CF-S05-D06:complete",
      "line:CF-S05-D07:start",
      "line:CF-S05-D07:complete",
      "line:CF-S05-D08:start",
      "line:CF-S05-D08:complete",
      "line:CF-S05-D09:start",
      "line:CF-S05-D09:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Radio and driveway sounds establish arriving patrol cars. No crowd of vehicles needs independent AI."
      },
      {
        "source_cue": "D03",
        "bound_cue": "D03",
        "trigger": "On canonical line display start.",
        "visual": "Brief audience-only narrated insert on the living-room doorway, not Clarence reading Owen’s mind."
      },
      {
        "source_cue": "D04",
        "bound_cue": "D04",
        "trigger": "On canonical line display start.",
        "visual": "Glenda moves out of frame or cuts to the porch. Owen speaks offscreen; an embrace can remain implied by framing."
      },
      {
        "source_cue": "D07",
        "bound_cue": "D06",
        "trigger": "On canonical line display start.",
        "visual": "Return to the interview room as Mike explains the property search."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S05-D01",
        "scene_id": "CF-S05",
        "line_id": "CF-S05-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S05-D02",
        "scene_id": "CF-S05",
        "line_id": "CF-S05-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S05-D03",
        "scene_id": "CF-S05",
        "line_id": "CF-S05-D03",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S05-D04",
        "scene_id": "CF-S05",
        "line_id": "CF-S05-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S05-D05",
        "scene_id": "CF-S05",
        "line_id": "CF-S05-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S05-D06",
        "scene_id": "CF-S05",
        "line_id": "CF-S05-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S05-D07",
        "scene_id": "CF-S05",
        "line_id": "CF-S05-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S05-D08",
        "scene_id": "CF-S05",
        "line_id": "CF-S05-D08",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S05-D09",
        "scene_id": "CF-S05",
        "line_id": "CF-S05-D09",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "D03 audience only. Other lines local participants; Owen needs no new tracked namespace.",
    "logical_set_id": "INTERVIEW_PORCH",
    "physical_view_sets": [
      "FARM_INTERIOR",
      "FARM_FRONT",
      "FARM_INTERIOR"
    ],
    "renderer_binding": "v31-view",
    "anchor": "INTERVIEW -> FRONT_DOOR -> INTERVIEW",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "CUE-FIX-02 binds return-room Mike briefing to D06, not source D07 (Glenda). D03 audience-only; D04-D05 doorway reunion. No Owen-search task.",
    "required_asset_keys": [
      "A03",
      "A04",
      "A05",
      "A06",
      "A07",
      "A13",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "All reunion action appears as narrated captions while the camera holds the doorway. Do not omit the emotional event just because a child model is unavailable.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S05-D01",
      "CF-S05-D02",
      "CF-S05-D03",
      "CF-S05-D05",
      "CF-S05-D06",
      "CF-S05-D08"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S05-D01",
        "CF-S05-D02",
        "CF-S05-D03",
        "CF-S05-D04",
        "CF-S05-D05",
        "CF-S05-D06",
        "CF-S05-D07",
        "CF-S05-D08",
        "CF-S05-D09"
      ],
      "required_cues": [
        "ENTRY",
        "D03",
        "D04",
        "D06"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Reunion and property-search exchange complete."
    }
  },
  "CF-S06": {
    "scene_id": "CF-S06",
    "title": "The behavior before the disappearance",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.07:117-139"
    ],
    "fidelity": [
      "RELOCATED",
      "COMPRESSED"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON"
    },
    "environment": "YATES_INTERVIEW_ROOM",
    "title_card": null,
    "controls": "LOOK_AND_DIALOGUE",
    "objective": "Listen to Glenda describe Sadie’s childhood.",
    "narrative": "Bring Section 7 forward into the family interview. Preserve the psychologist’s assessment as an attributed opinion, Stanley and Glenda’s disagreement, the educational support and Sadie’s long attention toward the fields. The source’s school professionals do not become antagonists or evidence of supernatural powers.",
    "blocking": "Glenda handles the account; Stanley interrupts only at scripted lines; no reaction animation dependency.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Glenda holds the coffee cup without an elaborate hand animation. A shelf or family photo is optional."
      },
      {
        "cue": "D05",
        "image": "Stanley glances toward the back window. Avoid medical paperwork close-ups or fabricated test results."
      },
      {
        "cue": "AFTER_D11",
        "image": "Room sound narrows into classroom ambience. Cut to SADIE before the new viewpoint becomes interactive."
      }
    ],
    "audio": {
      "ambience": "Same farm room ambience.",
      "cue_policy": "After D11, room fades to ordinary classroom tone.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "No diagnosis selection. Dialogue advances into an audience dramatization of the classroom event, not Clarence telepathically entering Sadie.",
    "build": {
      "preferred": "Continue the same interview script and reuse memory-transition logic.",
      "fallback": "Subtitles and a hard cut. Do not build a clinic, school office, pub or testing minigame.",
      "new_minimum": [
        "Family-background dialogue",
        "School-memory transition"
      ]
    },
    "continuity": [
      "“Kindergarten” is the approved game designation; the novel says homeroom/circle time and gives no exact grade.",
      "No new diagnosis is assigned to Sadie. The source’s professional-title ambiguity stays documented.",
      "This memory belongs to the audience’s story presentation, not Clarence’s knowledge."
    ],
    "entry": {
      "previous_scene": "CF-S05",
      "checkpoint": "CP-06",
      "requirements": [
        "owen_returned"
      ]
    },
    "exit": {
      "next_scene": "CF-S07",
      "condition": "Glenda’s classroom setup finishes.",
      "sets_flags": [
        "sadie_background_reported"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "All medical/educational statements remain attributed to characters.",
      "Scene does not reveal the creature in the classroom.",
      "The flashback return anchor is saved before S07."
    ],
    "line_ids": [
      "CF-S06-D01",
      "CF-S06-D02",
      "CF-S06-D03",
      "CF-S06-D04",
      "CF-S06-D05",
      "CF-S06-D06",
      "CF-S06-D07",
      "CF-S06-D08",
      "CF-S06-D09",
      "CF-S06-D10",
      "CF-S06-D11"
    ],
    "adapter_key": "farm",
    "cues": [
      "ENTRY",
      "D05",
      "AFTER_D11",
      "line:CF-S06-D01:start",
      "line:CF-S06-D01:complete",
      "line:CF-S06-D02:start",
      "line:CF-S06-D02:complete",
      "line:CF-S06-D03:start",
      "line:CF-S06-D03:complete",
      "line:CF-S06-D04:start",
      "line:CF-S06-D04:complete",
      "line:CF-S06-D05:start",
      "line:CF-S06-D05:complete",
      "line:CF-S06-D06:start",
      "line:CF-S06-D06:complete",
      "line:CF-S06-D07:start",
      "line:CF-S06-D07:complete",
      "line:CF-S06-D08:start",
      "line:CF-S06-D08:complete",
      "line:CF-S06-D09:start",
      "line:CF-S06-D09:complete",
      "line:CF-S06-D10:start",
      "line:CF-S06-D10:complete",
      "line:CF-S06-D11:start",
      "line:CF-S06-D11:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Glenda holds the coffee cup without an elaborate hand animation. A shelf or family photo is optional."
      },
      {
        "source_cue": "D05",
        "bound_cue": "D05",
        "trigger": "On canonical line display start.",
        "visual": "Stanley glances toward the back window. Avoid medical paperwork close-ups or fabricated test results."
      },
      {
        "source_cue": "AFTER_D11",
        "bound_cue": "AFTER_D11",
        "trigger": "After full acknowledgement of D11.",
        "visual": "Room sound narrows into classroom ambience. Cut to SADIE before the new viewpoint becomes interactive."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S06-D01",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S06-D02",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S06-D03",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S06-D04",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S06-D05",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S06-D06",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S06-D07",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S06-D08",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D08",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S06-D09",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D09",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S06-D10",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D10",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S06-D11",
        "scene_id": "CF-S06",
        "line_id": "CF-S06-D11",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Interview participants hear attributed reports only; school event below is not direct Clarence memory.",
    "logical_set_id": "INTERVIEW",
    "physical_view_sets": [
      "FARM_INTERIOR"
    ],
    "renderer_binding": "v31-view",
    "anchor": "INTERVIEW",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Capture adult return_context after D11 before S07; no fabricated diagnosis/medical paperwork. The audience school cutaway is not Clarence telepathy.",
    "required_asset_keys": [
      "A03",
      "A04",
      "A05",
      "A07",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Subtitles and a hard cut. Do not build a clinic, school office, pub or testing minigame.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S06-D01",
      "CF-S06-D02",
      "CF-S06-D03",
      "CF-S06-D07",
      "CF-S06-D08",
      "CF-S06-D11"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S06-D01",
        "CF-S06-D02",
        "CF-S06-D03",
        "CF-S06-D04",
        "CF-S06-D05",
        "CF-S06-D06",
        "CF-S06-D07",
        "CF-S06-D08",
        "CF-S06-D09",
        "CF-S06-D10",
        "CF-S06-D11"
      ],
      "required_cues": [
        "ENTRY",
        "D05",
        "AFTER_D11"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Glenda’s classroom setup finishes."
    }
  },
  "CF-S07": {
    "scene_id": "CF-S07",
    "title": "Sadie after circle time",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.07:117-118"
    ],
    "fidelity": [
      "DRAMATIZED",
      "APPROVED_ADAPTATION"
    ],
    "perspective": {
      "character": "SADIE",
      "period": "CHILDHOOD",
      "mode": "FIRST_PERSON_SEATED"
    },
    "environment": "KINDERGARTEN_SINGLE_ROOM",
    "title_card": {
      "main": "SADIE",
      "sub": "KINDERGARTEN"
    },
    "controls": "LOOK_ONLY_NO_BODY_NO_COMBAT",
    "objective": "Look around the classroom.",
    "narrative": "A short first-person view from Sadie’s seated height. Circle time is over. She stays on the rug while her teacher calls her attention back. Keep the event understated. No explicit apparition is required, and an ordinary school window avoids claiming the real classroom bordered the Yates cornfields.",
    "blocking": "No visible teacher or classmates required; child camera stays seated.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Warm daylight. Faded circle-time rug in foreground, low wooden shelves, three simple small tables, a few chairs, cubbies and one window."
      },
      {
        "cue": "LOOK_AROUND",
        "image": "The room feels ordinary but quiet. Other pupils remain offscreen. Camera rotates naturally; no forced head movement."
      },
      {
        "cue": "D02",
        "image": "Sound gently thins. A still ordinary window is the visual anchor. Do not make cornstalks physically materialize in the school."
      },
      {
        "cue": "AFTER_D03",
        "image": "Cut on “Sadie” or the end of the teacher’s call. Restore the interview in S08 with the Clarence card."
      }
    ],
    "audio": {
      "ambience": "Soft school room tone; others distantly beyond frame.",
      "cue_policy": "Teacher offscreen near doorway; no monstrous voice or jump-scare burst.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Player can look from the rug. After a short minimum observation beat, show Continue. Teacher lines must also complete through Continue if the window is never looked at. No forced gaze unlock.",
    "build": {
      "preferred": "One simple room, one low camera, ordinary existing movement controller disabled except look, existing subtitle system.",
      "fallback": "Static 3D blockout and offscreen teacher captions. No Sadie body, teacher, classmates, school corridor or crowd system.",
      "new_minimum": [
        "Classroom shell",
        "Rug, shelves, cubbies, tables/chairs using repeated primitives"
      ]
    },
    "continuity": [
      "Sadie’s exact age and diagnosis remain unspecified.",
      "The prior cornfield-window visual echo is optional mood art, not an approved literal event in this more faithful cut. Default it off.",
      "Do not suggest that childhood educational support caused the horror."
    ],
    "entry": {
      "previous_scene": "CF-S06",
      "checkpoint": "CP-07",
      "requirements": [
        "sadie_background_reported",
        "return_anchor_saved"
      ]
    },
    "exit": {
      "next_scene": "CF-S08",
      "condition": "Teacher sequence completes and player continues; no gaze requirement.",
      "sets_flags": [
        "sadie_memory_seen"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "No adult pistol/hands, health HUD or enemy damage appears.",
      "Teacher can be understood with sound muted.",
      "Skipping and normal completion return to the same interview anchor."
    ],
    "line_ids": [
      "CF-S07-D01",
      "CF-S07-D02",
      "CF-S07-D03"
    ],
    "adapter_key": "schoolMemory",
    "cues": [
      "ENTRY",
      "LOOK_AROUND",
      "D02",
      "AFTER_D03",
      "line:CF-S07-D01:start",
      "line:CF-S07-D01:complete",
      "line:CF-S07-D02:start",
      "line:CF-S07-D02:complete",
      "line:CF-S07-D03:start",
      "line:CF-S07-D03:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Warm daylight. Faded circle-time rug in foreground, low wooden shelves, three simple small tables, a few chairs, cubbies and one window."
      },
      {
        "source_cue": "LOOK_AROUND",
        "bound_cue": "LOOK_AROUND",
        "trigger": "Explicit adapter event; deterministic trigger specified in binding note and master interaction.",
        "visual": "The room feels ordinary but quiet. Other pupils remain offscreen. Camera rotates naturally; no forced head movement."
      },
      {
        "source_cue": "D02",
        "bound_cue": "D02",
        "trigger": "On canonical line display start.",
        "visual": "Sound gently thins. A still ordinary window is the visual anchor. Do not make cornstalks physically materialize in the school."
      },
      {
        "source_cue": "AFTER_D03",
        "bound_cue": "AFTER_D03",
        "trigger": "After full acknowledgement of D03.",
        "visual": "Cut on “Sadie” or the end of the teacher’s call. Restore the interview in S08 with the Clarence card."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S07-D01",
        "scene_id": "CF-S07",
        "line_id": "CF-S07-D01",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S07-D02",
        "scene_id": "CF-S07",
        "line_id": "CF-S07-D02",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S07-D03",
        "scene_id": "CF-S07",
        "line_id": "CF-S07-D03",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "SADIE labels unchanged; tracked audience only. No modern principal receives teacher facts.",
    "logical_set_id": "CLASSROOM",
    "physical_view_sets": [
      "CLASSROOM"
    ],
    "renderer_binding": "v31-view",
    "anchor": "EXISTING_CLASSROOM_EYE",
    "memory_return": "Capture at S06 exit; derived return_anchor_saved. Save token-bound transform, camera height/look, input mode, relevant inventory/HUD/objective. Restore/consume only after S08 safe entry succeeds, same normal/Skip state.",
    "binding_note": "Reuse actual createClassroom eye (-0.35,0.68,1.4); setEcho(false). Do not use legacy classroomBeat corn echo, old single line or timed 26-second exit. Three active seconds observation then exact D01-D03 via Continue; never-window path succeeds.",
    "required_asset_keys": [
      "A08",
      "A09",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Static 3D blockout and offscreen teacher captions. No Sadie body, teacher, classmates, school corridor or crowd system.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S07-D02",
      "CF-S07-D03"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S07-D01",
        "CF-S07-D02",
        "CF-S07-D03"
      ],
      "required_cues": [
        "ENTRY",
        "D02",
        "AFTER_D03"
      ],
      "minimum_active_seconds": 3,
      "adapter_condition": "Teacher sequence completes and player continues; no gaze requirement."
    }
  },
  "CF-S08": {
    "scene_id": "CF-S08",
    "title": "The torn gray jacket",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.04:41-47"
    ],
    "fidelity": [
      "DIRECT",
      "RELOCATED"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON"
    },
    "environment": "YATES_INTERVIEW_ROOM",
    "title_card": {
      "main": "CLARENCE",
      "sub": "PRESENT"
    },
    "controls": "LOOK_AND_DIALOGUE",
    "objective": "Hear what Sadie reported seeing.",
    "narrative": "Re-anchor in the living room before another memory. Stanley now reports the dinner conversation about a man in the corn. Hearing the jacket description unsettles Clarence privately. The story has not proved that Sadie saw the same creature he did.",
    "blocking": "Stanley retells Sadie, rather than Sadie appearing live.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Same table and actor positions as before the classroom cut. Re-establish the room for one completed exchange."
      },
      {
        "cue": "D04",
        "image": "Stanley quotes Sadie. Do not display Sadie as a live present-day actor at the table."
      },
      {
        "cue": "AFTER_D07",
        "image": "Clarence’s attention fixes on the field-facing window. Cut to his childhood, rather than revealing a zombie outside now."
      }
    ],
    "audio": {
      "ambience": "Restore the same room ambience immediately.",
      "cue_policy": "No school audio under the private recognition line.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Look and advance. The memory follows the line cue once, not a repeatable window proximity trigger.",
    "build": {
      "preferred": "Use the same dialogue chain, mark the quoted line as Stanley’s voice with a subtitle cue “Stanley, quoting Sadie”.",
      "fallback": "Plain subtitles; do not require a recorded Sadie voice or an animated dinner reenactment.",
      "new_minimum": [
        "Gray-jacket cue",
        "Clarence-memory trigger"
      ]
    },
    "continuity": [
      "No supernatural link is confirmed by the visual cut.",
      "Clarence does not confess to the family here. His later disclosure to Glenda must still matter."
    ],
    "entry": {
      "previous_scene": "CF-S07",
      "checkpoint": "CP-08",
      "requirements": [
        "sadie_memory_seen"
      ]
    },
    "exit": {
      "next_scene": "CF-S09",
      "condition": "Private recognition cue completes; return anchor saved.",
      "sets_flags": [
        "gray_jacket_report_heard"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "The room is shown between flashbacks, not two unexplained black cuts.",
      "Family NPCs cannot respond to Clarence’s inner voice.",
      "S09 only fires once per fresh story run."
    ],
    "line_ids": [
      "CF-S08-D01",
      "CF-S08-D02",
      "CF-S08-D03",
      "CF-S08-D04",
      "CF-S08-D05",
      "CF-S08-D06",
      "CF-S08-D07"
    ],
    "adapter_key": "farm",
    "cues": [
      "ENTRY",
      "D04",
      "AFTER_D07",
      "line:CF-S08-D01:start",
      "line:CF-S08-D01:complete",
      "line:CF-S08-D02:start",
      "line:CF-S08-D02:complete",
      "line:CF-S08-D03:start",
      "line:CF-S08-D03:complete",
      "line:CF-S08-D04:start",
      "line:CF-S08-D04:complete",
      "line:CF-S08-D05:start",
      "line:CF-S08-D05:complete",
      "line:CF-S08-D06:start",
      "line:CF-S08-D06:complete",
      "line:CF-S08-D07:start",
      "line:CF-S08-D07:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Same table and actor positions as before the classroom cut. Re-establish the room for one completed exchange."
      },
      {
        "source_cue": "D04",
        "bound_cue": "D04",
        "trigger": "On canonical line display start.",
        "visual": "Stanley quotes Sadie. Do not display Sadie as a live present-day actor at the table."
      },
      {
        "source_cue": "AFTER_D07",
        "bound_cue": "AFTER_D07",
        "trigger": "After full acknowledgement of D07.",
        "visual": "Clarence’s attention fixes on the field-facing window. Cut to his childhood, rather than revealing a zombie outside now."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S08-D01",
        "scene_id": "CF-S08",
        "line_id": "CF-S08-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S08-D02",
        "scene_id": "CF-S08",
        "line_id": "CF-S08-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S08-D03",
        "scene_id": "CF-S08",
        "line_id": "CF-S08-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S08-D04",
        "scene_id": "CF-S08",
        "line_id": "CF-S08-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S08-D05",
        "scene_id": "CF-S08",
        "line_id": "CF-S08-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S08-D06",
        "scene_id": "CF-S08",
        "line_id": "CF-S08-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S08-D07",
        "scene_id": "CF-S08",
        "line_id": "CF-S08-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "D01-D06 interview participants; D07 audience + clarence only. No family confession.",
    "logical_set_id": "INTERVIEW",
    "physical_view_sets": [
      "FARM_INTERIOR"
    ],
    "renderer_binding": "v31-view",
    "anchor": "INTERVIEW (restored S06 context)",
    "memory_return": "Restore/consume S06 return context before control, then capture fresh S08 context on exit to S09. At least one completed farmhouse exchange between memories.",
    "binding_note": "Restore/consume S06 return_context before PRESENT card/input. Complete room exchange; D04 Stanley quoting Sadie. AFTER_D07 captures new S08 return_context for S09; no family confession.",
    "required_asset_keys": [
      "A03",
      "A04",
      "A05",
      "A07",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Plain subtitles; do not require a recorded Sadie voice or an animated dinner reenactment.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S08-D01",
      "CF-S08-D02",
      "CF-S08-D04",
      "CF-S08-D06",
      "CF-S08-D07"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S08-D01",
        "CF-S08-D02",
        "CF-S08-D03",
        "CF-S08-D04",
        "CF-S08-D05",
        "CF-S08-D06",
        "CF-S08-D07"
      ],
      "required_cues": [
        "ENTRY",
        "D04",
        "AFTER_D07"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Private recognition cue completes; return anchor saved."
    }
  },
  "CF-S09": {
    "scene_id": "CF-S09",
    "title": "Clarence’s encounter in the woods",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.05:61-75"
    ],
    "fidelity": [
      "DIRECT",
      "COMPRESSED"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "CHILDHOOD",
      "mode": "FIRST_PERSON_CHILD"
    },
    "environment": "REUSED_OUTDOOR_MEMORY_POCKET",
    "title_card": {
      "main": "CLARENCE",
      "sub": "CHILDHOOD"
    },
    "controls": "BOUNDED_WALK_LOOK_NO_COMBAT",
    "objective": "Back away from the figure.",
    "narrative": "Nearly six, Clarence leaves his bicycle near a woodland trail and rose patch. A tall gray dead-looking figure in torn leather and jeans steps from the vegetation, chewing grass. It does not deliberately attack. Clarence flees, lies to his mother about a dead possum, and keeps the encounter secret.",
    "blocking": "One gray figure at medium distance, indifferent and slow; it never enters a child-attack state.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Sunny late-July impression. Reuse terrain and foliage but frame as woods, not a new stretch of Yates farmland. Child camera height."
      },
      {
        "cue": "D02",
        "image": "Rose-colored cluster and simple parked-bicycle silhouette only if cheap existing pieces exist. Sound and narration preserve these details without bicycle mechanics."
      },
      {
        "cue": "REVEAL",
        "image": "Slow gray figure emerges at medium distance. Reuse zombie mesh, static grass stem/idle mouth impression if available. No pursuit, gore close-up or attack animation."
      },
      {
        "cue": "RETREAT",
        "image": "Player retreats a short safe distance, then cut. The bike escape is completed through sound/narration, not a riding system."
      }
    ],
    "audio": {
      "ambience": "Daytime woods, rustling, one low grunt.",
      "cue_policy": "Retreat can use foot/bike sounds or captions; do not run chase audio.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Reveal is triggered by entering a short safe viewing zone; movement away ends the memory. A visible Continue also ends it after the reveal for players who do not retreat. Child mode cannot die or fire.",
    "build": {
      "preferred": "Small section of reusable foliage/terrain, one stationary or slow scripted zombie, camera preset. Existing movement only.",
      "fallback": "Three fixed viewpoints with look control and cut-based retreat. Use narration for the bicycle and roses rather than commissioning assets.",
      "new_minimum": [
        "Memory pocket staging",
        "Child camera preset if absent"
      ]
    },
    "continuity": [
      "The encounter is in childhood woods near Clarence’s home, not established as the Yates farm. Geometry reuse is not canon location identity.",
      "Keep the creature’s initial indifference. Do not turn this into a childhood boss fight.",
      "Appearance similarity does not prove individual identity."
    ],
    "entry": {
      "previous_scene": "CF-S08",
      "checkpoint": "CP-09",
      "requirements": [
        "gray_jacket_report_heard",
        "return_anchor_saved"
      ]
    },
    "exit": {
      "next_scene": "CF-S10",
      "condition": "Figure reveal seen plus retreat/continue; exit narration complete.",
      "sets_flags": [
        "clarence_memory_seen"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "No combat HUD or adult weapon survives the swap.",
      "The figure cannot pursue through the return trigger.",
      "All memory audio and actors stop before S10."
    ],
    "line_ids": [
      "CF-S09-D01",
      "CF-S09-D02",
      "CF-S09-D03",
      "CF-S09-D04",
      "CF-S09-D05"
    ],
    "adapter_key": "childMemory",
    "cues": [
      "ENTRY",
      "D02",
      "REVEAL",
      "RETREAT",
      "line:CF-S09-D01:start",
      "line:CF-S09-D01:complete",
      "line:CF-S09-D02:start",
      "line:CF-S09-D02:complete",
      "line:CF-S09-D03:start",
      "line:CF-S09-D03:complete",
      "line:CF-S09-D04:start",
      "line:CF-S09-D04:complete",
      "line:CF-S09-D05:start",
      "line:CF-S09-D05:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Sunny late-July impression. Reuse terrain and foliage but frame as woods, not a new stretch of Yates farmland. Child camera height."
      },
      {
        "source_cue": "D02",
        "bound_cue": "D02",
        "trigger": "On canonical line display start.",
        "visual": "Rose-colored cluster and simple parked-bicycle silhouette only if cheap existing pieces exist. Sound and narration preserve these details without bicycle mechanics."
      },
      {
        "source_cue": "REVEAL",
        "bound_cue": "REVEAL",
        "trigger": "Explicit adapter event; deterministic trigger specified in binding note and master interaction.",
        "visual": "Slow gray figure emerges at medium distance. Reuse zombie mesh, static grass stem/idle mouth impression if available. No pursuit, gore close-up or attack animation."
      },
      {
        "source_cue": "RETREAT",
        "bound_cue": "RETREAT",
        "trigger": "Explicit adapter event; deterministic trigger specified in binding note and master interaction.",
        "visual": "Player retreats a short safe distance, then cut. The bike escape is completed through sound/narration, not a riding system."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S09-D01",
        "scene_id": "CF-S09",
        "line_id": "CF-S09-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S09-D02",
        "scene_id": "CF-S09",
        "line_id": "CF-S09-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S09-D03",
        "scene_id": "CF-S09",
        "line_id": "CF-S09-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S09-D04",
        "scene_id": "CF-S09",
        "line_id": "CF-S09-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S09-D05",
        "scene_id": "CF-S09",
        "line_id": "CF-S09-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Audience + clarence; MEMORY_ONLY resolved specifically to childhood, not modern family.",
    "logical_set_id": "CHILDHOOD_FIXED_VIEWS",
    "physical_view_sets": [
      "CHILDHOOD_POCKET"
    ],
    "renderer_binding": "v31-view",
    "anchor": "CHILDHOOD_FIXED_VIEWS",
    "memory_return": "S08 captured context remains until safe S10 restore. No nested memory; child controls/actors/audio never survive exit.",
    "binding_note": "Selected approved fixed-viewpoint fallback, not new child-walking subsystem. AFTER_D02 triggers REVEAL before D03; AFTER_D04 enables Retreat/Continue; RETREAT cut then D05. Figure cannot pursue/damage; narration carries bike/roses. Restore at S10.",
    "required_asset_keys": [
      "A01",
      "A10",
      "A11",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Three fixed viewpoints with look control and cut-based retreat. Use narration for the bicycle and roses rather than commissioning assets.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S09-D01",
      "CF-S09-D03",
      "CF-S09-D04",
      "CF-S09-D05"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S09-D01",
        "CF-S09-D02",
        "CF-S09-D03",
        "CF-S09-D04",
        "CF-S09-D05"
      ],
      "required_cues": [
        "ENTRY",
        "D02",
        "REVEAL",
        "RETREAT"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Figure reveal seen plus retreat/continue; exit narration complete."
    }
  },
  "CF-S10": {
    "scene_id": "CF-S10",
    "title": "What Clarence never told anyone",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.05:61-68",
      "BK:I.05:77-87"
    ],
    "fidelity": [
      "COMPRESSED",
      "AUDIO_ONLY"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON_WITH_PRIVATE_RECOLLECTION"
    },
    "environment": "YATES_INTERVIEW_ROOM",
    "title_card": {
      "main": "CLARENCE",
      "sub": "PRESENT"
    },
    "controls": "LOOK_AND_DIALOGUE",
    "objective": "Return to the investigation.",
    "narrative": "End the childhood sequence with its human context. Clarence trusted his unreliable father with difficult conversations but did not tell him about the creature. His mother later encouraged his academic ambitions. These are short private recollections, not more explorable locations or a new adult-school protagonist.",
    "blocking": "Current family actors stay at the saved anchor and do not react to internal memory.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Brief dark hold carries the childhood voice before the PRESENT card restores the farmhouse. Distinguish remembered lines from people currently in the room."
      },
      {
        "cue": "D03",
        "image": "Neutral tabletop or window framing. The transcript may label “Remembered conversation, years later”. No literal MIT campus or future outcome."
      },
      {
        "cue": "D09",
        "image": "Room ambience returns fully; Mike’s present-day voice pulls Clarence back. Re-enable walking toward the backyard."
      }
    ],
    "audio": {
      "ambience": "Brief quiet for private recollection; then room ambience.",
      "cue_policy": "Remembered voices separated from present Mike by subtitle tag and a small pause.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Continue the brief voice-led recollection. No university choice, life-simulation system or family conversation branch.",
    "build": {
      "preferred": "Private subtitle/audio channel, short black hold and restoration of the existing room anchor.",
      "fallback": "All remembered voices appear as attributed captions. Darlene and Billy need no models.",
      "new_minimum": [
        "Private-memory audio/caption distinction"
      ]
    },
    "continuity": [
      "The book states hopes and study, not that Clarence attended or graduated from MIT.",
      "Childhood family detail is characterization, not a diagnosis or a cause explaining the creatures.",
      "Father and mother names do not transfer to Mike’s biography."
    ],
    "entry": {
      "previous_scene": "CF-S09",
      "checkpoint": "CP-10",
      "requirements": [
        "clarence_memory_seen"
      ]
    },
    "exit": {
      "next_scene": "CF-S11",
      "condition": "Present-day Mike line and Clarence response complete.",
      "sets_flags": [
        "private_memories_complete"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Present actors never hear or answer remembered voices.",
      "Camera/control state returns once, with no inherited child height.",
      "Next objective clearly points to the back door."
    ],
    "line_ids": [
      "CF-S10-D01",
      "CF-S10-D02",
      "CF-S10-D03",
      "CF-S10-D04",
      "CF-S10-D05",
      "CF-S10-D06",
      "CF-S10-D07",
      "CF-S10-D08",
      "CF-S10-D09",
      "CF-S10-D10"
    ],
    "adapter_key": "farm",
    "cues": [
      "ENTRY",
      "D03",
      "D09",
      "line:CF-S10-D01:start",
      "line:CF-S10-D01:complete",
      "line:CF-S10-D02:start",
      "line:CF-S10-D02:complete",
      "line:CF-S10-D03:start",
      "line:CF-S10-D03:complete",
      "line:CF-S10-D04:start",
      "line:CF-S10-D04:complete",
      "line:CF-S10-D05:start",
      "line:CF-S10-D05:complete",
      "line:CF-S10-D06:start",
      "line:CF-S10-D06:complete",
      "line:CF-S10-D07:start",
      "line:CF-S10-D07:complete",
      "line:CF-S10-D08:start",
      "line:CF-S10-D08:complete",
      "line:CF-S10-D09:start",
      "line:CF-S10-D09:complete",
      "line:CF-S10-D10:start",
      "line:CF-S10-D10:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Brief dark hold carries the childhood voice before the PRESENT card restores the farmhouse. Distinguish remembered lines from people currently in the room."
      },
      {
        "source_cue": "D03",
        "bound_cue": "D03",
        "trigger": "On canonical line display start.",
        "visual": "Neutral tabletop or window framing. The transcript may label “Remembered conversation, years later”. No literal MIT campus or future outcome."
      },
      {
        "source_cue": "D09",
        "bound_cue": "D09",
        "trigger": "On canonical line display start.",
        "visual": "Room ambience returns fully; Mike’s present-day voice pulls Clarence back. Re-enable walking toward the backyard."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S10-D01",
        "scene_id": "CF-S10",
        "line_id": "CF-S10-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S10-D02",
        "scene_id": "CF-S10",
        "line_id": "CF-S10-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S10-D03",
        "scene_id": "CF-S10",
        "line_id": "CF-S10-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S10-D04",
        "scene_id": "CF-S10",
        "line_id": "CF-S10-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S10-D05",
        "scene_id": "CF-S10",
        "line_id": "CF-S10-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S10-D06",
        "scene_id": "CF-S10",
        "line_id": "CF-S10-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S10-D07",
        "scene_id": "CF-S10",
        "line_id": "CF-S10-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S10-D08",
        "scene_id": "CF-S10",
        "line_id": "CF-S10-D08",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S10-D09",
        "scene_id": "CF-S10",
        "line_id": "CF-S10-D09",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S10-D10",
        "scene_id": "CF-S10",
        "line_id": "CF-S10-D10",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "D01-D08 audience + clarence only, including Darlene memories; D09-D10 present participants.",
    "logical_set_id": "INTERVIEW_PRIVATE",
    "physical_view_sets": [
      "FARM_INTERIOR"
    ],
    "renderer_binding": "v31-view",
    "anchor": "INTERVIEW (restored S08 context)",
    "memory_return": "Restore/consume S08 context before adult control. No lingering child eye height or weapons/HUD mismatch.",
    "binding_note": "Restore/consume S08 return_context once before adult controls. D01-D08 private remembered channel; D09 Mike returns present conversation, D10 acknowledges and exposes BACK_DOOR objective.",
    "required_asset_keys": [
      "A03",
      "A04",
      "A05",
      "A07",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "All remembered voices appear as attributed captions. Darlene and Billy need no models.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S10-D01",
      "CF-S10-D02",
      "CF-S10-D03",
      "CF-S10-D05",
      "CF-S10-D08",
      "CF-S10-D09",
      "CF-S10-D10"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S10-D01",
        "CF-S10-D02",
        "CF-S10-D03",
        "CF-S10-D04",
        "CF-S10-D05",
        "CF-S10-D06",
        "CF-S10-D07",
        "CF-S10-D08",
        "CF-S10-D09",
        "CF-S10-D10"
      ],
      "required_cues": [
        "ENTRY",
        "D03",
        "D09"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Present-day Mike line and Clarence response complete."
    }
  },
  "CF-S11": {
    "scene_id": "CF-S11",
    "title": "The search line enters the corn",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.04:56",
      "BK:I.06:108-114",
      "BK:I.08:142-150"
    ],
    "fidelity": [
      "COMPRESSED",
      "APPROVED_ADAPTATION"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON"
    },
    "environment": "FARM_BACKYARD_AND_CORN_APPROACH",
    "title_card": null,
    "controls": "WALK_LOOK_INTERACT",
    "objective": "Join the search line.",
    "narrative": "Stanley points out the last-seen place. Mike coordinates the police search. For book fidelity, Stanley remains at the farm after showing the edge; the police enter the corn. The source describes ten officers and dogs. Convey that group through a few staged officers plus offscreen footsteps, barks and radio, not ten full AI agents.",
    "blocking": "Mike leads to edge; Stanley stops at house-side anchor; one/two officer proxies suggest the line.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Walk through the back door into the same backyard visible from the interview window."
      },
      {
        "cue": "D01",
        "image": "Stanley indicates the field edge. Glenda stays at the house. Camera tracks the source of the search, not an unrelated road."
      },
      {
        "cue": "D04",
        "image": "One or two visible officers ahead. More police remain audible. Corn gradually blocks the house view."
      },
      {
        "cue": "AFTER_D09",
        "image": "Player reaches the first bend. The gray hand is beyond, not immediately at the doorway."
      }
    ],
    "audio": {
      "ambience": "Corn footsteps, occasional barks, radio chatter.",
      "cue_policy": "Threat music remains off until the later narrative beat.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Follow a fixed safe route. Early search is exploration, not the timed trial. Disable free shooting at family and police; retain equipment availability only as appropriate to the existing controller.",
    "build": {
      "preferred": "Reuse corn path, two staged officer instances and the existing walk/door connectors. Others are implied. Stanley stops at a fixed farm anchor.",
      "fallback": "Mike and radio voices can imply the squad. A missing additional model must not force a crowd system.",
      "new_minimum": [
        "Backyard-to-field connector",
        "Search briefing cues"
      ]
    },
    "continuity": [
      "Stanley does not disappear into the sky while supposedly still talking at the farm. Keep actor locations consistent.",
      "The approved earlier “all go in” idea is tightened to a police search: family guides to the edge, officers continue.",
      "No canonical claim that the parents are responsible."
    ],
    "entry": {
      "previous_scene": "CF-S10",
      "checkpoint": "CP-11",
      "requirements": [
        "search_organized",
        "private_memories_complete"
      ]
    },
    "exit": {
      "next_scene": "CF-S12",
      "condition": "Player reaches the hand-discovery approach.",
      "sets_flags": [
        "search_entered"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "The house-to-backyard-to-corn path is comprehensible.",
      "Staged officers cannot obstruct the only passage.",
      "No trial timer or scarecrow reset starts prematurely."
    ],
    "line_ids": [
      "CF-S11-D01",
      "CF-S11-D02",
      "CF-S11-D03",
      "CF-S11-D04",
      "CF-S11-D05",
      "CF-S11-D06",
      "CF-S11-D07",
      "CF-S11-D08",
      "CF-S11-D09"
    ],
    "adapter_key": "search",
    "cues": [
      "ENTRY",
      "D01",
      "D04",
      "AFTER_D09",
      "line:CF-S11-D01:start",
      "line:CF-S11-D01:complete",
      "line:CF-S11-D02:start",
      "line:CF-S11-D02:complete",
      "line:CF-S11-D03:start",
      "line:CF-S11-D03:complete",
      "line:CF-S11-D04:start",
      "line:CF-S11-D04:complete",
      "line:CF-S11-D05:start",
      "line:CF-S11-D05:complete",
      "line:CF-S11-D06:start",
      "line:CF-S11-D06:complete",
      "line:CF-S11-D07:start",
      "line:CF-S11-D07:complete",
      "line:CF-S11-D08:start",
      "line:CF-S11-D08:complete",
      "line:CF-S11-D09:start",
      "line:CF-S11-D09:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Walk through the back door into the same backyard visible from the interview window."
      },
      {
        "source_cue": "D01",
        "bound_cue": "D01",
        "trigger": "On canonical line display start.",
        "visual": "Stanley indicates the field edge. Glenda stays at the house. Camera tracks the source of the search, not an unrelated road."
      },
      {
        "source_cue": "D04",
        "bound_cue": "D04",
        "trigger": "On canonical line display start.",
        "visual": "One or two visible officers ahead. More police remain audible. Corn gradually blocks the house view."
      },
      {
        "source_cue": "AFTER_D09",
        "bound_cue": "AFTER_D09",
        "trigger": "After full acknowledgement of D09.",
        "visual": "Player reaches the first bend. The gray hand is beyond, not immediately at the doorway."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S11-D01",
        "scene_id": "CF-S11",
        "line_id": "CF-S11-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S11-D02",
        "scene_id": "CF-S11",
        "line_id": "CF-S11-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S11-D03",
        "scene_id": "CF-S11",
        "line_id": "CF-S11-D03",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S11-D04",
        "scene_id": "CF-S11",
        "line_id": "CF-S11-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S11-D05",
        "scene_id": "CF-S11",
        "line_id": "CF-S11-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S11-D06",
        "scene_id": "CF-S11",
        "line_id": "CF-S11-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S11-D07",
        "scene_id": "CF-S11",
        "line_id": "CF-S11-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S11-D08",
        "scene_id": "CF-S11",
        "line_id": "CF-S11-D08",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S11-D09",
        "scene_id": "CF-S11",
        "line_id": "CF-S11-D09",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "D03 audience narration; D01-D02 family/Mike/Clarence, D04-D09 officers/Clarence, not family. Alan suspicion never becomes guilt flag.",
    "logical_set_id": "BACKYARD_SEARCH",
    "physical_view_sets": [
      "FARM_INTERIOR",
      "FARM_YARD",
      "SEARCH_TRAIL"
    ],
    "renderer_binding": "v31-view",
    "anchor": "INTERVIEW -> BACK_DOOR -> FIELD_EDGE -> SEARCH_BEND",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "New +X rear-yard connector replaces legacy WEST_APPROACH. Family stops at FIELD_EDGE, police proceed to SEARCH_BEND. Nine lines plus approach gate; no trial clock/scarecrow reset/live damage.",
    "required_asset_keys": [
      "A01",
      "A03",
      "A04",
      "A06",
      "A13",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Mike and radio voices can imply the squad. A missing additional model must not force a crowd system.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S11-D02",
      "CF-S11-D03",
      "CF-S11-D05",
      "CF-S11-D09"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S11-D01",
        "CF-S11-D02",
        "CF-S11-D03",
        "CF-S11-D04",
        "CF-S11-D05",
        "CF-S11-D06",
        "CF-S11-D07",
        "CF-S11-D08",
        "CF-S11-D09"
      ],
      "required_cues": [
        "ENTRY",
        "D01",
        "D04",
        "AFTER_D09"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Player reaches the hand-discovery approach."
    }
  },
  "CF-S12": {
    "scene_id": "CF-S12",
    "title": "The gray hand",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.08:151-156"
    ],
    "fidelity": [
      "DIRECT",
      "COMPRESSED"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON"
    },
    "environment": "CORN_SEARCH_TRAIL",
    "title_card": null,
    "controls": "WALK_LOOK_THEN_CINEMATIC",
    "objective": "Examine the object beside the path.",
    "narrative": "Clarence sees the gray hand, halts the line and radios the find. He believes it is not human and collapses. The game does not turn his visual judgment into a scientific conclusion. Preserve fainting and recovery outside the field, rather than replacing the hand with an immediate ordinary enemy fight.",
    "blocking": "Stop officer proxies on the cue. Do not require a crowd convergence animation.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Small gray hand shape beside the left edge of the path. Keep it readable without detailed injury or close-up gore."
      },
      {
        "cue": "D01",
        "image": "Officers stop on simple markers; offscreen dogs bark. No complex crowd reaction."
      },
      {
        "cue": "AFTER_D03",
        "image": "Vignette or direct dark cut, slight camera drop only if safe. No full ragdoll or visible head impact."
      }
    ],
    "audio": {
      "ambience": "Dogs intensify once; Clarence radio call.",
      "cue_policy": "Muffle or cut sound on faint; stop all old search loops before recovery.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "E Examine from a generous distance, or existing look/near trigger if already standard. Exactly one discovery. Do not make the player collect, equip or carry the hand.",
    "build": {
      "preferred": "Static prop from an existing hand mesh with detached-neutral presentation, or a simple new silhouette prop. Scripted camera cut.",
      "fallback": "Partly covered gray hand shape and reaction dialogue. No anatomy simulation.",
      "new_minimum": [
        "Gray-hand prop",
        "Discovery/faint sequence"
      ]
    },
    "continuity": [
      "This is the source’s evidentiary hand discovery, not Sadie’s hand. That distinction is reported after recovery.",
      "Do not replay the entire childhood flashback here; its earlier placement was the approved narrative compression."
    ],
    "entry": {
      "previous_scene": "CF-S11",
      "checkpoint": "CP-12",
      "requirements": [
        "search_entered"
      ]
    },
    "exit": {
      "next_scene": "CF-S13",
      "condition": "Radio line and faint cut complete.",
      "sets_flags": [
        "hand_found",
        "clarence_fainted"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Repeated Examine does not duplicate the radio/blackout.",
      "Enemies cannot attack the unconscious player during the transition.",
      "The gray-hand prop is a story clue, not an ammo or health pickup."
    ],
    "line_ids": [
      "CF-S12-D01",
      "CF-S12-D02",
      "CF-S12-D03"
    ],
    "adapter_key": "hand",
    "cues": [
      "ENTRY",
      "D01",
      "AFTER_D03",
      "line:CF-S12-D01:start",
      "line:CF-S12-D01:complete",
      "line:CF-S12-D02:start",
      "line:CF-S12-D02:complete",
      "line:CF-S12-D03:start",
      "line:CF-S12-D03:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Small gray hand shape beside the left edge of the path. Keep it readable without detailed injury or close-up gore."
      },
      {
        "source_cue": "D01",
        "bound_cue": "D01",
        "trigger": "On canonical line display start.",
        "visual": "Officers stop on simple markers; offscreen dogs bark. No complex crowd reaction."
      },
      {
        "source_cue": "AFTER_D03",
        "bound_cue": "AFTER_D03",
        "trigger": "After full acknowledgement of D03.",
        "visual": "Vignette or direct dark cut, slight camera drop only if safe. No full ragdoll or visible head impact."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S12-D01",
        "scene_id": "CF-S12",
        "line_id": "CF-S12-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S12-D02",
        "scene_id": "CF-S12",
        "line_id": "CF-S12-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S12-D03",
        "scene_id": "CF-S12",
        "line_id": "CF-S12-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "D01-D02 officers/Clarence; D03 audience + clarence only. No confirmed creature identity.",
    "logical_set_id": "HAND_SEARCH",
    "physical_view_sets": [
      "SEARCH_TRAIL"
    ],
    "renderer_binding": "v31-view",
    "anchor": "HAND_APPROACH",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "E/visible Examine generous range consumes clue once. D01-D03; AFTER_D03 direct black about 0.8 active seconds, reduced motion without camera drop. Only YARD_RECOVERY next; hand is not collectible inventory.",
    "required_asset_keys": [
      "A01",
      "A12",
      "A13",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Partly covered gray hand shape and reaction dialogue. No anatomy simulation.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S12-D02",
      "CF-S12-D03"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S12-D01",
        "CF-S12-D02",
        "CF-S12-D03"
      ],
      "required_cues": [
        "ENTRY",
        "D01",
        "AFTER_D03"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Radio line and faint cut complete."
    }
  },
  "CF-S13": {
    "scene_id": "CF-S13",
    "title": "Recovery outside; the first confession",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.08:158-170"
    ],
    "fidelity": [
      "DIRECT",
      "COMPRESSED"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON_LOW_THEN_SEATED"
    },
    "environment": "YATES_YARD_RECOVERY",
    "title_card": null,
    "controls": "LOOK_AND_DIALOGUE",
    "objective": "Tell Glenda what the hand reminds you of.",
    "narrative": "Clarence wakes outside on a collapsed tent with Mike, officers and Glenda nearby. Mike is skeptical, then walks away. Only afterward does Clarence tell Glenda about his childhood encounter. This is the first disclosure to the family; private memories earlier were for the player.",
    "blocking": "Glenda at Clarence’s side; Mike standing until D06 completes, then exits before confession.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Sky above the farm; low camera beside a folded canvas plane. Glenda at the side, Mike standing. This is not the asylum bed."
      },
      {
        "cue": "AFTER_D06",
        "image": "Mike leaves the immediate conversation through a simple cut or short existing walk."
      },
      {
        "cue": "D07",
        "image": "Hold on Glenda’s listening pose or her offscreen voice. No forced emotional facial performance."
      }
    ],
    "audio": {
      "ambience": "Outdoor wind; Glenda’s nearby voice.",
      "cue_policy": "No clinical machinery, restraints, hospital beeps or doctor dialogue.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Dialogue-only until the confession finishes, then safe standing restore. No medical treatment minigame or wrist-contact animation.",
    "build": {
      "preferred": "Reuse yard, Glenda/Mike presentation and one canvas plane. Move the camera between low/seated/standing presets through short cuts.",
      "fallback": "Keep the camera seated throughout and transition to S14; water on the forehead is conveyed in narration if needed, not simulated.",
      "new_minimum": [
        "Canvas/folded-tent visual",
        "Recovery dialogue"
      ]
    },
    "continuity": [
      "Mike remains police chief, never doctor.",
      "No schizophrenia diagnosis, custody story or hospital is introduced.",
      "Source wording about hand color is a character’s reasoning; no medical generalization is taught."
    ],
    "entry": {
      "previous_scene": "CF-S12",
      "checkpoint": "CP-13",
      "requirements": [
        "hand_found",
        "clarence_fainted"
      ]
    },
    "exit": {
      "next_scene": "CF-S14",
      "condition": "Glenda hears Clarence’s account; standing/next-scene state set.",
      "sets_flags": [
        "clarence_recovered",
        "glenda_knows_memory",
        "hand_sent_forensics"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Glenda does not know the confession before D08-D10.",
      "Mike leaves before the private portion.",
      "No death screen, hospital route or old pit callback is triggered."
    ],
    "line_ids": [
      "CF-S13-D01",
      "CF-S13-D02",
      "CF-S13-D03",
      "CF-S13-D04",
      "CF-S13-D05",
      "CF-S13-D06",
      "CF-S13-D07",
      "CF-S13-D08",
      "CF-S13-D09",
      "CF-S13-D10",
      "CF-S13-D11"
    ],
    "adapter_key": "recovery",
    "cues": [
      "ENTRY",
      "AFTER_D06",
      "D07",
      "line:CF-S13-D01:start",
      "line:CF-S13-D01:complete",
      "line:CF-S13-D02:start",
      "line:CF-S13-D02:complete",
      "line:CF-S13-D03:start",
      "line:CF-S13-D03:complete",
      "line:CF-S13-D04:start",
      "line:CF-S13-D04:complete",
      "line:CF-S13-D05:start",
      "line:CF-S13-D05:complete",
      "line:CF-S13-D06:start",
      "line:CF-S13-D06:complete",
      "line:CF-S13-D07:start",
      "line:CF-S13-D07:complete",
      "line:CF-S13-D08:start",
      "line:CF-S13-D08:complete",
      "line:CF-S13-D09:start",
      "line:CF-S13-D09:complete",
      "line:CF-S13-D10:start",
      "line:CF-S13-D10:complete",
      "line:CF-S13-D11:start",
      "line:CF-S13-D11:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Sky above the farm; low camera beside a folded canvas plane. Glenda at the side, Mike standing. This is not the asylum bed."
      },
      {
        "source_cue": "AFTER_D06",
        "bound_cue": "AFTER_D06",
        "trigger": "After full acknowledgement of D06.",
        "visual": "Mike leaves the immediate conversation through a simple cut or short existing walk."
      },
      {
        "source_cue": "D07",
        "bound_cue": "D07",
        "trigger": "On canonical line display start.",
        "visual": "Hold on Glenda’s listening pose or her offscreen voice. No forced emotional facial performance."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S13-D01",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S13-D02",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S13-D03",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S13-D04",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S13-D05",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S13-D06",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S13-D07",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S13-D08",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D08",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S13-D09",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D09",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S13-D10",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D10",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S13-D11",
        "scene_id": "CF-S13",
        "line_id": "CF-S13-D11",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "glenda"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "D01-D06 clarence/mike/glenda; D07-D11 clarence/glenda. glenda_knows_memory only after D08-D10 disclosure completion.",
    "logical_set_id": "YARD_RECOVERY",
    "physical_view_sets": [
      "FARM_YARD"
    ],
    "renderer_binding": "v31-view",
    "anchor": "YARD_RECOVERY",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Low/seated yard camera and canvas plane; Mike exits after D06. D08-D10 are first family disclosure to Glenda. Finish D11 then safe stand/cut; no hospital/doctor role.",
    "required_asset_keys": [
      "A03",
      "A05",
      "A06",
      "A14",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Keep the camera seated throughout and transition to S14; water on the forehead is conveyed in narration if needed, not simulated.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S13-D03",
      "CF-S13-D04",
      "CF-S13-D06",
      "CF-S13-D08",
      "CF-S13-D09",
      "CF-S13-D10",
      "CF-S13-D11"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S13-D01",
        "CF-S13-D02",
        "CF-S13-D03",
        "CF-S13-D04",
        "CF-S13-D05",
        "CF-S13-D06",
        "CF-S13-D07",
        "CF-S13-D08",
        "CF-S13-D09",
        "CF-S13-D10",
        "CF-S13-D11"
      ],
      "required_cues": [
        "ENTRY",
        "AFTER_D06",
        "D07"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Glenda hears Clarence’s account; standing/next-scene state set."
    }
  },
  "CF-S14": {
    "scene_id": "CF-S14",
    "title": "The hand leaves; the news comes back",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.09:173-201",
      "BK:I.10:204-217"
    ],
    "fidelity": [
      "AUDIO_ONLY",
      "COMPRESSED",
      "AUDIENCE_CUTAWAY"
    ],
    "perspective": {
      "character": "NONE_THEN_CLARENCE",
      "period": "PRESENT",
      "mode": "NARRATED_CUTAWAY_THEN_RETURN"
    },
    "environment": "NEUTRAL_DARK_INSERT_THEN_YATES_KITCHEN",
    "title_card": {
      "main": "WAYNE PROBST",
      "sub": "ELSEWHERE | NARRATED INTERLUDE"
    },
    "controls": "DIALOGUE_ONLY",
    "objective": "Follow the evidence and the report.",
    "narrative": "Preserve what happens to Wayne without building a laboratory or making the police omniscient. First an audience-only narrated interlude recounts the transport, moving hand, attack and death. Then a private kitchen exchange shows Glenda telling Stanley. Finally Mike reports only the discovery of Wayne’s body and the hand’s disappearance. The audience knows more than the officers.",
    "blocking": "Wayne unseen; Glenda/Stanley kitchen static; Mike doorway. Clarence has no avatar in private exchange.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Dark frame, a closed transport box silhouette on a reused tabletop, cooling fan/traffic sounds if available. WAYNE card is a cutaway label, not a new player character."
      },
      {
        "cue": "D02_TO_D08",
        "image": "Use two still framings and shadows. Do not show a hand attacking a face, build a lab, or create a climbing-hand controller."
      },
      {
        "cue": "BEFORE_D09",
        "image": "Cut to the existing kitchen with “YATES HOUSE | PRIVATE CONVERSATION”. Clarence is not physically present for Glenda and Stanley’s exchange."
      },
      {
        "cue": "BEFORE_D16",
        "image": "Mike enters or speaks from doorway. On return to player control, show CLARENCE | PRESENT and place him outside the house. Mike’s report is audible through the doorway as an explicit staging adaptation."
      }
    ],
    "audio": {
      "ambience": "Narrated interlude: traffic/cooler thud, low room tone, three taps.",
      "cue_policy": "No graphic attack sound dependency. Return to kitchen ambience before D09; Mike report remains clear.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Advance narrated captions and scripted lines. For a full-scene skip, provide a concise event recap before continuation. Never require interaction with the laboratory.",
    "build": {
      "preferred": "One audience-only subtitle/narration channel and reused kitchen. Wayne is audio/narration only.",
      "fallback": "Caption cards on black for the entire interlude; the actual book events stay legible with no new model, vehicle or lab.",
      "new_minimum": [
        "Wayne interlude script",
        "Knowledge-limited report",
        "Kitchen exchange"
      ]
    },
    "continuity": [
      "Police report: Wayne dead, eyes missing, hand missing. It does not establish that police witnessed the hand attack.",
      "Clarence never hears the private first part of Glenda/Stanley’s exchange unless deliberately restaged; default knowledge flag stays off.",
      "Wayne’s fate is book material, not a hallucination caused by his substance use."
    ],
    "entry": {
      "previous_scene": "CF-S13",
      "checkpoint": "CP-14",
      "requirements": [
        "glenda_knows_memory",
        "hand_sent_forensics"
      ]
    },
    "exit": {
      "next_scene": "CF-S15",
      "condition": "Private discussion and Mike report complete; Clarence viewpoint restored.",
      "sets_flags": [
        "audience_knows_wayne_attack",
        "wayne_death_reported",
        "stanley_knows_memory_secondhand"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Audience-only lines never set Clarence’s direct-knowledge flags.",
      "No lab asset is required for this scene to pass.",
      "Speaker name “Wayne” does not create a playable Wayne controller."
    ],
    "line_ids": [
      "CF-S14-D01",
      "CF-S14-D02",
      "CF-S14-D03",
      "CF-S14-D04",
      "CF-S14-D05",
      "CF-S14-D06",
      "CF-S14-D07",
      "CF-S14-D08",
      "CF-S14-D09",
      "CF-S14-D10",
      "CF-S14-D11",
      "CF-S14-D12",
      "CF-S14-D13",
      "CF-S14-D14",
      "CF-S14-D15",
      "CF-S14-D16",
      "CF-S14-D17"
    ],
    "adapter_key": "investigationCutaway",
    "cues": [
      "ENTRY",
      "D02_TO_D08",
      "BEFORE_D09",
      "BEFORE_D16",
      "line:CF-S14-D01:start",
      "line:CF-S14-D01:complete",
      "line:CF-S14-D02:start",
      "line:CF-S14-D02:complete",
      "line:CF-S14-D03:start",
      "line:CF-S14-D03:complete",
      "line:CF-S14-D04:start",
      "line:CF-S14-D04:complete",
      "line:CF-S14-D05:start",
      "line:CF-S14-D05:complete",
      "line:CF-S14-D06:start",
      "line:CF-S14-D06:complete",
      "line:CF-S14-D07:start",
      "line:CF-S14-D07:complete",
      "line:CF-S14-D08:start",
      "line:CF-S14-D08:complete",
      "line:CF-S14-D09:start",
      "line:CF-S14-D09:complete",
      "line:CF-S14-D10:start",
      "line:CF-S14-D10:complete",
      "line:CF-S14-D11:start",
      "line:CF-S14-D11:complete",
      "line:CF-S14-D12:start",
      "line:CF-S14-D12:complete",
      "line:CF-S14-D13:start",
      "line:CF-S14-D13:complete",
      "line:CF-S14-D14:start",
      "line:CF-S14-D14:complete",
      "line:CF-S14-D15:start",
      "line:CF-S14-D15:complete",
      "line:CF-S14-D16:start",
      "line:CF-S14-D16:complete",
      "line:CF-S14-D17:start",
      "line:CF-S14-D17:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Dark frame, a closed transport box silhouette on a reused tabletop, cooling fan/traffic sounds if available. WAYNE card is a cutaway label, not a new player character."
      },
      {
        "source_cue": "D02_TO_D08",
        "bound_cue": "D02_TO_D08",
        "trigger": "Inclusive line staging window D02_TO_D08.",
        "visual": "Use two still framings and shadows. Do not show a hand attacking a face, build a lab, or create a climbing-hand controller."
      },
      {
        "source_cue": "BEFORE_D09",
        "bound_cue": "BEFORE_D09",
        "trigger": "Before displaying D09.",
        "visual": "Cut to the existing kitchen with “YATES HOUSE | PRIVATE CONVERSATION”. Clarence is not physically present for Glenda and Stanley’s exchange."
      },
      {
        "source_cue": "BEFORE_D16",
        "bound_cue": "BEFORE_D16",
        "trigger": "Before displaying D16.",
        "visual": "Mike enters or speaks from doorway. On return to player control, show CLARENCE | PRESENT and place him outside the house. Mike’s report is audible through the doorway as an explicit staging adaptation."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S14-D01",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D01",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S14-D02",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D02",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S14-D03",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D03",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S14-D04",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D04",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S14-D05",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D05",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S14-D06",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D06",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S14-D07",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D07",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S14-D08",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D08",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S14-D09",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D09",
        "kind": "line",
        "recipients": [
          "audience",
          "glenda",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S14-D10",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D10",
        "kind": "line",
        "recipients": [
          "audience",
          "glenda",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S14-D11",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D11",
        "kind": "line",
        "recipients": [
          "audience",
          "glenda",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S14-D12",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D12",
        "kind": "line",
        "recipients": [
          "audience",
          "glenda",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S14-D13",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D13",
        "kind": "line",
        "recipients": [
          "audience",
          "glenda",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S14-D14",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D14",
        "kind": "line",
        "recipients": [
          "audience",
          "glenda",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S14-D15",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D15",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S14-D16",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D16",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S14-D17",
        "scene_id": "CF-S14",
        "line_id": "CF-S14-D17",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley",
          "glenda"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "D01-D08 audience only; D09-D14 glenda/stanley plus audience, never clarence/mike. D15 audience stage. D16-D17 present report audible to clarence/mike/glenda/stanley; no witnessed-attack facts.",
    "logical_set_id": "WAYNE_KITCHEN_REPORT",
    "physical_view_sets": [
      "FARM_INTERIOR",
      "FARM_YARD"
    ],
    "renderer_binding": "overlay-and-v31-view",
    "anchor": "KITCHEN_PRIVATE -> PORCH_STANLEY",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "D01-D08 audience Wayne insert; BEFORE_D09 private kitchen excludes Clarence. BEFORE_D16 Clarence PRESENT outside doorway, Mike report explicitly audible there. Police learn report, not witnessed hand attack.",
    "required_asset_keys": [
      "A03",
      "A04",
      "A05",
      "A07",
      "A15",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Caption cards on black for the entire interlude; the actual book events stay legible with no new model, vehicle or lab.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S14-D01",
      "CF-S14-D06",
      "CF-S14-D08",
      "CF-S14-D10",
      "CF-S14-D14",
      "CF-S14-D16",
      "CF-S14-D17"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S14-D01",
        "CF-S14-D02",
        "CF-S14-D03",
        "CF-S14-D04",
        "CF-S14-D05",
        "CF-S14-D06",
        "CF-S14-D07",
        "CF-S14-D08",
        "CF-S14-D09",
        "CF-S14-D10",
        "CF-S14-D11",
        "CF-S14-D12",
        "CF-S14-D13",
        "CF-S14-D14",
        "CF-S14-D15",
        "CF-S14-D16",
        "CF-S14-D17"
      ],
      "required_cues": [
        "ENTRY",
        "D02_TO_D08",
        "BEFORE_D09",
        "BEFORE_D16"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Private discussion and Mike report complete; Clarence viewpoint restored."
    }
  },
  "CF-S15": {
    "scene_id": "CF-S15",
    "title": "The search team is attacked; Stanley asks",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.11:220-243",
      "BK:I.12:246-253"
    ],
    "fidelity": [
      "COMPRESSED",
      "CINEMATIC",
      "AUDIO_ONLY"
    ],
    "perspective": {
      "character": "NONE_THEN_CLARENCE",
      "period": "PRESENT",
      "mode": "SEARCH_CUTAWAY_THEN_FIRST_PERSON"
    },
    "environment": "REUSED_CORN_BEND_THEN_YATES_PORCH",
    "title_card": {
      "main": "SEARCH TEAM",
      "sub": "ELSEWHERE IN THE CORN | CUTAWAY"
    },
    "controls": "DIALOGUE_ONLY_THEN_WALK",
    "objective": "Hear the search-team report; speak with Stanley.",
    "narrative": "After the hand discovery, the search split. Brad Iris, Randall and the others encounter the creatures deeper in the corn. Preserve the attack’s essential progression, including Olive, Randall’s injury and the medical call, through simple staging and narration. Back at the farm, Stanley finally hears Clarence directly. His fears of eating, sacrifice or transformation remain fears, not confirmed creature motives.",
    "blocking": "One fixed search-team silhouette, one gray figure. Back at porch, Stanley trembles through voice/pose.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Fixed view behind one officer silhouette at an existing corn bend. Sticks/rocks are a small prop cluster. Thunder begins."
      },
      {
        "cue": "D02_TO_D06",
        "image": "Gray arm/figure silhouette from the corn; cut on movement, gunshot sound, then backward retreat. No synchronized throat-grab, dog combat, ankle dismemberment or bespoke death physics."
      },
      {
        "cue": "BEFORE_D08",
        "image": "CLARENCE | PRESENT card. Return to the porch. Stanley is seated or standing nearby, visibly shaken through pose/voice rather than facial polish."
      },
      {
        "cue": "AFTER_D13",
        "image": "Stanley heads inside using one existing walk or an occluding doorway cut. Mike calls Clarence toward the field edge, a game-original bridge."
      }
    ],
    "audio": {
      "ambience": "Thunder, barks, shots, radio request; use existing effects sparsely.",
      "cue_policy": "Nonplayable injury conveyed by dialogue/narration, not loud gore audio.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Cinematic/voice-led attack, then one fixed conversation. No separate playable squad or escort minigame. The return to the field is a short safe path or a cut.",
    "build": {
      "preferred": "Reuse corn geometry, one zombie and existing officer geometry in a scripted noncombat staging layer. Audio and cuts carry complex contact.",
      "fallback": "Hold on radio/field shadows while narration conveys the exact attack. Keep player damage disabled during the offscreen event.",
      "new_minimum": [
        "Search attack cue sequence",
        "Stanley conversation",
        "Return-to-field bridge"
      ]
    },
    "continuity": [
      "The scripted creature retreat is not a new killable-enemy combat system.",
      "Olive survives the described encounter; do not invent a dog death.",
      "Clarence’s knowledge is the attack report and his conversation, not necessarily the full audience cutaway.",
      "No confirmed claim that Sadie has been eaten, transformed or sacrificed."
    ],
    "entry": {
      "previous_scene": "CF-S14",
      "checkpoint": "CP-15",
      "requirements": [
        "wayne_death_reported",
        "stanley_knows_memory_secondhand"
      ]
    },
    "exit": {
      "next_scene": "CF-S16",
      "condition": "Attack recap, Stanley conversation and return bridge finish.",
      "sets_flags": [
        "officer_attack_reported",
        "stanley_heard_clarence_directly",
        "family_safe_at_house"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Attack cutaway cannot damage Clarence at the farm.",
      "Glenda and Stanley remain at the house when the next scene starts.",
      "Mike’s call gives a clear reason for returning to the corn."
    ],
    "line_ids": [
      "CF-S15-D01",
      "CF-S15-D02",
      "CF-S15-D03",
      "CF-S15-D04",
      "CF-S15-D05",
      "CF-S15-D06",
      "CF-S15-D07",
      "CF-S15-D08",
      "CF-S15-D09",
      "CF-S15-D10",
      "CF-S15-D11",
      "CF-S15-D12",
      "CF-S15-D13",
      "CF-S15-D14"
    ],
    "adapter_key": "investigationCutaway",
    "cues": [
      "ENTRY",
      "D02_TO_D06",
      "BEFORE_D08",
      "AFTER_D13",
      "line:CF-S15-D01:start",
      "line:CF-S15-D01:complete",
      "line:CF-S15-D02:start",
      "line:CF-S15-D02:complete",
      "line:CF-S15-D03:start",
      "line:CF-S15-D03:complete",
      "line:CF-S15-D04:start",
      "line:CF-S15-D04:complete",
      "line:CF-S15-D05:start",
      "line:CF-S15-D05:complete",
      "line:CF-S15-D06:start",
      "line:CF-S15-D06:complete",
      "line:CF-S15-D07:start",
      "line:CF-S15-D07:complete",
      "line:CF-S15-D08:start",
      "line:CF-S15-D08:complete",
      "line:CF-S15-D09:start",
      "line:CF-S15-D09:complete",
      "line:CF-S15-D10:start",
      "line:CF-S15-D10:complete",
      "line:CF-S15-D11:start",
      "line:CF-S15-D11:complete",
      "line:CF-S15-D12:start",
      "line:CF-S15-D12:complete",
      "line:CF-S15-D13:start",
      "line:CF-S15-D13:complete",
      "line:CF-S15-D14:start",
      "line:CF-S15-D14:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Fixed view behind one officer silhouette at an existing corn bend. Sticks/rocks are a small prop cluster. Thunder begins."
      },
      {
        "source_cue": "D02_TO_D06",
        "bound_cue": "D02_TO_D06",
        "trigger": "Inclusive line staging window D02_TO_D06.",
        "visual": "Gray arm/figure silhouette from the corn; cut on movement, gunshot sound, then backward retreat. No synchronized throat-grab, dog combat, ankle dismemberment or bespoke death physics."
      },
      {
        "source_cue": "BEFORE_D08",
        "bound_cue": "BEFORE_D08",
        "trigger": "Before displaying D08.",
        "visual": "CLARENCE | PRESENT card. Return to the porch. Stanley is seated or standing nearby, visibly shaken through pose/voice rather than facial polish."
      },
      {
        "source_cue": "AFTER_D13",
        "bound_cue": "AFTER_D13",
        "trigger": "After full acknowledgement of D13.",
        "visual": "Stanley heads inside using one existing walk or an occluding doorway cut. Mike calls Clarence toward the field edge, a game-original bridge."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S15-D01",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D01",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S15-D02",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D02",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S15-D03",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D03",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S15-D04",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D04",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S15-D05",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D05",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S15-D06",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D06",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S15-D07",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S15-D08",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D08",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S15-D09",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D09",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S15-D10",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D10",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S15-D11",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D11",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S15-D12",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D12",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "stanley"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S15-D13",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D13",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S15-D14",
        "scene_id": "CF-S15",
        "line_id": "CF-S15-D14",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "D01-D06 audience/search party only, not Clarence. D07 radio reports officer incapacitation only. D08-D13 Clarence/Stanley spoken exchange, narration remains audience; D14 Mike/Clarence.",
    "logical_set_id": "ATTACK_PORCH",
    "physical_view_sets": [
      "SEARCH_TRAIL",
      "FARM_YARD"
    ],
    "renderer_binding": "v31-view",
    "anchor": "SEARCH_BEND cutaway -> PORCH_STANLEY -> FIELD_EDGE",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "D01-D06 scripted attack cutaway, no Clarence damage. D07 medic request may be radio report audible at porch; gives only incapacitation report. BEFORE_D08 Clarence PRESENT/Stanley conversation. AFTER_D13 Stanley goes inside; D14 Mike gives field-edge bridge.",
    "required_asset_keys": [
      "A03",
      "A04",
      "A06",
      "A11",
      "A13",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Hold on radio/field shadows while narration conveys the exact attack. Keep player damage disabled during the offscreen event.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S15-D02",
      "CF-S15-D05",
      "CF-S15-D06",
      "CF-S15-D07",
      "CF-S15-D08",
      "CF-S15-D09",
      "CF-S15-D10",
      "CF-S15-D13",
      "CF-S15-D14"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S15-D01",
        "CF-S15-D02",
        "CF-S15-D03",
        "CF-S15-D04",
        "CF-S15-D05",
        "CF-S15-D06",
        "CF-S15-D07",
        "CF-S15-D08",
        "CF-S15-D09",
        "CF-S15-D10",
        "CF-S15-D11",
        "CF-S15-D12",
        "CF-S15-D13",
        "CF-S15-D14"
      ],
      "required_cues": [
        "ENTRY",
        "D02_TO_D06",
        "BEFORE_D08",
        "AFTER_D13"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Attack recap, Stanley conversation and return bridge finish."
    }
  },
  "CF-S16": {
    "scene_id": "CF-S16",
    "title": "The field breaks around Clarence",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "USER:KEEP_EXISTING_SKY_TRANSITION",
      "GAME:LEGACY_OPENING"
    ],
    "fidelity": [
      "GAME_ORIGINAL"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON_SUBJECTIVE"
    },
    "environment": "EXISTING_CORN_THRESHOLD",
    "title_card": null,
    "controls": "LOOK_THEN_CINEMATIC",
    "objective": "Stay with Mike.",
    "narrative": "After the book’s revelations and conversations, insert the existing subjective transformation. Clarence sees the world liquefy and companion forms rise away. This is retained game material, not a novel event. Do not remove Stanley from the house to satisfy an old animation slot. Use Mike and, only if needed, an unidentified officer silhouette.",
    "blocking": "Mike and optional unnamed officer only; never Stanley or Glenda in rising actor slots.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Mike ahead at the field edge. The family is no longer in the party. Any second figure is a generic officer, not Stanley."
      },
      {
        "cue": "D02",
        "image": "Reuse liquid/sky effect and companion rise animation. Disable extra graphic additions and do not reconnect vines."
      },
      {
        "cue": "AFTER_D03",
        "image": "Corn becomes solid; Clarence has lost visual contact with his companions. Reuse pistol recovery only if already functional, with a pickup fallback."
      }
    ],
    "audio": {
      "ambience": "Existing liquid/sky effect, unidentified voice.",
      "cue_policy": "Stop source effect loops when the field stabilizes.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Look initially, then freeze movement while the existing effect runs. Restore only in the next intended state. No newly scripted attempt to catch a floating companion.",
    "build": {
      "preferred": "Keep existing effect implementation and correct actor bindings. Restrict invocation to this new story checkpoint.",
      "fallback": "Reuse the effect with Mike alone if the second slot can be disabled safely; otherwise a non-identified existing officer silhouette, not a new character model.",
      "new_minimum": [
        "One route hook",
        "Companion-slot correction"
      ]
    },
    "continuity": [
      "This sequence does not canonically establish Mike’s death or a supernatural explanation.",
      "The book does not contain sky evaporation; identify this as GAME_ORIGINAL everywhere in data.",
      "The family remains at the farm. There is no doctor role swap."
    ],
    "entry": {
      "previous_scene": "CF-S15",
      "checkpoint": "CP-16",
      "requirements": [
        "family_safe_at_house",
        "stanley_heard_clarence_directly"
      ]
    },
    "exit": {
      "next_scene": "CF-S17",
      "condition": "Sky sequence ends and input/audio ownership transfers cleanly.",
      "sets_flags": [
        "sky_sequence_seen",
        "companions_lost_from_view"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Stanley is not bound to a disappearing actor.",
      "This effect cannot fire during the earlier hand search.",
      "No old asylum/pit transition remains attached to the completion event."
    ],
    "line_ids": [
      "CF-S16-D01",
      "CF-S16-D02",
      "CF-S16-D03",
      "CF-S16-D04"
    ],
    "adapter_key": "sky",
    "cues": [
      "ENTRY",
      "D02",
      "AFTER_D03",
      "line:CF-S16-D01:start",
      "line:CF-S16-D01:complete",
      "line:CF-S16-D02:start",
      "line:CF-S16-D02:complete",
      "line:CF-S16-D03:start",
      "line:CF-S16-D03:complete",
      "line:CF-S16-D04:start",
      "line:CF-S16-D04:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Mike ahead at the field edge. The family is no longer in the party. Any second figure is a generic officer, not Stanley."
      },
      {
        "source_cue": "D02",
        "bound_cue": "D02",
        "trigger": "On canonical line display start.",
        "visual": "Reuse liquid/sky effect and companion rise animation. Disable extra graphic additions and do not reconnect vines."
      },
      {
        "source_cue": "AFTER_D03",
        "bound_cue": "AFTER_D03",
        "trigger": "After full acknowledgement of D03.",
        "visual": "Corn becomes solid; Clarence has lost visual contact with his companions. Reuse pistol recovery only if already functional, with a pickup fallback."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S16-D01",
        "scene_id": "CF-S16",
        "line_id": "CF-S16-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence",
          "mike"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S16-D02",
        "scene_id": "CF-S16",
        "line_id": "CF-S16-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S16-D03",
        "scene_id": "CF-S16",
        "line_id": "CF-S16-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S16-D04",
        "scene_id": "CF-S16",
        "line_id": "CF-S16-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Clarence hears speech; Mike D01 before disappearance. Unknown voice stays unknown; no Mike death fact.",
    "logical_set_id": "SKY_FIELD_EDGE",
    "physical_view_sets": [],
    "renderer_binding": "existing-sky",
    "anchor": "FIELD_EDGE",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Mike alone is selected minimum disappearing cast; disable second actor and matching ribbons/binary fragments. Never float Stanley under a different label. Existing effect only at S16; D04 follows solid return, no asylum callback.",
    "required_asset_keys": [
      "A01",
      "A03",
      "A16",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Reuse the effect with Mike alone if the second slot can be disabled safely; otherwise a non-identified existing officer silhouette, not a new character model.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S16-D01",
      "CF-S16-D03",
      "CF-S16-D04"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S16-D01",
        "CF-S16-D02",
        "CF-S16-D03",
        "CF-S16-D04"
      ],
      "required_cues": [
        "ENTRY",
        "D02",
        "AFTER_D03"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Sky sequence ends and input/audio ownership transfers cleanly."
    }
  },
  "CF-S17": {
    "scene_id": "CF-S17",
    "title": "The projector’s terms",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "GAME:PROJECTOR_AND_TRIAL"
    ],
    "fidelity": [
      "GAME_ORIGINAL"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON"
    },
    "environment": "EXISTING_RED_PROJECTOR_ROOM",
    "title_card": null,
    "controls": "LOOK_AND_DIALOGUE",
    "objective": "Listen to the trial instructions.",
    "narrative": "Reuse the projected face and trial explanation as a game-original interruption. Neither the face’s identity nor its relationship to the creature pack is established. The text below is the complete adaptation script, not a claimed verbatim extraction of current runtime dialogue.",
    "blocking": "Existing face/projector, no new actor choreography.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Existing red room, projector visible, anonymous projected face. Keep the player’s viewpoint fixed enough to read subtitles but allow look if already supported."
      },
      {
        "cue": "D04",
        "image": "Trial rules appear in short sequential subtitles, not a long instruction wall."
      },
      {
        "cue": "AFTER_D09",
        "image": "Return to the existing trial spawn; timer begins only after movement and input are ready."
      }
    ],
    "audio": {
      "ambience": "Projector hum; anonymous projected voice.",
      "cue_policy": "No overlapping voice lines; use the complete new script, not old pit instructions.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Continue/skip supported. A concise tutorial card can restate currently verified controls. Use the actual verified trial timer value in HUD, not hardcoded spoken duration if runtime differs.",
    "build": {
      "preferred": "Reuse projector scene and trial entry. Use the revised script to remove unsupported promises of a pit or hospital destination.",
      "fallback": "Existing static projected image plus subtitles. No video generation or new face animation is needed.",
      "new_minimum": [
        "Projector script update",
        "Trial handoff"
      ]
    },
    "continuity": [
      "Do not identify this voice as the ring leader, the leashed creature, Sadie or a god.",
      "“Help me” is the speaker’s claim.",
      "Source of trial instructions is game design, not the novel."
    ],
    "entry": {
      "previous_scene": "CF-S16",
      "checkpoint": "CP-17",
      "requirements": [
        "sky_sequence_seen"
      ]
    },
    "exit": {
      "next_scene": "CF-S18",
      "condition": "Trial instructions acknowledged and trial runtime ready.",
      "sets_flags": [
        "trial_instructions_seen"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Timer is not consumed by the instruction scene.",
      "No old “jump into the pit” destination is promised.",
      "Audio from the car or search does not continue underneath the projector."
    ],
    "line_ids": [
      "CF-S17-D01",
      "CF-S17-D02",
      "CF-S17-D03",
      "CF-S17-D04",
      "CF-S17-D05",
      "CF-S17-D06",
      "CF-S17-D07",
      "CF-S17-D08",
      "CF-S17-D09"
    ],
    "adapter_key": "projector",
    "cues": [
      "ENTRY",
      "D04",
      "AFTER_D09",
      "line:CF-S17-D01:start",
      "line:CF-S17-D01:complete",
      "line:CF-S17-D02:start",
      "line:CF-S17-D02:complete",
      "line:CF-S17-D03:start",
      "line:CF-S17-D03:complete",
      "line:CF-S17-D04:start",
      "line:CF-S17-D04:complete",
      "line:CF-S17-D05:start",
      "line:CF-S17-D05:complete",
      "line:CF-S17-D06:start",
      "line:CF-S17-D06:complete",
      "line:CF-S17-D07:start",
      "line:CF-S17-D07:complete",
      "line:CF-S17-D08:start",
      "line:CF-S17-D08:complete",
      "line:CF-S17-D09:start",
      "line:CF-S17-D09:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Existing red room, projector visible, anonymous projected face. Keep the player’s viewpoint fixed enough to read subtitles but allow look if already supported."
      },
      {
        "source_cue": "D04",
        "bound_cue": "D04",
        "trigger": "On canonical line display start.",
        "visual": "Trial rules appear in short sequential subtitles, not a long instruction wall."
      },
      {
        "source_cue": "AFTER_D09",
        "bound_cue": "AFTER_D09",
        "trigger": "After full acknowledgement of D09.",
        "visual": "Return to the existing trial spawn; timer begins only after movement and input are ready."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S17-D01",
        "scene_id": "CF-S17",
        "line_id": "CF-S17-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S17-D02",
        "scene_id": "CF-S17",
        "line_id": "CF-S17-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S17-D03",
        "scene_id": "CF-S17",
        "line_id": "CF-S17-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S17-D04",
        "scene_id": "CF-S17",
        "line_id": "CF-S17-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S17-D05",
        "scene_id": "CF-S17",
        "line_id": "CF-S17-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S17-D06",
        "scene_id": "CF-S17",
        "line_id": "CF-S17-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S17-D07",
        "scene_id": "CF-S17",
        "line_id": "CF-S17-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S17-D08",
        "scene_id": "CF-S17",
        "line_id": "CF-S17-D08",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S17-D09",
        "scene_id": "CF-S17",
        "line_id": "CF-S17-D09",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Clarence hears projected claims; no identity link to leader/Sadie/deity.",
    "logical_set_id": "PROJECTOR",
    "physical_view_sets": [],
    "renderer_binding": "existing-projector",
    "anchor": "EXISTING_PROJECTOR_ROOM",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Reuse createBloodRoom/anonymous face and optional projector GLB. Exact revised nine lines. AFTER_D09 checks trial runtime/input readiness; no active trial time consumed here or old pit instructions.",
    "required_asset_keys": [
      "A01",
      "A16",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Existing static projected image plus subtitles. No video generation or new face animation is needed.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S17-D02",
      "CF-S17-D04",
      "CF-S17-D05",
      "CF-S17-D06",
      "CF-S17-D07"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S17-D01",
        "CF-S17-D02",
        "CF-S17-D03",
        "CF-S17-D04",
        "CF-S17-D05",
        "CF-S17-D06",
        "CF-S17-D07",
        "CF-S17-D08",
        "CF-S17-D09"
      ],
      "required_cues": [
        "ENTRY",
        "D04",
        "AFTER_D09"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Trial instructions acknowledged and trial runtime ready."
    }
  },
  "CF-S18": {
    "scene_id": "CF-S18",
    "title": "Survive; keep looking for Sadie",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "GAME:EXISTING_CORNFIELDS_SURVIVAL"
    ],
    "fidelity": [
      "GAME_ORIGINAL"
    ],
    "perspective": {
      "character": "CLARENCE",
      "period": "PRESENT",
      "mode": "FIRST_PERSON_GAMEPLAY"
    },
    "environment": "EXISTING_CORNFIELDS_MAZE",
    "title_card": null,
    "controls": "EXISTING_SURVIVAL_CONTROLS",
    "objective": "Find Sadie Yates. Survive the trial.",
    "narrative": "Preserve the existing cornfield gameplay: corridor traversal, pursuer pressure, flashlight, pistol stagger, hiding, scarecrow recovery and struggle/retry if those systems are present in the verified baseline. This pass changes narrative routing, not balance or enemy architecture. The trial does not end with a rescue or with the asylum.",
    "blocking": "Use current gameplay enemy instances and count; no room zombies or rabbit.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Existing player spawn and readable objective. Hold threats until scene ready and player input is active."
      },
      {
        "cue": "PLAY",
        "image": "Keep current maze lighting, inventory and feedback. Add no mansion arrows or rabbit behavior."
      },
      {
        "cue": "TRIAL_COMPLETE",
        "image": "Freeze active pursuit before the completion line. Preserve the standing field viewpoint; do not invoke the pit."
      },
      {
        "cue": "AFTER_D02",
        "image": "Hard or short dark cut into the audience-only creature revelation in S19. The player has not found Sadie."
      }
    ],
    "audio": {
      "ambience": "Verified existing trial mix.",
      "cue_policy": "Pause and cleanup follow current gameplay settings. Completion voice once.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Use existing controls and progress state. Continue to S19 only on the verified trial-complete event. Failure returns to trial checkpoint; it does not replay the family investigation.",
    "build": {
      "preferred": "Adapter around the existing trial completion callback; keep maze, enemies and weapon code unchanged except necessary compatibility fixes.",
      "fallback": "If a reported mechanic is absent, document actual baseline behavior and keep that verified version; do not invent a replacement framework. If no working trial exists, report a functional blocker rather than ship a fake pass.",
      "new_minimum": [
        "Narrative objective text",
        "Completion routing adapter"
      ]
    },
    "continuity": [
      "No present-day Sadie actor at trial completion.",
      "No voluntary jump, floor collapse, hospital, mansion, key loop or rabbit in this route.",
      "Exact duration/ammo/damage values are read from inspected source; historical transcript values are expectations, not verified current constants."
    ],
    "entry": {
      "previous_scene": "CF-S17",
      "checkpoint": "CP-18",
      "requirements": [
        "trial_instructions_seen"
      ]
    },
    "exit": {
      "next_scene": "CF-S19",
      "condition": "Actual trial_complete event, then the once-only completion line.",
      "sets_flags": [
        "trial_complete"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Death/retry returns to a safe trial start and preserves prior narrative milestones.",
      "Pause does not advance active-play timer or damage.",
      "Repeated completion events advance only once.",
      "Final transition cannot load an asylum page or an old hospital checkpoint."
    ],
    "line_ids": [
      "CF-S18-D01",
      "CF-S18-D02"
    ],
    "adapter_key": "trial",
    "cues": [
      "ENTRY",
      "PLAY",
      "TRIAL_COMPLETE",
      "AFTER_D02",
      "line:CF-S18-D01:start",
      "line:CF-S18-D01:complete",
      "line:CF-S18-D02:start",
      "line:CF-S18-D02:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Existing player spawn and readable objective. Hold threats until scene ready and player input is active."
      },
      {
        "source_cue": "PLAY",
        "bound_cue": "PLAY",
        "trigger": "Explicit adapter event; deterministic trigger specified in binding note and master interaction.",
        "visual": "Keep current maze lighting, inventory and feedback. Add no mansion arrows or rabbit behavior."
      },
      {
        "source_cue": "TRIAL_COMPLETE",
        "bound_cue": "TRIAL_COMPLETE",
        "trigger": "Explicit adapter event; deterministic trigger specified in binding note and master interaction.",
        "visual": "Freeze active pursuit before the completion line. Preserve the standing field viewpoint; do not invoke the pit."
      },
      {
        "source_cue": "AFTER_D02",
        "bound_cue": "AFTER_D02",
        "trigger": "After full acknowledgement of D02.",
        "visual": "Hard or short dark cut into the audience-only creature revelation in S19. The player has not found Sadie."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S18-D01",
        "scene_id": "CF-S18",
        "line_id": "CF-S18-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S18-D02",
        "scene_id": "CF-S18",
        "line_id": "CF-S18-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "clarence"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Clarence hears objective/completion only; no Sadie location/safety knowledge.",
    "logical_set_id": "TRIAL",
    "physical_view_sets": [],
    "renderer_binding": "existing-gameplay",
    "anchor": "BASELINE_CONSTRUCTOR_SPAWN",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Use frozen part01 trialStartRecipe: authored createMaze({corridors:true,survival:false}), fresh createGame and attachSurvivalEnding({briefing:false}), 180 active seconds. No arbitrary spawn/seed. Route-specific branch inside completeSurvival before legacy Sadie phase/objective mutations. D01 entry, legitimate trial_complete then D02 once, only S19. NO production skip/complete button.",
    "required_asset_keys": [
      "A01",
      "A17",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "If a reported mechanic is absent, document actual baseline behavior and keep that verified version; do not invent a replacement framework. If no working trial exists, report a functional blocker rather than ship a fake pass.",
    "skip_allowed": false,
    "recap_line_ids": [],
    "completion_rule": {
      "kind": "TRIAL_SUCCESS",
      "required_line_ids": [
        "CF-S18-D01",
        "CF-S18-D02"
      ],
      "required_cues": [
        "ENTRY",
        "PLAY",
        "TRIAL_COMPLETE",
        "AFTER_D02"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Actual trial_complete event, then the once-only completion line."
    }
  },
  "CF-S19": {
    "scene_id": "CF-S19",
    "title": "The farmer’s little girl",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:I.13:256-262"
    ],
    "fidelity": [
      "DIRECT",
      "COMPRESSED",
      "AUDIENCE_CUTAWAY"
    ],
    "perspective": {
      "character": "NONE",
      "period": "PRESENT",
      "mode": "NONPLAYABLE_CREATURE_CUTAWAY"
    },
    "environment": "REDRESSED_DARK_CORN_POCKET",
    "title_card": {
      "main": "ELSEWHERE",
      "sub": "PRESENT"
    },
    "controls": "DIALOGUE_ONLY",
    "objective": null,
    "narrative": "The audience sees or hears the creatures’ private scene. A leashed gray creature, called vermin by the ring leader, begs not to be locked away. The group fears for members that have not returned. The leashed creature speaks of the farmer’s little girl. This follows the novel’s reveal while withholding Sadie’s appearance, condition and exact location.",
    "blocking": "Leader upright, leashed figure lower, optional two background silhouettes; no group AI.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Reuse dark ground and corn geometry. Show a leader silhouette, a crouched figure and at most two background silhouettes. A static leash line is enough."
      },
      {
        "cue": "D01",
        "image": "A dark rectangular opening suggests the source’s large underground safe. Do not construct a new explorable bunker."
      },
      {
        "cue": "D04",
        "image": "Leader’s yellow-eyed impression is optional if available; no maggots, extensive facial rig or gore is required."
      },
      {
        "cue": "AFTER_D06",
        "image": "Let the final subtitle be read; then immediate hard cut to black and PART II / 1955 in S20. No rescue image or pit fall."
      }
    ],
    "audio": {
      "ambience": "Low wind, subtle group movement, intelligible speech.",
      "cue_policy": "After last line read/acknowledged, stop all horror sound at S20 entry.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "No movement or combat. Continue after the last caption triggers the mandatory historical cut. A full-skip recap must retain the creature’s claim before the date card.",
    "build": {
      "preferred": "Reuse creature mesh with frozen poses, dark corn pocket, simple leash and black opening. One camera, two small framings.",
      "fallback": "Silhouettes and captioned voices on the same corn backdrop. No Sadie model, capture animation, rope simulation or pack AI.",
      "new_minimum": [
        "Revelation script",
        "Simple safe-opening/leash suggestion",
        "Hard-cut exit"
      ]
    },
    "continuity": [
      "The audience receives the claim; Clarence does not overhear it.",
      "Do not label the creatures ordinary mindless zombies. Source shows language and hierarchy.",
      "Do not assign leader/creature identities beyond what the book gives.",
      "This is not confirmation of Sadie’s safety or a rescue."
    ],
    "entry": {
      "previous_scene": "CF-S18",
      "checkpoint": "CP-19",
      "requirements": [
        "trial_complete"
      ]
    },
    "exit": {
      "next_scene": "CF-S20",
      "condition": "Final creature statement acknowledged.",
      "sets_flags": [
        "audience_heard_sadie_custody_claim"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Clarence’s quest journal does not suddenly know the private revelation.",
      "The final words remain readable and audible.",
      "S20 is the only next route; no credits or hospital intervenes."
    ],
    "line_ids": [
      "CF-S19-D01",
      "CF-S19-D02",
      "CF-S19-D03",
      "CF-S19-D04",
      "CF-S19-D05",
      "CF-S19-D06"
    ],
    "adapter_key": "revelation",
    "cues": [
      "ENTRY",
      "D01",
      "D04",
      "AFTER_D06",
      "line:CF-S19-D01:start",
      "line:CF-S19-D01:complete",
      "line:CF-S19-D02:start",
      "line:CF-S19-D02:complete",
      "line:CF-S19-D03:start",
      "line:CF-S19-D03:complete",
      "line:CF-S19-D04:start",
      "line:CF-S19-D04:complete",
      "line:CF-S19-D05:start",
      "line:CF-S19-D05:complete",
      "line:CF-S19-D06:start",
      "line:CF-S19-D06:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Reuse dark ground and corn geometry. Show a leader silhouette, a crouched figure and at most two background silhouettes. A static leash line is enough."
      },
      {
        "source_cue": "D01",
        "bound_cue": "D01",
        "trigger": "On canonical line display start.",
        "visual": "A dark rectangular opening suggests the source’s large underground safe. Do not construct a new explorable bunker."
      },
      {
        "source_cue": "D04",
        "bound_cue": "D04",
        "trigger": "On canonical line display start.",
        "visual": "Leader’s yellow-eyed impression is optional if available; no maggots, extensive facial rig or gore is required."
      },
      {
        "source_cue": "AFTER_D06",
        "bound_cue": "AFTER_D06",
        "trigger": "After full acknowledgement of D06.",
        "visual": "Let the final subtitle be read; then immediate hard cut to black and PART II / 1955 in S20. No rescue image or pit fall."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S19-D01",
        "scene_id": "CF-S19",
        "line_id": "CF-S19-D01",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S19-D02",
        "scene_id": "CF-S19",
        "line_id": "CF-S19-D02",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S19-D03",
        "scene_id": "CF-S19",
        "line_id": "CF-S19-D03",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S19-D04",
        "scene_id": "CF-S19",
        "line_id": "CF-S19-D04",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S19-D05",
        "scene_id": "CF-S19",
        "line_id": "CF-S19-D05",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S19-D06",
        "scene_id": "CF-S19",
        "line_id": "CF-S19-D06",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Tracked audience only; CREATURES_AND_AUDIENCE never any modern protagonist. Claim not rescue/safety proof.",
    "logical_set_id": "CREATURE_REVELATION",
    "physical_view_sets": [
      "CREATURE_REVEAL"
    ],
    "renderer_binding": "v31-view",
    "anchor": "REDRESSED_DARK_CORN_POCKET",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Six lines, static silhouettes/leash/safe opening, no live AI or Sadie model. No direct whole-scene skip past claim: skip request presents existing D06 recap and requires acknowledgement before date. No modern character knowledge.",
    "required_asset_keys": [
      "A11",
      "A18",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Silhouettes and captioned voices on the same corn backdrop. No Sadie model, capture animation, rope simulation or pack AI.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S19-D06"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S19-D01",
        "CF-S19-D02",
        "CF-S19-D03",
        "CF-S19-D04",
        "CF-S19-D05",
        "CF-S19-D06"
      ],
      "required_cues": [
        "ENTRY",
        "D01",
        "D04",
        "AFTER_D06"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Final creature statement acknowledged."
    }
  },
  "CF-S20": {
    "scene_id": "CF-S20",
    "title": "Hard cut: Part II, 1955",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:II.TITLE:265-266",
      "USER:HARD_CUT_1955"
    ],
    "fidelity": [
      "DIRECT",
      "APPROVED_PRESENTATION"
    ],
    "perspective": {
      "character": "NONE",
      "period": "1955",
      "mode": "TITLE_TRANSITION"
    },
    "environment": "BLACK_FRAME",
    "title_card": {
      "main": "PART II",
      "sub": "1955"
    },
    "controls": "TITLE_CONTINUE_ONLY",
    "objective": null,
    "narrative": "A sharp structural break, not a time portal the player walks through. The date and new part mark the novel’s second narrative. Clarence is not traveling into his own past or becoming Dale.",
    "blocking": "No actors.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Cut picture and horror ambience immediately to black. Display PART II over 1955 in large readable text. No dissolve, spinning clock or flashing montage."
      },
      {
        "cue": "TITLE_HOLD",
        "image": "Silence first; then ordinary birds and daytime room ambience. Hold for at least 2.5 seconds in auto mode; manual mode keeps Continue available after the text settles."
      },
      {
        "cue": "EXIT",
        "image": "Warm daylight replaces the cold field palette. Show DALE ARKINS | 1955 before enabling his viewpoint in S21."
      }
    ],
    "audio": {
      "ambience": "Silence, then ordinary birds/daytime tone.",
      "cue_policy": "Hard audio cut, not horror ambience carried under the year.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "One Continue prompt after the title has appeared. Transition must still show the date during skip and fast-playtest routes.",
    "build": {
      "preferred": "Existing text overlay and audio-bus stop/start. One environment lighting preset switch behind the opaque frame.",
      "fallback": "Static black/title screen with captions for daytime ambience; no new effect dependency.",
      "new_minimum": [
        "Part/date title cue"
      ]
    },
    "continuity": [
      "Present-day damage, weapons, timer, enemies and objective are not carried into 1955.",
      "1955 is a narrative cut, not evidence of time travel.",
      "The reused architecture does not prove the historical farmhouse has the Yates street address."
    ],
    "entry": {
      "previous_scene": "CF-S19",
      "checkpoint": "CP-20",
      "requirements": [
        "audience_heard_sadie_custody_claim"
      ]
    },
    "exit": {
      "next_scene": "CF-S21",
      "condition": "Part/date title acknowledged and historical scene ready.",
      "sets_flags": [
        "part_ii_started"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "No horror voice or active enemies leak across the cut.",
      "The date remains present after Skip.",
      "A clean historical player state is created without overwriting the modern retry snapshot."
    ],
    "line_ids": [
      "CF-S20-D01"
    ],
    "adapter_key": "title1955",
    "cues": [
      "ENTRY",
      "TITLE_HOLD",
      "EXIT",
      "line:CF-S20-D01:start",
      "line:CF-S20-D01:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Cut picture and horror ambience immediately to black. Display PART II over 1955 in large readable text. No dissolve, spinning clock or flashing montage."
      },
      {
        "source_cue": "TITLE_HOLD",
        "bound_cue": "TITLE_HOLD",
        "trigger": "Explicit adapter event; deterministic trigger specified in binding note and master interaction.",
        "visual": "Silence first; then ordinary birds and daytime room ambience. Hold for at least 2.5 seconds in auto mode; manual mode keeps Continue available after the text settles."
      },
      {
        "source_cue": "EXIT",
        "bound_cue": "EXIT",
        "trigger": "Explicit adapter event; deterministic trigger specified in binding note and master interaction.",
        "visual": "Warm daylight replaces the cold field palette. Show DALE ARKINS | 1955 before enabling his viewpoint in S21."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S20-D01",
        "scene_id": "CF-S20",
        "line_id": "CF-S20-D01",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      }
    ],
    "knowledge_scope": "Audience date, not time-travel knowledge.",
    "logical_set_id": "BLACK_1955",
    "physical_view_sets": [],
    "renderer_binding": "overlay",
    "anchor": "NONE",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Hard black/silence, PART II / 1955 retained under skip; 2.5 active-second title hold in auto, manual Continue after settled title. Clear modern weapon/HUD/damage/radio/enemies/timer. Preserve trial recipe separately.",
    "required_asset_keys": [
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Static black/title screen with captions for daytime ambience; no new effect dependency.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S20-D01"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S20-D01"
      ],
      "required_cues": [
        "ENTRY",
        "TITLE_HOLD",
        "EXIT"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Part/date title acknowledged and historical scene ready."
    }
  },
  "CF-S21": {
    "scene_id": "CF-S21",
    "title": "Dale’s land and wedding memory",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:II.01:269-276"
    ],
    "fidelity": [
      "COMPRESSED",
      "NARRATED_MEMORY"
    ],
    "perspective": {
      "character": "DALE_ARKINS",
      "period": "1955",
      "mode": "FIRST_PERSON_TABLEAU"
    },
    "environment": "REUSED_INTERIOR_NEUTRAL_TABLE_1955",
    "title_card": {
      "main": "DALE ARKINS",
      "sub": "1955"
    },
    "controls": "LOOK_AND_INSPECT",
    "objective": "Inspect the envelope and farm photographs.",
    "narrative": "Preserve Dale entering Friendly’s and recalling the land purchase on his wedding night. Reuse a table and warm room shell as an illustrative tableau, not a claim that every source location was the farmhouse. The farm pictures and envelope carry the scene. Do not invent a deed price, legal document, ownership chain or confirmed date for the wedding.",
    "blocking": "Camera is Dale; Pam offscreen or still silhouette, photo props on table.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Sunlit tabletop, mug, plain envelope and a farm photograph derived from existing environment art. Diner ambience briefly establishes the opening without building Friendly’s."
      },
      {
        "cue": "D02",
        "image": "Small caption “DALE’S RECOLLECTION”. Lighting or a single hard cut marks the wedding memory while retaining Dale’s viewpoint."
      },
      {
        "cue": "INSPECT_ENVELOPE",
        "image": "E focuses the envelope; no signature UI. Reverse side shows photos of a house and fields, with no real address or purchase price."
      },
      {
        "cue": "AFTER_D07",
        "image": "Hold the fields in the photo, then transition to Pam’s narrated thread."
      }
    ],
    "audio": {
      "ambience": "Ordinary cafe/room tone, paper handling if already available.",
      "cue_policy": "Recollection is tagged; no licensed popular music or elaborate wedding audio.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Inspect the envelope/photo once, listen/advance the complete recollection, continue. No land-purchase system, wedding simulation or new hotel location.",
    "build": {
      "preferred": "Reuse a non-distinctive table/chairs/walls from existing assets. Add flat envelope/photo props and a warm preset. Dale is camera-only.",
      "fallback": "Single tabletop close-up with captions. Pam remains offscreen. Diner/hotel locations are explicitly narrated, not reconstructed.",
      "new_minimum": [
        "Plain envelope",
        "Farm photograph plane",
        "Historical prop/layout variant"
      ]
    },
    "continuity": [
      "Section II.03 later refers to the owner selling the fields. Preserve the transaction-timing ambiguity rather than inventing an explanation.",
      "Dale’s wedding memory is not dated independently beyond the supplied 1955 part.",
      "No sexual reenactment is needed; the adult relationship remains clear through narrated context."
    ],
    "entry": {
      "previous_scene": "CF-S20",
      "checkpoint": "CP-21",
      "requirements": [
        "part_ii_started"
      ]
    },
    "exit": {
      "next_scene": "CF-S22",
      "condition": "Envelope/photo inspected and the script finished.",
      "sets_flags": [
        "dale_land_purchase_presented"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "No modern pistol, phone, hospital prop or police clothing appears in frame.",
      "No unsupported purchase price, exact deed text or Yates address is invented.",
      "Inspect cannot lock the camera after Continue."
    ],
    "line_ids": [
      "CF-S21-D01",
      "CF-S21-D02",
      "CF-S21-D03",
      "CF-S21-D04",
      "CF-S21-D05",
      "CF-S21-D06",
      "CF-S21-D07"
    ],
    "adapter_key": "historical",
    "cues": [
      "ENTRY",
      "D02",
      "INSPECT_ENVELOPE",
      "AFTER_D07",
      "line:CF-S21-D01:start",
      "line:CF-S21-D01:complete",
      "line:CF-S21-D02:start",
      "line:CF-S21-D02:complete",
      "line:CF-S21-D03:start",
      "line:CF-S21-D03:complete",
      "line:CF-S21-D04:start",
      "line:CF-S21-D04:complete",
      "line:CF-S21-D05:start",
      "line:CF-S21-D05:complete",
      "line:CF-S21-D06:start",
      "line:CF-S21-D06:complete",
      "line:CF-S21-D07:start",
      "line:CF-S21-D07:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Sunlit tabletop, mug, plain envelope and a farm photograph derived from existing environment art. Diner ambience briefly establishes the opening without building Friendly’s."
      },
      {
        "source_cue": "D02",
        "bound_cue": "D02",
        "trigger": "On canonical line display start.",
        "visual": "Small caption “DALE’S RECOLLECTION”. Lighting or a single hard cut marks the wedding memory while retaining Dale’s viewpoint."
      },
      {
        "source_cue": "INSPECT_ENVELOPE",
        "bound_cue": "INSPECT_ENVELOPE",
        "trigger": "Explicit adapter event; deterministic trigger specified in binding note and master interaction.",
        "visual": "E focuses the envelope; no signature UI. Reverse side shows photos of a house and fields, with no real address or purchase price."
      },
      {
        "source_cue": "AFTER_D07",
        "bound_cue": "AFTER_D07",
        "trigger": "After full acknowledgement of D07.",
        "visual": "Hold the fields in the photo, then transition to Pam’s narrated thread."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S21-D01",
        "scene_id": "CF-S21",
        "line_id": "CF-S21-D01",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S21-D02",
        "scene_id": "CF-S21",
        "line_id": "CF-S21-D02",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S21-D03",
        "scene_id": "CF-S21",
        "line_id": "CF-S21-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S21-D04",
        "scene_id": "CF-S21",
        "line_id": "CF-S21-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S21-D05",
        "scene_id": "CF-S21",
        "line_id": "CF-S21-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S21-D06",
        "scene_id": "CF-S21",
        "line_id": "CF-S21-D06",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S21-D07",
        "scene_id": "CF-S21",
        "line_id": "CF-S21-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Audience all; Dale's recollection/utterances belong to Dale. MEMORY_ONLY is wedding context, never Clarence memory.",
    "logical_set_id": "HISTORICAL_ENVELOPE",
    "physical_view_sets": [
      "HISTORICAL_TABLE"
    ],
    "renderer_binding": "v31-view",
    "anchor": "HISTORICAL_TABLE",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Shared warm tabletop/envelope/photo. Inspection after D02 via E or visible Inspect; must finish before exit. Seven lines preserve purchase ambiguity. No deed price/address/invented wedding date.",
    "required_asset_keys": [
      "A19",
      "A20",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Single tabletop close-up with captions. Pam remains offscreen. Diner/hotel locations are explicitly narrated, not reconstructed.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S21-D01",
      "CF-S21-D02",
      "CF-S21-D04",
      "CF-S21-D05",
      "CF-S21-D06"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S21-D01",
        "CF-S21-D02",
        "CF-S21-D03",
        "CF-S21-D04",
        "CF-S21-D05",
        "CF-S21-D06",
        "CF-S21-D07"
      ],
      "required_cues": [
        "ENTRY",
        "D02",
        "INSPECT_ENVELOPE",
        "AFTER_D07"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Envelope/photo inspected and the script finished."
    }
  },
  "CF-S22": {
    "scene_id": "CF-S22",
    "title": "Pam’s work and the lunch encounter",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:II.02:279-294"
    ],
    "fidelity": [
      "AUDIO_ONLY",
      "COMPRESSED",
      "NARRATED_CUTAWAY"
    ],
    "perspective": {
      "character": "NONE",
      "period": "1955",
      "mode": "PAM_FOCUSED_NONPLAYABLE_MONTAGE"
    },
    "environment": "REUSED_NEUTRAL_DESK_AND_TABLE_CLOSEUPS",
    "title_card": {
      "main": "PAM ARKINS",
      "sub": "1955 | NARRATED INTERLUDE"
    },
    "controls": "DIALOGUE_ONLY",
    "objective": null,
    "narrative": "Keep the entire causal Pam thread: secretary work, Pete Gateman’s harassment, lunch at Del’Amo’s in Newton, Diego’s flirtation, Pam naming her marriage and leaving the encounter open. This is not a confirmed affair. Two tabletop inserts and exact attributed speech avoid building a law office or restaurant.",
    "blocking": "Desk/table closeups, no touching/harassment animation or new actor model.",
    "visual_beats": [
      {
        "cue": "D01",
        "image": "Paper stacks and labels on the same reused desk/table. Office ambience or captions. No modern computer screen."
      },
      {
        "cue": "D03",
        "image": "Cut to table, glass of water and plain menu silhouette. Subtitle location “DEL’AMO’S | NEWTON” identifies the source location without a complete diner."
      },
      {
        "cue": "D04_TO_D08",
        "image": "Keep Pam and Diego offscreen if no suitable models exist. Actor names and delivery carry the exchange. No unwanted-touch animation."
      }
    ],
    "audio": {
      "ambience": "Office room tone, then quiet restaurant/table ambience.",
      "cue_policy": "Offscreen speech is attributed; no crowd simulation or sexualized sound effect.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Advance caption/voice montage. No romance options or optional quest can alter what happens.",
    "build": {
      "preferred": "Two fixed close-ups of already loaded table/desk geometry, location labels, narration and subtitle dialogue.",
      "fallback": "Caption cards with a neutral warm background. No Pam/Diego model requirement.",
      "new_minimum": [
        "Desk/menu insert staging",
        "Pam/Diego script"
      ]
    },
    "continuity": [
      "No affair, pregnancy, betrayal outcome or relationship with the creatures is established here.",
      "Narration of harassment is not endorsement and should not be staged as a reward.",
      "Specific tobacco promotion and price trivia can be deferred; do not transform a character’s cigarette boast into factual health advice."
    ],
    "entry": {
      "previous_scene": "CF-S21",
      "checkpoint": "CP-22",
      "requirements": [
        "dale_land_purchase_presented"
      ]
    },
    "exit": {
      "next_scene": "CF-S23",
      "condition": "Pam’s final line and dinner caption acknowledged.",
      "sets_flags": [
        "pam_work_lunch_presented"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "This scene is mandatory story coverage even in low-asset mode.",
      "Dale gains no knowledge of the lunch encounter merely because the audience saw it.",
      "No player choice manufactures a new relationship branch."
    ],
    "line_ids": [
      "CF-S22-D01",
      "CF-S22-D02",
      "CF-S22-D03",
      "CF-S22-D04",
      "CF-S22-D05",
      "CF-S22-D06",
      "CF-S22-D07",
      "CF-S22-D08"
    ],
    "adapter_key": "historical",
    "cues": [
      "D01",
      "D03",
      "D04_TO_D08",
      "line:CF-S22-D01:start",
      "line:CF-S22-D01:complete",
      "line:CF-S22-D02:start",
      "line:CF-S22-D02:complete",
      "line:CF-S22-D03:start",
      "line:CF-S22-D03:complete",
      "line:CF-S22-D04:start",
      "line:CF-S22-D04:complete",
      "line:CF-S22-D05:start",
      "line:CF-S22-D05:complete",
      "line:CF-S22-D06:start",
      "line:CF-S22-D06:complete",
      "line:CF-S22-D07:start",
      "line:CF-S22-D07:complete",
      "line:CF-S22-D08:start",
      "line:CF-S22-D08:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "D01",
        "bound_cue": "D01",
        "trigger": "On canonical line display start.",
        "visual": "Paper stacks and labels on the same reused desk/table. Office ambience or captions. No modern computer screen."
      },
      {
        "source_cue": "D03",
        "bound_cue": "D03",
        "trigger": "On canonical line display start.",
        "visual": "Cut to table, glass of water and plain menu silhouette. Subtitle location “DEL’AMO’S | NEWTON” identifies the source location without a complete diner."
      },
      {
        "source_cue": "D04_TO_D08",
        "bound_cue": "D04_TO_D08",
        "trigger": "Inclusive line staging window D04_TO_D08.",
        "visual": "Keep Pam and Diego offscreen if no suitable models exist. Actor names and delivery carry the exchange. No unwanted-touch animation."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S22-D01",
        "scene_id": "CF-S22",
        "line_id": "CF-S22-D01",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S22-D02",
        "scene_id": "CF-S22",
        "line_id": "CF-S22-D02",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S22-D03",
        "scene_id": "CF-S22",
        "line_id": "CF-S22-D03",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S22-D04",
        "scene_id": "CF-S22",
        "line_id": "CF-S22-D04",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S22-D05",
        "scene_id": "CF-S22",
        "line_id": "CF-S22-D05",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S22-D06",
        "scene_id": "CF-S22",
        "line_id": "CF-S22-D06",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S22-D07",
        "scene_id": "CF-S22",
        "line_id": "CF-S22-D07",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S22-D08",
        "scene_id": "CF-S22",
        "line_id": "CF-S22-D08",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      }
    ],
    "knowledge_scope": "Tracked audience only; Pam/Diego exchange never updates dale. No affair/pregnancy fact.",
    "logical_set_id": "HISTORICAL_DESK_LUNCH",
    "physical_view_sets": [
      "HISTORICAL_WORK_LUNCH"
    ],
    "renderer_binding": "v31-view",
    "anchor": "HISTORICAL_DESK / HISTORICAL_TABLE",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Mandatory Pam-labelled desk/lunch montage, D01-D02 office, D03 location transition, D04-D08 table/offscreen actors. No affair/pregnancy branch or Dale knowledge transfer.",
    "required_asset_keys": [
      "A19",
      "A20",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Caption cards with a neutral warm background. No Pam/Diego model requirement.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S22-D01",
      "CF-S22-D02",
      "CF-S22-D03",
      "CF-S22-D04",
      "CF-S22-D05",
      "CF-S22-D08"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S22-D01",
        "CF-S22-D02",
        "CF-S22-D03",
        "CF-S22-D04",
        "CF-S22-D05",
        "CF-S22-D06",
        "CF-S22-D07",
        "CF-S22-D08"
      ],
      "required_cues": [
        "D01",
        "D03",
        "D04_TO_D08"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Pam’s final line and dinner caption acknowledged."
    }
  },
  "CF-S23": {
    "scene_id": "CF-S23",
    "title": "Why was the land so cheap?",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:II.03:297-309"
    ],
    "fidelity": [
      "DIRECT",
      "COMPRESSED"
    ],
    "perspective": {
      "character": "DALE_ARKINS",
      "period": "1955",
      "mode": "FIRST_PERSON_SEATED"
    },
    "environment": "REUSED_DINING_ROOM_1955",
    "title_card": {
      "main": "DALE ARKINS",
      "sub": "1955"
    },
    "controls": "LOOK_AND_DIALOGUE",
    "objective": "Finish dinner with Pam.",
    "narrative": "Pam is quieter at dinner. Dale talks about work and the property owner’s calls. Pam questions the cheap fields. Dale answers with confidence about the land and their future. Her hand pauses on her stomach; the source leaves that implication unexplained. Preserve the uncertainty instead of announcing a pregnancy.",
    "blocking": "Dale camera; Pam opposite or offscreen. A rough pose or stage caption conveys the gesture.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Two places at an ordinary dining table. Warm light now lower. Corn visible only if the existing camera can imply it without establishing an unproven residence."
      },
      {
        "cue": "D07",
        "image": "Hold on the table or Pam’s still silhouette. The land is the subject, not a supernatural apparition outside."
      },
      {
        "cue": "D09",
        "image": "If a body is available, a rough hand-to-stomach pose. Otherwise the stage caption states the action. No bespoke animation blocker."
      }
    ],
    "audio": {
      "ambience": "Dinner room tone and occasional tableware.",
      "cue_policy": "Pause after stomach gesture; do not add a supernatural sting implying a confirmed cause.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Look and continue. Fixed dialogue; no land-investment or relationship branch. One seated conversation.",
    "build": {
      "preferred": "Use dining room/table, one Pam silhouette or offscreen voice, plain dishes and existing idle.",
      "fallback": "Table-only composition and stage captions. Reused adult geometry is a production placeholder, never a canon claim Pam is Glenda.",
      "new_minimum": [
        "Dinner script",
        "Period-dressed view"
      ]
    },
    "continuity": [
      "Do not explain the cheap price as a curse or seller conspiracy.",
      "Do not label Pam pregnant.",
      "No exact timing repair for purchase-versus-selling language. The source conflict stays visible."
    ],
    "entry": {
      "previous_scene": "CF-S22",
      "checkpoint": "CP-23",
      "requirements": [
        "pam_work_lunch_presented"
      ]
    },
    "exit": {
      "next_scene": "CF-S24",
      "condition": "Dinner conversation finished.",
      "sets_flags": [
        "cheap_land_question_raised"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "Every Pam/Dale line is delivered by the correct character.",
      "Stomach cue does not set a pregnancy fact flag.",
      "Ending does not spawn a monster in the 1955 room."
    ],
    "line_ids": [
      "CF-S23-D01",
      "CF-S23-D02",
      "CF-S23-D03",
      "CF-S23-D04",
      "CF-S23-D05",
      "CF-S23-D06",
      "CF-S23-D07",
      "CF-S23-D08",
      "CF-S23-D09",
      "CF-S23-D10",
      "CF-S23-D11",
      "CF-S23-D12",
      "CF-S23-D13"
    ],
    "adapter_key": "historical",
    "cues": [
      "ENTRY",
      "D07",
      "D09",
      "line:CF-S23-D01:start",
      "line:CF-S23-D01:complete",
      "line:CF-S23-D02:start",
      "line:CF-S23-D02:complete",
      "line:CF-S23-D03:start",
      "line:CF-S23-D03:complete",
      "line:CF-S23-D04:start",
      "line:CF-S23-D04:complete",
      "line:CF-S23-D05:start",
      "line:CF-S23-D05:complete",
      "line:CF-S23-D06:start",
      "line:CF-S23-D06:complete",
      "line:CF-S23-D07:start",
      "line:CF-S23-D07:complete",
      "line:CF-S23-D08:start",
      "line:CF-S23-D08:complete",
      "line:CF-S23-D09:start",
      "line:CF-S23-D09:complete",
      "line:CF-S23-D10:start",
      "line:CF-S23-D10:complete",
      "line:CF-S23-D11:start",
      "line:CF-S23-D11:complete",
      "line:CF-S23-D12:start",
      "line:CF-S23-D12:complete",
      "line:CF-S23-D13:start",
      "line:CF-S23-D13:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Two places at an ordinary dining table. Warm light now lower. Corn visible only if the existing camera can imply it without establishing an unproven residence."
      },
      {
        "source_cue": "D07",
        "bound_cue": "D07",
        "trigger": "On canonical line display start.",
        "visual": "Hold on the table or Pam’s still silhouette. The land is the subject, not a supernatural apparition outside."
      },
      {
        "source_cue": "D09",
        "bound_cue": "D09",
        "trigger": "On canonical line display start.",
        "visual": "If a body is available, a rough hand-to-stomach pose. Otherwise the stage caption states the action. No bespoke animation blocker."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S23-D01",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D01",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D02",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D02",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D03",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D03",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D04",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D04",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D05",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D05",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D06",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D06",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D07",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D07",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D08",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D08",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D09",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D09",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D10",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D10",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S23-D11",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D11",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D12",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D12",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S23-D13",
        "scene_id": "CF-S23",
        "line_id": "CF-S23-D13",
        "kind": "line",
        "recipients": [
          "audience",
          "dale"
        ],
        "presentation": "heard"
      }
    ],
    "knowledge_scope": "Dale local spoken D01-D09/D11-D13; D10 audience stage caption, never pregnancy fact. Audience all.",
    "logical_set_id": "HISTORICAL_DINNER",
    "physical_view_sets": [
      "HISTORICAL_DINNER"
    ],
    "renderer_binding": "v31-view",
    "anchor": "HISTORICAL_TABLE",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Thirteen dinner lines, Dale-labelled POV. D09 is framing cue; actual stomach action/caption at existing D10. No pregnancy flag, cheap-land curse explanation or transaction-timing repair.",
    "required_asset_keys": [
      "A19",
      "A20",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "Table-only composition and stage captions. Reused adult geometry is a production placeholder, never a canon claim Pam is Glenda.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S23-D06",
      "CF-S23-D07",
      "CF-S23-D09",
      "CF-S23-D10",
      "CF-S23-D11",
      "CF-S23-D12"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S23-D01",
        "CF-S23-D02",
        "CF-S23-D03",
        "CF-S23-D04",
        "CF-S23-D05",
        "CF-S23-D06",
        "CF-S23-D07",
        "CF-S23-D08",
        "CF-S23-D09",
        "CF-S23-D10",
        "CF-S23-D11",
        "CF-S23-D12",
        "CF-S23-D13"
      ],
      "required_cues": [
        "ENTRY",
        "D07",
        "D09"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Dinner conversation finished."
    }
  },
  "CF-S24": {
    "scene_id": "CF-S24",
    "title": "The next day: the storm warning",
    "implementation_status": "NOT_STARTED",
    "source_refs": [
      "BK:II.04:312"
    ],
    "fidelity": [
      "COMPRESSED",
      "APPROVED_PRESENTATION"
    ],
    "perspective": {
      "character": "PAM_ARKINS",
      "period": "1955",
      "mode": "FIRST_PERSON_BOUNDED_STORE_INSERT"
    },
    "environment": "REUSED_ROOM_SHELL_DRESSED_AS_GROCERY_INSERT",
    "title_card": {
      "main": "PAM ARKINS",
      "sub": "1955 | THE FOLLOWING DAY"
    },
    "controls": "LOOK_SHORT_WALK_INSPECT_NO_COMBAT",
    "objective": "Listen to the weather warning.",
    "narrative": "End at the actual edge of the uploaded text: Pam in a crowded grocery market the day before an unusual nor’easter. Forecasts mention torrential rain, hurricane-force winds and hail. Do not show the storm arriving, deaths, a historical monster encounter or an answer to the mystery. A small counter/window insert, captions and crowd sound convey the store without a new building.",
    "blocking": "Pam camera, simple counter/shelf insert; other shoppers stay out of frame.",
    "visual_beats": [
      {
        "cue": "ENTRY",
        "image": "Same generic room shell, visibly redressed as a tiny store counter/aisle insert: shelves, paper bag, plain groceries, tabletop radio. No farmhouse kitchen label."
      },
      {
        "cue": "D01",
        "image": "Crowd and traffic are outside the frame. A window or light preset suggests cloudier daylight; no active torrential-rain effect."
      },
      {
        "cue": "D02",
        "image": "Weather voice comes from the radio. A large caption presents the forecast if sound is absent."
      },
      {
        "cue": "EXIT",
        "image": "Hard cut to “END OF AVAILABLE STORY” and “TO BE CONTINUED”. Offer replay/chapter select only; no automatic asylum route."
      }
    ],
    "audio": {
      "ambience": "Muted shop crowd/horns, radio forecast.",
      "cue_policy": "Weather is forecast, not already occurring; no storm-impact effects.",
      "asset_policy": "Reuse approved existing audio; otherwise use descriptive captions. Voice assets optional.",
      "exit_policy": "Stop scene-owned clips, loops and delayed cues before the next owner starts."
    },
    "interaction": "Inspect the radio or use the visible Listen/Continue prompt. A short clear walking area is optional. Do not require collecting a shopping list, spending money or moving through a crowd.",
    "build": {
      "preferred": "Redress an existing generic room with repeated shelf meshes and flat grocery props. Radio can be a simple box or reused prop.",
      "fallback": "One close-up counter/window tableau and narrated caption. This is a location insert, not a new supermarket level.",
      "new_minimum": [
        "Simple radio if no suitable prop exists",
        "Store sign/counter dressing",
        "End card"
      ]
    },
    "continuity": [
      "The provided Part II, Section 4 ends mid-development. Nothing beyond its last paragraph is canon available here.",
      "Do not call the game’s full narrative finished. This is the end of the supplied excerpt.",
      "The interior reuse is an asset-saving method, not proof the Arkins were already living in the modern Yates farmhouse."
    ],
    "entry": {
      "previous_scene": "CF-S23",
      "checkpoint": "CP-24",
      "requirements": [
        "cheap_land_question_raised"
      ]
    },
    "exit": {
      "next_scene": "END_AVAILABLE_EXCERPT",
      "condition": "Forecast acknowledged and end card shown.",
      "sets_flags": [
        "available_excerpt_complete"
      ],
      "side_effects": "APPLY_ONCE"
    },
    "checks": [
      "No weather damage or historical enemy encounter is invented.",
      "Pam has no modern weapon, police radio, trial HUD or Clarence inventory.",
      "End card distinguishes excerpt completion from full-game completion."
    ],
    "line_ids": [
      "CF-S24-D01",
      "CF-S24-D02",
      "CF-S24-D03"
    ],
    "adapter_key": "historical",
    "cues": [
      "ENTRY",
      "D01",
      "D02",
      "EXIT",
      "line:CF-S24-D01:start",
      "line:CF-S24-D01:complete",
      "line:CF-S24-D02:start",
      "line:CF-S24-D02:complete",
      "line:CF-S24-D03:start",
      "line:CF-S24-D03:complete"
    ],
    "cue_bindings": [
      {
        "source_cue": "ENTRY",
        "bound_cue": "ENTRY",
        "trigger": "On safe entry (after asset/fallback, camera and ownership readiness).",
        "visual": "Same generic room shell, visibly redressed as a tiny store counter/aisle insert: shelves, paper bag, plain groceries, tabletop radio. No farmhouse kitchen label."
      },
      {
        "source_cue": "D01",
        "bound_cue": "D01",
        "trigger": "On canonical line display start.",
        "visual": "Crowd and traffic are outside the frame. A window or light preset suggests cloudier daylight; no active torrential-rain effect."
      },
      {
        "source_cue": "D02",
        "bound_cue": "D02",
        "trigger": "On canonical line display start.",
        "visual": "Weather voice comes from the radio. A large caption presents the forecast if sound is absent."
      },
      {
        "source_cue": "EXIT",
        "bound_cue": "EXIT",
        "trigger": "Explicit adapter event; deterministic trigger specified in binding note and master interaction.",
        "visual": "Hard cut to “END OF AVAILABLE STORY” and “TO BE CONTINUED”. Offer replay/chapter select only; no automatic asylum route."
      }
    ],
    "knowledge_events": [
      {
        "event_id": "line:CF-S24-D01",
        "scene_id": "CF-S24",
        "line_id": "CF-S24-D01",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      },
      {
        "event_id": "line:CF-S24-D02",
        "scene_id": "CF-S24",
        "line_id": "CF-S24-D02",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "heard"
      },
      {
        "event_id": "line:CF-S24-D03",
        "scene_id": "CF-S24",
        "line_id": "CF-S24-D03",
        "kind": "line",
        "recipients": [
          "audience"
        ],
        "presentation": "shown"
      }
    ],
    "knowledge_scope": "Audience all; Pam-local weather speech grants no modern/Dale knowledge by inference; end is supplied excerpt only.",
    "logical_set_id": "HISTORICAL_STORE",
    "physical_view_sets": [
      "HISTORICAL_STORE"
    ],
    "renderer_binding": "v31-view",
    "anchor": "HISTORICAL_STORE_COUNTER",
    "memory_return": "No return_context capture/consume. Explicit staged cutaway returns do not create nested memory.",
    "binding_note": "Pam-labelled store, radio E/Listen or visible Continue. D01 crowd outside frame, D02 forecast, D03 end title. No storm arrival or new attack. END_AVAILABLE_EXCERPT is terminal; no automatic asylum/new stage.",
    "required_asset_keys": [
      "A19",
      "A20",
      "A21"
    ],
    "fallback_trigger": "Optional named asset/model/voice missing, failed or past existing optional-load deadline: select only master fallback below. Core route/player/trial absent: stop, no simulated pass.",
    "fallback": "One close-up counter/window tableau and narrated caption. This is a location insert, not a new supermarket level.",
    "skip_allowed": true,
    "recap_line_ids": [
      "CF-S24-D01",
      "CF-S24-D02",
      "CF-S24-D03"
    ],
    "completion_rule": {
      "kind": "NARRATIVE",
      "required_line_ids": [
        "CF-S24-D01",
        "CF-S24-D02",
        "CF-S24-D03"
      ],
      "required_cues": [
        "ENTRY",
        "D01",
        "D02",
        "EXIT"
      ],
      "minimum_active_seconds": 0,
      "adapter_condition": "Forecast acknowledged and end card shown."
    }
  }
});
