import fs from 'node:fs/promises';
let serial=0;
// Readers (including the running native game) see a complete revision, never a
// partially overwritten GLB. Rename also avoids Windows scanner/open conflicts.
export async function writeStoredAsset(filename,bytes){
  const temporary=filename+'.authoring-'+process.pid+'-'+(++serial)+'.tmp';
  try{
    await fs.writeFile(temporary,bytes);
    for(let attempt=0;;attempt++){
      try{await fs.rename(temporary,filename);break;}
      catch(error){if(attempt>=20||!['EPERM','EACCES','EBUSY','UNKNOWN'].includes(error.code))throw error;await new Promise(resolve=>setTimeout(resolve,100));}
    }
  }finally{await fs.unlink(temporary).catch(error=>{if(error.code!=='ENOENT')throw error;});}
}
