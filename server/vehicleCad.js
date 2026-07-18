const clamp=(value,min,max,fallback)=>Math.min(max,Math.max(min,Number.isFinite(Number(value))?Number(value):fallback));
export function normalizeVehicleParameters(input={}){const length=clamp(input.length,3000,6000,3990),wheelbase=clamp(input.wheelbase,1800,length-600,2630),height=clamp(input.height,1100,2500,1570),width=clamp(input.width,1400,2600,1820),wheel=clamp(input.wheel,14,26,19),groundClearance=clamp(input.groundClearance,100,350,165);return{length,wheelbase,height,width,wheel,groundClearance}}

export function createOpenScad(parameters){const p=normalizeVehicleParameters(parameters),wheelDiameter=p.wheel*25.4,tireWidth=Math.max(180,p.width*.12),axleOffset=(p.length-p.wheelbase)/2;return`// AutoForge parametric vehicle · millimetres
$fn = 48;
length=${p.length}; width=${p.width}; height=${p.height}; wheelbase=${p.wheelbase};
wheel_d=${wheelDiameter.toFixed(1)}; tire_w=${tireWidth.toFixed(1)}; ground=${p.groundClearance};
module body_shell(){
  hull(){
    translate([length*.18,0,ground+height*.25]) scale([length*.18,width*.48,height*.20]) sphere(1);
    translate([length*.50,0,ground+height*.43]) scale([length*.32,width*.50,height*.34]) sphere(1);
    translate([length*.82,0,ground+height*.29]) scale([length*.17,width*.47,height*.22]) sphere(1);
  }
}
module cabin(){hull(){translate([length*.36,0,ground+height*.60]) scale([length*.12,width*.40,height*.22]) sphere(1);translate([length*.64,0,ground+height*.60]) scale([length*.15,width*.39,height*.24]) sphere(1);}}
module wheel(x,y){translate([x,y,ground+wheel_d/2]) rotate([90,0,0]) difference(){cylinder(d=wheel_d,h=tire_w,center=true);cylinder(d=wheel_d*.53,h=tire_w+2,center=true);}}
difference(){union(){body_shell();cabin();}translate([axleOffset,-width,ground+wheel_d/2]) rotate([90,0,0]) cylinder(d=wheel_d*1.12,h=width*2);translate([axleOffset+wheelbase,-width,ground+wheel_d/2]) rotate([90,0,0]) cylinder(d=wheel_d*1.12,h=width*2);}
for(x=[axleOffset,axleOffset+wheelbase]) for(y=[-width*.49,width*.49]) wheel(x,y);
`}

export function createObj(parameters){const p=normalizeVehicleParameters(parameters),rings=9,segments=12,vertices=[],faces=[];for(let r=0;r<rings;r++){const t=r/(rings-1),x=(t-.5)*p.length,profile=Math.sin(Math.PI*t),halfW=p.width*(.34+.16*profile),base=p.groundClearance+p.height*(.18+.05*Math.sin(Math.PI*t)),halfH=p.height*(.12+.28*profile);for(let s=0;s<segments;s++){const angle=2*Math.PI*s/segments,y=Math.cos(angle)*halfW,z=Math.max(p.groundClearance*.55,base+Math.sin(angle)*halfH);vertices.push([x,y,z])}}for(let r=0;r<rings-1;r++)for(let s=0;s<segments;s++){const a=r*segments+s+1,b=r*segments+(s+1)%segments+1,c=(r+1)*segments+(s+1)%segments+1,d=(r+1)*segments+s+1;faces.push([a,b,c],[a,c,d])}const front=vertices.length+1,rear=vertices.length+2;vertices.push([-p.length/2,0,p.groundClearance+p.height*.2],[p.length/2,0,p.groundClearance+p.height*.2]);for(let s=0;s<segments;s++){faces.push([front,s+1,(s+1)%segments+1]);const a=(rings-1)*segments+s+1,b=(rings-1)*segments+(s+1)%segments+1;faces.push([rear,b,a])}return[`# AutoForge vehicle mesh`, `# length=${p.length} width=${p.width} height=${p.height} wheelbase=${p.wheelbase}`,...vertices.map(v=>`v ${v.map(n=>n.toFixed(3)).join(' ')}`),...faces.map(f=>`f ${f.join(' ')}`),''].join('\n')}

export function meshMetrics(obj){const vertices=(obj.match(/^v /gm)||[]).length,triangles=(obj.match(/^f /gm)||[]).length;return{vertices,triangles,watertight:vertices>0&&triangles>0}}
