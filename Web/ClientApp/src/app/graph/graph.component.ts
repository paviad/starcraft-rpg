import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { VisjsDirective } from '../visjs.directive';

declare var vis: any;

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {
  @ViewChild('v') v: VisjsDirective;

  flt$ = new Subject<string>();
  filter: string = null;

  character: {
    mountainStrike: {
      name: 'Talent: Mountain Strike I',
      accuracy: 2,
    },
    unarmed: {
      accuracy: {
      },
      numberOfAttacks: {
        accuracy: 12,
      },
    },
  };

  nodes = [
    { id: 'accuracy', label: 'Accuracy\n24' },
    { id: 'talent/mountain strike i', label: 'Talent\nMountain Strike I' },
    { id: 'weapon/unarmed/number of attacks', label: '# of Attacks\n4' },
    { id: 'talent/swift strike', label: 'Talent\nSwift Strike' },
    { id: 'skill/melee', label: 'Skill\nMelee\n6' },

    { id: 'weapon/unarmed/damage', label: 'Damage\nBase: 15\n27' },
    { id: 'talent/military unarmed training ii', label: 'Talent\nMilitary Unarmed Training II' },
    { id: 'ability/strength', label: 'Ability\nStrength\n8' },
    { id: 'specialization/soldier', label: 'Specialization\nSoldier' },
    { id: 'talent/weapon mastery i', label: 'Talent\nWeapon Mastery I' },

    { id: 'race/terran', label: 'Race\nTerran' },
    { id: 'background/fringe colonist', label: 'Background\nFringe Colonist' },
    { id: 'armor/cmc-300 powered combat armor', label: 'Armor\nCMC-300', color: 'rgb(0,155,0)' },

    { id: 'ability/instinct', label: 'Ability\nInstinct\n3' },

    // { id: 1, label: 'something\n3' },
    // { id: 2, label: 'something\n4' },
    // { id: 3, label: 'X\n12' },
  ];

  // nodes = new vis.DataSet(this.nodeData);

  edges = [
    { from: 'talent/mountain strike i', to: 'accuracy', label: '+2' },
    { from: 'weapon/unarmed/number of attacks', to: 'accuracy', label: '+12' },
    { from: 'talent/swift strike', to: 'accuracy', label: '+4' },
    { from: 'skill/melee', to: 'accuracy', label: '+6' },

    { from: 'talent/military unarmed training ii', to: 'weapon/unarmed/damage', label: '+2' },
    { from: 'ability/strength', to: 'weapon/unarmed/damage', label: '+4' },
    { from: 'specialization/soldier', to: 'weapon/unarmed/damage', label: '+3' },
    { from: 'talent/weapon mastery i', to: 'weapon/unarmed/damage', label: '+3' },

    { from: 'race/terran', to: 'ability/strength', label: '+2' },
    { from: 'background/fringe colonist', to: 'ability/strength', label: '+1' },
    { from: 'armor/cmc-300 powered combat armor', to: 'ability/strength', label: '+5' },

    { from: 'race/terran', to: 'ability/instinct', label: '+2' },
    { from: 'specialization/soldier', to: 'ability/instinct', label: '+1' },

    { from: 1, to: 3, label: '3' },
    { from: 2, to: 3, label: '4' },
  ];

  // edges = new vis.DataSet(this.edgeData);

  constructor() { }

  ngOnInit(): void {
    this.flt$.pipe(debounceTime(200)).subscribe(r => this.filter = r);
  }

  test(): void {
    this.v.test();
  }

  setFilter(flt: string): void {
    this.flt$.next(flt);
  }
}
