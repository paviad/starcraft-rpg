import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { bufferCount, debounceTime, filter, map } from 'rxjs/operators';

declare var vis: any;
declare var createNewDataPipeFrom: any;

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[visjs]',
  exportAs: 'visjs',
})
export class VisjsDirective implements AfterViewInit, OnChanges {
  @Input() nodes: any[] = [];
  @Input() edges: any[] = [];
  @Input() filter: string = null;

  @Output() dblClickNode = new EventEmitter<any>();

  network: any;

  nodeData: any;
  edgeData: any;
  nodeView: any;
  edgeView: any;
  fltData: any;
  pipe: any;

  update$ = new Subject<void>();
  dblclk$ = new Subject<any>();

  constructor(private el: ElementRef) {
    this.update$.pipe(debounceTime(200)).subscribe(_ => this.createNetworkInternal());

    this.dblclk$.pipe(
      map((r): [number, any] => ([new Date().getTime(), r])),
      // Emit the last `clickCount` timestamps.
      bufferCount(2, 1),
      // `timestamps` is an array the length of `clickCount` containing the last added `timestamps`.
      filter((timestamps) => {
        // `timestamps[0]` contains the timestamp `clickCount` clicks ago.
        // Check if `timestamp[0]` was within the `clickTimespan`.
        return timestamps[0][0] > new Date().getTime() - 250;
      })
    ).subscribe(r => this.dblclick(r[0][1]));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nodes || changes.edges) {
      this.nodeData = new vis.DataSet(this.nodes);
      this.edgeData = new vis.DataSet(this.edges);
      this.fltData = new vis.DataSet();
      this.nodeView = new vis.DataView(this.fltData, { filter: node => this.filterNode(node) });
      this.edgeView = new vis.DataView(this.edgeData, { filter: edge => this.filterEdge(edge) });

      this.pipe = vis.data.createNewDataPipeFrom(this.nodeData)
        .map(node => this.highlightFilter(node))
        .to(this.fltData);
      this.pipe.all();

      this.createNetwork();
    }
    if (changes.filter) {
      this.pipe.all();
      this.nodeView.refresh();
      if (this.network) {
        // this.network.stabilize();
        this.network.fit();
      }
    }
  }

  ngAfterViewInit(): void {
    this.createNetwork();
  }

  escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  getFilterWords(): string[] {
    if (!this.filter) {
      return [];
    }
    const words = this.filter.match(/\S{2,}|\d/ig);
    return words;
  }

  highlightFilter(node): any {
    if (!this.filter || !node.label) {
      return node;
    }
    const rc = { ...node };
    const words = this.getFilterWords();
    words.forEach(word => {
      const esc = this.escapeRegExp(word);
      const rex = new RegExp(`${esc}`, 'i');
      rc.label = rc.label.replace(rex, '<b>$&</b>');
    });
    return rc;
  }

  filterNode(node): boolean {
    if (!this.filter) {
      return true;
    }
    const lbl: string = node.label.toLowerCase();

    const outgoingEdges = this.edges.filter(r => r.from === node.id).map(r => r.to);
    const targetNodes = this.nodes.filter(r => outgoingEdges.includes(r.id)).map(r => r.label.toLowerCase());
    const incomingEdges = this.edges.filter(r => r.to === node.id).map(r => r.from);
    const sourceNodes = this.nodes.filter(r => incomingEdges.includes(r.id)).map(r => r.label.toLowerCase());

    const words = this.getFilterWords().map(r => r.toLowerCase());

    const tsome = w => words.some(word => w.includes(word));
    const tall = w => words.every(word => w.includes(word));

    if (tall(lbl) || targetNodes.some(tall) || sourceNodes.some(tall)) {
      return true;
    }

    return false;
  }

  filterEdge(edge): boolean {
    return true;
  }

  private createNetwork(): void {
    this.update$.next();
  }

  private createNetworkInternal(): void {
    const container = this.el.nativeElement;

    const data = {
      nodes: this.nodeView,
      // nodes: this.fltData,
      edges: this.edgeView,
    };
    const options = {
      edges: {
        arrows: 'to',
        length: 100,
        smooth: { type: 'dynamic' },
      },
      nodes: {
        shape: 'box',
        shadow: true,
        font: {
          size: 14,
          multi: 'html',
          bold: {
            color: 'brown',
          }
        }
      },
      physics: {
        enabled: true,
        barnesHut: {
          theta: 0.5,
          gravitationalConstant: -6000,
          centralGravity: 0.6,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0
        },
        // stabilization: {
        //   updateInterval: 10,
        //   fit: true,
        // }
      }
    };
    this.network = new vis.Network(container, data, options);

    this.network.on('click', params => this.click(params));
    // this.network.on('startStabilizing', params => {
    //   console.log('progress', params);
    //   return this.network.fit();
    // });
  }

  click(params): void {
    this.dblclk$.next(params);
  }

  dblclick(param): void {
    const node = this.nodes.find(x => x.id === param.nodes[0]);
    this.dblClickNode.emit(node);
  }

  test(): void {
    this.nodeData.add(
      { id: 'added', label: 'lalala' },
    );
    this.pipe.all();
  }
}
