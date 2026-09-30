import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {galleryDimensions,galleryArtInfo} from '../ui/model-gallery.mjs';

test('gallery reads authored and licensed ship metadata with dimensions and complete attribution',async()=>{
 const index=JSON.parse(await fs.readFile(new URL('../assets/models/ships/index.json',import.meta.url)));
 for(const entry of index.models.filter(m=>m.file.endsWith('.glb'))){
  const source=JSON.parse(await fs.readFile(new URL('../assets/models/ships/'+entry.file.replace(/\.glb$/,'.source.json'),import.meta.url)));
  const size=galleryDimensions(source);assert(size.length>0&&size.beam>0,entry.id);
  const info=galleryArtInfo(source);
  if(source.author){assert(info.includes(source.author));assert(info.includes(`href="${source.authorUrl}"`));}
  if(source.licenseUrl)assert(info.includes(`href="${source.licenseUrl}"`));
  if(source.modifications)assert(info.includes('Changes:'));
 }
});

test('gallery attribution escapes external metadata and excludes unsafe link schemes',()=>{
 const info=galleryArtInfo({author:'<artist>',authorUrl:'javascript:alert(1)',license:'CC-BY-4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',modifications:'a < b',sources:[{title:'<source>',url:'javascript:alert(2)'}]});
 assert(info.includes('&lt;artist&gt;'));assert(info.includes('a &lt; b'));assert(info.includes('href="https://creativecommons.org/licenses/by/4.0/"'));assert(!info.includes('javascript:'));assert(!info.includes('<artist>'));
});
