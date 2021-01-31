import { AfterViewInit, Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
  network: any;

  nodeData: any;
  edgeData: any;
  nodeView: any;
  edgeView: any;
  fltData: any;
  pipe: any;

  update$ = new Subject<void>();

  constructor(private el: ElementRef) {
    this.update$.pipe(debounceTime(200)).subscribe(_ => this.createNetworkInternal());
    console.log(vis);
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
      console.log('flt', this.filter, this.fltData);
      this.nodeView.refresh();
      // console.log(this.pipe);
      // this.pipe.start();
      // this.fltData.refresh();
    }
  }

  ngAfterViewInit(): void {
    this.createNetwork();
  }

  escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  highlightFilter(node): any {
    if (!this.filter) {
      return node;
    }
    const rc = { ...node };
    const esc = this.escapeRegExp(this.filter);
    const rex = new RegExp(`(${esc})`, 'i');
    if (node.label) {
      rc.label = node.label.replace(rex, '<b>$1</b>');
    }
    return rc;
  }

  filterNode(node): boolean {
    if (!this.filter) {
      return true;
    }
    const flt = this.filter.toLowerCase();
    const lbl: string = node.label.toLowerCase();

    // console.log(node);

    const outgoingEdges = this.edges.filter(r => r.from === node.id).map(r => r.to);
    const targetNodes = this.nodes.filter(r => outgoingEdges.includes(r.id)).map(r => r.label.toLowerCase());
    const incomingEdges = this.edges.filter(r => r.to === node.id).map(r => r.from);
    const sourceNodes = this.nodes.filter(r => incomingEdges.includes(r.id)).map(r => r.label.toLowerCase());

    if (lbl.includes(flt) || targetNodes.some(r => r.includes(flt)) || sourceNodes.some(r => r.includes(flt))) {
      return true;
    }

    // console.log('omitting', node);
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

    // if (!container) {
    // return;
    // }

    const data = {
      nodes: this.nodeView,
      // nodes: this.fltData,
      edges: this.edgeView,
    };
    const options = {
      edges: {
        arrows: 'to',
        length: 200,
      },
      nodes: {
        font: {
          multi: 'html',
          bold: {
            color: 'yellow',
          }
        }
      }
    };
    this.network = new vis.Network(container, data, options);

    this.network.on('click', params => this.click(params));
  }

  click(params): void {
    console.log('click', params);
  }

  test(): void {
    this.nodeData.add(
      { id: 'added', label: 'lalala' },
    );
  }
}
