document.querySelectorAll<HTMLElement>("[data-client-carousel]").forEach(root => {
  const viewport=root.querySelector<HTMLElement>("[data-client-window]")!;
  const track=root.querySelector<HTMLElement>("[data-client-track]")!;
  const originals=[...track.children]; const count=originals.length;
  const controls=root.querySelector<HTMLElement>(".client-controls")!;
  const play=root.querySelector<HTMLButtonElement>("[data-client-play]")!;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  let index=count, paused=reduced.matches, visible=false, hovered=false, moving=false;
  const clone=(item:Element)=>{ const copy=item.cloneNode(true) as HTMLElement;copy.setAttribute("aria-hidden","true");return copy; };
  track.prepend(...originals.map(clone));track.append(...originals.map(clone));
  viewport.hidden=false;root.querySelector<HTMLDetailsElement>(".client-all")!.open=false;
  const perView=()=>window.innerWidth>=960?6:window.innerWidth>=640?4:2;
  const render=(animate=false)=>{
    track.style.transition=animate&&!reduced.matches?"transform 280ms ease":"none";
    track.style.transform=`translateX(-${index*(viewport.clientWidth/perView())}px)`;
    play.textContent=paused?"Play rotation":"Pause rotation";
    controls.hidden=count<=perView();
  };
  const move=(delta:number,manual=false)=>{
    if(moving||count<=perView())return;
    if(manual)paused=true;
    moving=true;index+=delta;render(true);
    window.setTimeout(()=>{if(index>=count*2)index-=count;if(index<count)index+=count;moving=false;render();},reduced.matches?0:290);
  };
  root.querySelector("[data-client-prev]")!.addEventListener("click",()=>move(-1,true));
  root.querySelector("[data-client-next]")!.addEventListener("click",()=>move(1,true));
  play.addEventListener("click",()=>{paused=!paused;render();});
  // The rotation button controls its own state; focusing it must not invert the ensuing click.
  root.addEventListener("focusin",event=>{if(event.target!==play){paused=true;render();}});
  root.addEventListener("mouseenter",()=>hovered=true);root.addEventListener("mouseleave",()=>hovered=false);
  let start:number|null=null;
  viewport.addEventListener("pointerdown",e=>start=e.clientX);
  viewport.addEventListener("pointerup",e=>{if(start!==null&&Math.abs(e.clientX-start)>40)move(e.clientX<start?1:-1,true);start=null;});
  viewport.addEventListener("pointercancel",()=>start=null);
  new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(root);
  new ResizeObserver(()=>render()).observe(viewport);
  reduced.addEventListener("change",()=>{paused=true;render();});
  const timer=window.setInterval(()=>{if(!paused&&!hovered&&visible&&!document.hidden)move(1);},5000);
  window.addEventListener("pagehide",()=>clearInterval(timer),{once:true});
  render();
});
