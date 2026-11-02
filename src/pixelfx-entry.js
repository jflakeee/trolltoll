// Browser adapter for PixelFX. Built into vendor/pixelfx.js by npm run build.
import {createFrame,clearFrame,createFx,composite} from 'pixelfx';
import * as collectBurst from 'pixelfx/fx/pickups/collect-burst';
import * as bluntHit from 'pixelfx/fx/impacts/blunt-hit';
const effects={collect:collectBurst,hit:bluntHit};
window.PixelFX={createFrame,clearFrame,createFx,composite,effects};
