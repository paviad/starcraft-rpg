import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { VisjsDirective } from '../visjs.directive';
import * as XLSX from 'xlsx';
import { ExcelAnalyzer } from '../excel-analyzer';

declare var vis: any;

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {
  @ViewChild('v') v: VisjsDirective;
  @ViewChild('flt') filterText: ElementRef;

  flt$ = new Subject<string>();
  filter: string = null;

  nodes = [
    // { id: 'accuracy', label: 'Unarmed\nAccuracy\n24', title: 'sfasfsadf' },
    // { id: 'talent/mountain strike i', label: 'Talent\nMountain Strike I' },
    // { id: 'weapon/unarmed/number of attacks', label: '# of Attacks\n4' },
    // { id: 'talent/swift strike', label: 'Talent\nSwift Strike' },
    // { id: 'skill/melee', label: 'Skill\nMelee\n6' },

    // { id: 'weapon/unarmed/damage', label: 'Unarmed\nDamage\nBase: 15\n27' },
    // { id: 'talent/military unarmed training ii', label: 'Talent\nMilitary Unarmed Training II' },
    // { id: 'ability/strength', label: 'Ability\nStrength\n8' },
    // { id: 'specialization/soldier', label: 'Specialization\nSoldier' },
    // { id: 'talent/weapon mastery i', label: 'Talent\nWeapon Mastery I' },

    // { id: 'race/terran', label: 'Race\nTerran' },
    // { id: 'background/fringe colonist', label: 'Background\nFringe Colonist' },
    // { id: 'armor/cmc-300 powered combat armor', label: 'Armor\nCMC-300', color: 'rgb(0,155,0)' },

    // { id: 'ability/instinct', label: 'Ability\nInstinct\n3' },
  ];

  edges = [
    // { from: 'talent/mountain strike i', to: 'accuracy', label: '+2' },
    // { from: 'weapon/unarmed/number of attacks', to: 'accuracy', label: '+12' },
    // { from: 'talent/swift strike', to: 'accuracy', label: '+4' },
    // { from: 'skill/melee', to: 'accuracy', label: '+6' },

    // { from: 'talent/military unarmed training ii', to: 'weapon/unarmed/damage', label: '+2' },
    // { from: 'ability/strength', to: 'weapon/unarmed/damage', label: '+4' },
    // { from: 'specialization/soldier', to: 'weapon/unarmed/damage', label: '+3' },
    // { from: 'talent/weapon mastery i', to: 'weapon/unarmed/damage', label: '+3' },

    // { from: 'race/terran', to: 'ability/strength', label: '+2' },
    // { from: 'background/fringe colonist', to: 'ability/strength', label: '+1' },
    // { from: 'armor/cmc-300 powered combat armor', to: 'ability/strength', label: '+5' },

    // { from: 'race/terran', to: 'ability/instinct', label: '+2' },
    // { from: 'specialization/soldier', to: 'ability/instinct', label: '+1' },
  ];

  constructor() { }

  ngOnInit(): void {
    this.flt$.pipe(debounceTime(150)).subscribe(r => this.filter = r);
  }

  test(): void {
    this.v.test();
  }

  setFilter(flt: string): void {
    this.flt$.next(flt);
  }

  filterByNode(n): void {
    const txt = n.label.replace(/\s+/g, ' ');
    this.filter = txt;
    this.filterText.nativeElement.value = txt;
  }

  drop(e: DragEvent): void {
    console.log('drop', e);

    const files = Array.from(e.dataTransfer.files);

    for (const f of files) {
      console.log('file', f);
      const reader = new FileReader();
      reader.onload = ez => {
        const data = new Uint8Array(ez.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const analyzer = new ExcelAnalyzer(workbook);
        console.log('workbook', workbook);
        analyzer.analyze();
        this.nodes = analyzer.nodes;
        this.edges = analyzer.edges;
      };
      reader.readAsArrayBuffer(f);
    }

    e.preventDefault();
  }

  dragEnter(e): void {
    e.preventDefault();
  }

  dragOver(e): void {
    e.preventDefault();
  }
}
