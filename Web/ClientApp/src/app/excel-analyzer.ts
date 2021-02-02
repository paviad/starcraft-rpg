import * as XLSX from 'xlsx';

export class ExcelAnalyzer {
    nodes = [];
    edges = [];

    constructor(private workbook: XLSX.WorkBook) { }

    analyze(): void {
        const wb = this.workbook;
        const sht = wb.Sheets[wb.SheetNames[0]];
        let row;
        const a = (c: number) => this.addr(row, c);
        for (row = 2; sht[a(1)]; row++) {
            const id: string = sht[a(1)].w;
            const v = sht[a(2)] && sht[a(2)].w;

            const nodeLabel = [...id.split('/'), v].filter(r => !!r).join('\n');

            const node = {
                id,
                label: nodeLabel,
            };
            this.nodes.push(node);
            console.log('       node', node);

            for (let col = 3; sht[a(col)]; col += 2) {
                const target = sht[a(col)].w;
                const edgeLabel = sht[a(col + 1)].w;

                const edge = {
                    from: node.id,
                    to: target,
                    label: edgeLabel
                };

                this.edges.push(edge);
                console.log('-------edge', edge);
            }
        }
    }

    private addr(row: number, col: number): string {
        const cols = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return `${cols[col]}${row}`;
    }
}
