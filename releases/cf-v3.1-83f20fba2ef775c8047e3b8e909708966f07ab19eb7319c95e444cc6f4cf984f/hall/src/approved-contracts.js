// Frozen R4 baseline assertions. Development shape validation lives separately.
export function validateApprovedLayout(l,doorNames) {
  if (l?.schema !== 1 || l.units !== 'metres' || JSON.stringify(l.hall?.size) !== '[18,6,14]' || JSON.stringify(l.hall?.center) !== '[0,0,0]') throw new Error('Invalid hall layout');
  if (l.vestibules?.length !== 1 || l.vestibules[0].id !== 'A' || JSON.stringify(l.vestibules[0].size) !== '[6,3.5,6]' || JSON.stringify(l.vestibules[0].center) !== '[-12,0,0]') throw new Error('Invalid original room A');
  const spaces=l.mansion?.spaces, ids=['vestibule','foyer','reception','salon','music','kitchen','scullery','nook','powder-west','hallway','conference','office','open-office','entry','powder-east','closet'];
  if(l.mansion?.id!=='Pillsbury-first-floor-v2'||JSON.stringify(spaces?.map(s=>s.id))!==JSON.stringify(ids)||spaces.some(s=>!s.polygon||s.polygon.length<4||s.polygon.some(p=>p.length!==2||!p.every(Number.isFinite))||s.center[0]<30||s.size.some(v=>!Number.isFinite(v)||v<=0)))throw new Error('Invalid approved first floor');
  if(l.mansion.doors?.length!==18||l.mansion.doors.some(d=>!ids.includes(d.rooms?.[0])||!ids.includes(d.rooms?.[1])||!['x','z'].includes(d.axis)||![d.x,d.z,d.width,d.height].every(Number.isFinite)||d.width<1.2))throw new Error('Invalid interior doors');
  if(JSON.stringify(l.mansion.tokenLocations?.map(p=>p.space))!==JSON.stringify(['kitchen','conference','office'])||l.mansion.tokenLocations.some(p=>![p.x,p.y,p.z].every(Number.isFinite)))throw new Error('Invalid deep token locations');
  const doorContract=[['Brasenhill',[-9,0,0],Math.PI/2,'walk'],['Pillsbury',[-4,0,-7],0,'fold'],['Lebold',[4,0,-7],0,'closed'],['Aldrich',[9,0,-2],-Math.PI/2,'closed'],['Winchester',[9,0,3],-Math.PI/2,'closed']];
  if (JSON.stringify(l.doors?.map(d => d.id)) !== JSON.stringify(doorNames) || l.doors.some((d,i) => d.label !== 'FUTURE WING' || JSON.stringify(d.center)!==JSON.stringify(doorContract[i][1]) || d.yaw!==doorContract[i][2] || d.mode!==doorContract[i][3])) throw new Error('Invalid entrances');
  if (JSON.stringify(l.doorOpening) !== '[1.8,2.8]') throw new Error('Invalid doorway clearance');
  for (const key of ['spawn','foldHallArrival','foldBayArrival','bayReturn']) if (![l[key]?.x,l[key]?.z,l[key]?.yaw].every(Number.isFinite)) throw new Error('Invalid safe transform');
  if (l.player?.radius !== 0.28 || l.player.height !== 1.75 || l.player.eyeHeight !== 1.62 || l.player.speed !== 2.6 || l.player.fastSpeed !== 4 || l.strip?.cycleSeconds !== 12 || l.strip.maxAngleRadians !== 0.065 || ![l.latch?.x,l.latch?.y,l.latch?.z,...l.strip.position].every(Number.isFinite)) throw new Error('Invalid human-scale contract');
  return true;
}

export function validateApprovedRoutes(routes) {
  if (routes?.schema !== 1 || JSON.stringify(routes.areas) !== '["hall","A","B"]' || routes.routes?.length !== 2) throw new Error('Invalid three-area route graph');
  const [a, b] = routes.routes;
  if (a.from !== 'hall' || a.to !== 'A' || a.door !== 'Brasenhill' || a.mode !== 'walk' || a.requiresUnlock || !a.reversible || b.from !== 'hall' || b.to !== 'B' || b.door !== 'Pillsbury' || b.mode !== 'deliberate-E-fold' || !b.requiresUnlock || !b.reversible || JSON.stringify(routes.closed) !== '["Lebold","Aldrich","Winchester"]') throw new Error('Unexpected route');
  return true;
}
