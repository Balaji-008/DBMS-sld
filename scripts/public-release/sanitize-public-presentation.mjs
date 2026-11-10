#!/usr/bin/env node
import {mkdir,mkdtemp,readFile,readdir,rename,rm,writeFile} from 'node:fs/promises';
import {basename,dirname,join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root=resolve(process.argv[2]||process.cwd());
const generator=resolve(root,'deliverables/presentation/generate.js');
const presentation=resolve(root,'deliverables/presentation/amrita-placement-portal-showcase.pptx');
const manifestPath=resolve(root,'PUBLIC-EXPORT-MANIFEST.json');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function replaceOnce(source,before,after,label){const count=source.split(before).length-1;if(count!==1)throw new Error(`Expected exactly one source match for ${label}; found ${count}.`);return source.replace(before,after);}
function decodeXml(text){return text.replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');}
function encodeXml(text){return text.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function descriptionsFor(xml){
 let changes=0;
 const output=xml.replace(/(<p:cNvPr\b[^>]*\bdescr=")(.*?)("[^>]*>)/g,(whole,prefix,encoded,suffix)=>{
  const original=decodeXml(encoded);
  if(!/(?:\/home\/[A-Za-z0-9][A-Za-z0-9._-]{0,63}(?:\/|$)|\/Users\/[A-Za-z0-9][A-Za-z0-9._-]{0,63}(?:\/|$)|[A-Z]:\\Users\\[A-Za-z0-9][A-Za-z0-9._-]{0,63}(?:\\|$))/i.test(original))return whole;
  const asset=basename(original.replace(/\\/g,'/').split(/[?#]/)[0]);
  const descriptions={
   'amrita-logo-trimmed.png':'Amrita Bengaluru campus logo',
   'dashboard-mobile.png':'Synthetic student dashboard screenshot',
   'apply-mobile.png':'Student application workflow screenshot',
  };
  const replacement=descriptions[asset];if(!replacement)throw new Error(`No approved accessible description for embedded image in ${asset||'unknown asset'}.`);
  changes++;return `${prefix}${encodeXml(replacement)}${suffix}`;
 });
 return {xml:output,changes};
}
const tmp=await mkdtemp(join(dirname(presentation),'.pptx-sanitize-'));
let changed=0;
try{
 const files=await readdir(tmp);
 if(files.length)throw new Error('Temporary directory is not empty.');
 const unpack=join(tmp,'unpacked');await mkdir(unpack);
 execFileSync('unzip',['-q',presentation,'-d',unpack],{stdio:'ignore'});
 const slides=await readdir(join(unpack,'ppt','slides'));
 for(const slide of slides.filter(x=>/^slide\d+\.xml$/.test(x))){
  const path=join(unpack,'ppt','slides',slide);const original=await readFile(path,'utf8');const result=descriptionsFor(original);
  if(result.changes){changed+=result.changes;await writeFile(path,result.xml);}
 }
 if(changed!==4)throw new Error(`Expected four path-derived image descriptions; transformed ${changed}.`);
 const staged=join(tmp,'sanitized.pptx');
 execFileSync('zip',['-X','-q','-r',staged,'.'],{cwd:unpack,stdio:'ignore'});
 execFileSync('unzip',['-tq',staged],{stdio:'ignore'});
 await rename(staged,presentation);

 let text=await readFile(generator,'utf8');
 text=replaceOnce(text,'const addPngContain = (slide, file, x, y, w, h) => {','const addPngContain = (slide, file, x, y, w, h, altText) => {','image helper signature');
 text=replaceOnce(text,'slide.addImage({ path: file, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih });','slide.addImage({ path: file, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih, altText });','image helper alt text');
 text=replaceOnce(text,'if (fs.existsSync(logo)) s.addImage({ path: logo, x: 0.72, y: 0.55, w: 2.15, h: 0.48 });','if (fs.existsSync(logo)) s.addImage({ path: logo, x: 0.72, y: 0.55, w: 2.15, h: 0.48, altText: \'Amrita Bengaluru campus logo\' });','title-slide logo description');
 text=replaceOnce(text,'addPngContain(s, capture, 8.20, 1.16, 2.70, 5.08);','addPngContain(s, capture, 8.20, 1.16, 2.70, 5.08, \'Synthetic student dashboard screenshot\');','dashboard screenshot description');
 text=replaceOnce(text,'addPngContain(s, applyCapture, 8.10, 2.18, 2.24, 3.50);','addPngContain(s, applyCapture, 8.10, 2.18, 2.24, 3.50, \'Student application workflow screenshot\');','application screenshot description');
 text=replaceOnce(text,'if (logo) s.addImage({ path: logo, x: 0.72, y: 0.45, w: 1.82, h: 0.40 });','if (logo) s.addImage({ path: logo, x: 0.72, y: 0.45, w: 1.82, h: 0.40, altText: \'Amrita Bengaluru campus logo\' });','closing-slide logo description');
 await writeFile(generator,text);

 const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
 const generatorEntry=manifest.files.find(entry=>entry.path==='deliverables/presentation/generate.js');
 const pptxEntry=manifest.files.find(entry=>entry.path==='deliverables/presentation/amrita-placement-portal-showcase.pptx');
 if(!generatorEntry||!pptxEntry)throw new Error('Public export manifest is missing a presentation source or export entry.');
 const generatorBytes=await readFile(generator);const pptxBytes=await readFile(presentation);
 generatorEntry.exportSha256=digest(generatorBytes);generatorEntry.bytes=generatorBytes.length;
 generatorEntry.postExportTransformations=['Added semantic PptxGenJS altText values so regenerated image descriptions do not embed local paths.'];
 pptxEntry.exportSha256=digest(pptxBytes);pptxEntry.bytes=pptxBytes.length;
 pptxEntry.postExportTransformations=['Replaced four path-derived image descriptions with semantic alt text; slide visuals and visible text are unchanged.'];
 manifest.postExportTransforms??=[];
 manifest.postExportTransforms.push({files:['deliverables/presentation/generate.js','deliverables/presentation/amrita-placement-portal-showcase.pptx'],transformation:'Add portable, semantic image descriptions to the generator and deck.',count:changed,sourceBytesSha256:{generator:generatorEntry.sourceSha256,pptx:pptxEntry.sourceSha256},exportBytesSha256:{generator:generatorEntry.exportSha256,pptx:pptxEntry.exportSha256},visibleSlideChange:false});
 await writeFile(manifestPath,`${JSON.stringify(manifest,null,2)}\n`);
 console.log(JSON.stringify({presentationImagesSanitized:changed,visibleSlideChange:false,updatedFiles:['deliverables/presentation/generate.js','deliverables/presentation/amrita-placement-portal-showcase.pptx','PUBLIC-EXPORT-MANIFEST.json']},null,2));
}finally{await rm(tmp,{recursive:true,force:true});}
