const panels=['examples','recipe','code','question'];
function selectPanel(id,update=true){if(!panels.includes(id))id='examples';for(const key of panels){document.getElementById(key).hidden=key!==id;const tab=document.querySelector('[data-panel="'+key+'"]');tab.setAttribute('aria-selected',String(key===id));tab.tabIndex=key===id?0:-1;}if(update)history.replaceState(null,'','#'+id);}
for(const b of document.querySelectorAll('[data-panel]')){b.addEventListener('click',()=>selectPanel(b.dataset.panel));b.addEventListener('keydown',ev=>{const index=panels.indexOf(b.dataset.panel);const next=ev.key==='ArrowRight'?(index+1)%4:ev.key==='ArrowLeft'?(index+3)%4:ev.key==='Home'?0:ev.key==='End'?3:-1;if(next>=0){ev.preventDefault();selectPanel(panels[next]);document.querySelector('[data-panel="'+panels[next]+'"]').focus();}});}
addEventListener('hashchange',()=>selectPanel(location.hash.slice(1),false));selectPanel(location.hash.slice(1),false);
const file='https://www.figma.com/design/yVOJvM7lnhT1wCY3FHrD0C/?node-id=';
const examples={focus:{name:'In Focus',design:'15871-100788',loading:'16136-95520',title:'Карточка с объяснением и торговыми действиями',copy:'Сохраняем строку инструмента, область тизера и две нижние кнопки. Меняем только их содержимое. Скелетон не раскрывается и не запускает торговлю.'},trending:{name:'Trending',design:'16417-70533',loading:'16417-70558',title:'Компактная строка инструмента',copy:'Сохраняем три колонки и место под дополнительный сигнал. Не переносим сюда высокую карточку Hot: заглушка должна повторять плотность самого списка.'},hot:{name:'Hot',design:'16425-72713',loading:'16425-72738',title:'Карточка с графиком и событиями',copy:'Оставляем места для котировки, второй строки, графика и нижних бейджей. В этом примере — 12 px внутри карточки и 4 px между первыми строками. Высота остаётся 134 px.'}};
function show(kind){const e=examples[kind];for(const b of document.querySelectorAll('[data-kind]'))b.setAttribute('aria-selected',String(b.dataset.kind===kind));for(const [id,suffix] of [['design',''],['loading','-loading']]){const img=document.getElementById(id);img.src=`assets/${kind}${suffix}.png`;img.alt=`${e.name}: ${id==='design'?'дизайн':'скелетон'}`;}document.getElementById('source-design').href=file+e.design;document.getElementById('source-loading').href=file+e.loading;document.getElementById('example-title').textContent=e.title;document.getElementById('example-copy').textContent=e.copy;}
for(const b of document.querySelectorAll('[data-kind]'))b.addEventListener('click',()=>show(b.dataset.kind));show('focus');
const tsx=`// Пример для In Focus. Подключите компоненты своего проекта.
function FocusCard({ instrument, loading }) {
  return (
    <InstrumentCardLayout
      kind="focus"
      name={loading ? <Skeleton width="65px" /> : instrument.name}
      price={loading ? <Skeleton width="65px" /> : instrument.price}
      change={loading ? <Skeleton width="65px" /> : instrument.change}
      details={loading ? <Skeleton /> : <Details data={instrument} />}
      actions={loading ? <ActionPlaceholders /> : <TradeActions data={instrument} />}
    />
  );
}

function FocusList({ loading, items, visibleRowCount }) {
  // visibleRowCount задаёт контейнер по высоте списка и карточек.
  return (
    <section aria-busy={loading} aria-label="In Focus">
      <p className="sr-only" role="status">{loading ? 'Loading instruments' : ''}</p>
      {loading ? (
        <div aria-hidden="true" inert>
          {Array.from({ length: visibleRowCount }, (_, index) =>
            <FocusCard key={index} loading />
          )}
        </div>
      ) : (
        items.map(instrument => <FocusCard key={instrument.id} instrument={instrument} />)
      )}
    </section>
  );
}

function Skeleton({ width = '100%' }) {
  return <span className="skeleton" style={{ width }} aria-hidden="true" />;
}`;
const css=`/* Используйте реальные алиасы DSL из вашего проекта. */
.skeleton {
  display: block;
  height: var(--text-placeholder-height);
  max-width: 100%;
  border-radius: var(--radius-small);
  background: var(--surface-skeleton);
  pointer-events: none;
}

/* Геометрия живёт в общем layout, а не только в loading-ветке. */
.instrument-card { padding: var(--card-inset); }
.instrument-quote { display: grid; grid-template-columns: minmax(0, 1fr) var(--price-column) var(--change-column); }
.instrument-details { min-height: var(--details-slot-height); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0;
  margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }

/* Только если в продукте нужна пульсация. Статичные блоки тоже допустимы. */
@media (prefers-reduced-motion: no-preference) {
  .skeleton[data-animate] { animation: skeleton-pulse 1.6s ease-in-out infinite; }
}
@keyframes skeleton-pulse { 50% { opacity: .55; } }`;
for(const [id,value] of [['tsx',tsx],['css',css]])document.getElementById(id).textContent=value;
for(const b of document.querySelectorAll('[data-copy]'))b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.getElementById(b.dataset.copy).textContent);b.textContent='Скопировано';}catch{b.textContent='Выделите код вручную';}setTimeout(()=>b.textContent='Копировать',2500);});
