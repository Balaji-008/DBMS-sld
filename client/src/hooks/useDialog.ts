import {useEffect,useRef} from 'react';

/** Adds Escape handling, focus entry, tab containment, and focus restoration to a mounted dialog. */
export function useDialog<T extends HTMLElement>(open:boolean,onClose:()=>void){
 const dialogRef=useRef<T>(null);
 const onCloseRef=useRef(onClose);
 onCloseRef.current=onClose;
 useEffect(()=>{
  if(!open)return;
  const dialog=dialogRef.current;
  if(!dialog)return;
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const focusable=()=>Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(el=>el.getAttribute('aria-hidden')!=='true'&&el.getAttribute('tabindex')!=='-1'&&!el.closest('[inert],[aria-hidden="true"]')&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden');
  const first=dialog.querySelector<HTMLElement>('[autofocus]:not([disabled])')||dialog.querySelector<HTMLElement>('input:not([disabled]),select:not([disabled]),textarea:not([disabled])')||focusable()[0];
  (first||dialog).focus();
  const keydown=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onCloseRef.current();return}
   if(event.key!=='Tab')return;
   const elements=focusable();
   if(!elements.length){event.preventDefault();dialog.focus();return}
   const firstElement=elements[0],lastElement=elements[elements.length-1],active=document.activeElement;
   if(!dialog.contains(active)||event.shiftKey&&active===firstElement){event.preventDefault();(event.shiftKey?lastElement:firstElement).focus()}
   else if(!event.shiftKey&&active===lastElement){event.preventDefault();firstElement.focus()}
  };
  document.addEventListener('keydown',keydown,true);
  return()=>{document.removeEventListener('keydown',keydown,true);if(previous?.isConnected&&previous.getClientRects().length>0&&getComputedStyle(previous).visibility!=='hidden')previous.focus();else document.querySelector<HTMLElement>('.page-content')?.focus()};
 },[open]);
 return dialogRef;
}
