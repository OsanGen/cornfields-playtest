# Cinematic playtest voices

These are temporary synthetic performances of the CORNFIELDS prologue, generated
offline with Piper. Story by Jacob Nangle; approved fast interactive adaptation with retained, adapted, new, and user-wording
provenance is recorded in `src/prologue-script.js`.

Voice model: **en_US-libritts_r-medium**, distributed by the Rhasspy/Piper project.
[Model and model card](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/libritts_r/medium).
The card identifies the underlying LibriTTS-R dataset and license as **CC BY 4.0**.
[License](https://creativecommons.org/licenses/by/4.0/).

LibriTTS-R: Yuma Koizumi, Heiga Zen, Shigeki Karita, Yifan Ding, Kohei Yatabe,
Nobuyuki Morioka, Michiel Bacchiani, Yu Zhang, Wei Han and Ankur Bapna.
[Dataset and attribution](https://www.openslr.org/141/).
Original corpus recordings derive from LibriSpeech/LibriVox contributors.

Changes: newly generated scripted speech, normalization and mono MP3 compression. The fast interactive cues retain their
natural delivery rate; no tempo acceleration is applied. These fictional performances are synthetic;
the model/dataset contributors do not portray or endorse these characters.
`sources.json` records corpus voice IDs, model checksum and each output checksum.
Model weights, generation software and raw corpus recordings are not distributed
with the game. No live synthesis service or microphone is used.

Historical retained cast selection was informed by the speaker descriptions from LibriTTS-P,
Masaya Kawamura, Ryuichi Yamamoto, Yuma Shirahata, Takuya Hasumi, and Kentaro
Tachibana (Interspeech 2024), [CC BY 4.0](https://github.com/line/LibriTTS-P).
That research data is not included in the public runtime.


## V3.1 recorded speech

All178 canonical spoken entries now have local recordings. Five explicit stage/title entries remain unvoiced. Five bindings retain the earlier recordings: four reference untouched prologue files; CF-S02-D05 concatenates CAR-06 and CAR-07 in that order and re-encodes MP3. The173 remaining spoken entries were generated locally from the exact canonical words with the checksum-verified en_US-libritts_r-medium model and approved Piper2023.11.14-2 software, then encoded as mono MP3 at natural delivery speed. No tempo acceleration or person/reference-audio cloning was used.

New fictional-character voice slots use distinct stock model speakers; unlike the historical selections, their casting was not selected using the LibriTTS-P descriptions. Existing Mike, Clarence, Stanley and dispatch corpus selections are preserved and mapped through the verified model configuration. Recollections retain the corresponding character voice. These are temporary synthetic playtest performances; subjective listening quality remains owner review.

The model card identifies the LibriTTS-R dataset as CC BY4.0. The attribution and modification notices above are retained; this is not a blanket statement that all commercial redistribution rights are cleared. No model weights, model configuration, synthesis executable, training corpus or private generation receipts are included in the runtime. Source-only provenance records exact canonical text, output hashes and stock-speaker mappings. No live synthesis service, external script transmission or microphone is used.

## R4 moving-cruiser opening

Two owner-approved bridge lines (Mike waking Clarence and the dispatcher patching the father through during a small-town fire) replace their R3 performances using the same local model and stock voices. Existing father speech and all other recordings remain unchanged; older R3 files remain retained for rollback. Dispatcher and father use the existing radio-bandpass treatment. No new training, provider, reference-audio cloning or model distribution. Listening and performance quality remain owner review.
