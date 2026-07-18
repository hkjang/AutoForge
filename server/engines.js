const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function estimateVehicle(p={}){
  const length=Number(p.length||3990),wheelbase=Number(p.wheelbase||2630),height=Number(p.height||1570),wheel=Number(p.wheel||19),capacity=Number(p.capacity||78.4);
  const cd=Number(clamp(.231+(height-1570)*.000035+(wheel-19)*.0015,.205,.36).toFixed(3));
  const weight=Math.round(1628+(length-3990)*.11+(wheelbase-2630)*.08+(capacity-78.4)*6+(wheel-19)*9);
  const range=Math.round(capacity*5.33-(cd-.231)*680-(weight-1628)*.035);
  const cost=Number((28.6+(capacity-78.4)*.085+(wheel-19)*.12).toFixed(2));
  const score=Math.round(clamp(90+(range-400)*.1-(cost-28)*1.6-(cd-.23)*100,0,100));
  return {range,cost,cd,weight,score};
}
export function simulationResult(type,metrics){
  const results={aero:{cd:metrics.cd,dragArea:Number((metrics.cd*2.26).toFixed(3)),confidence:.91},thermal:{peakCellTemp:37.8,deltaTemp:6.2,confidence:.87},structure:{stiffness:28740,firstMode:31.6,confidence:.94},range:{wltp:metrics.range,consumption:Number((78.4/metrics.range*100).toFixed(1)),confidence:.89}};
  return results[type]||{status:'estimated',confidence:.8};
}
