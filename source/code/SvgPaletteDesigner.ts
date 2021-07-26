
export class SvgPaletteDesigner {

    protected _svg: string;

    constructor() {
        // const fileReader = new FileReader();

        // fileReader.onload = () => {
        //     console.log('load');
        //     console.log(fileReader.result);
        // }

        // fileReader.readAsText(this._svg);

        console.log(this._svg);

        this.loadSvg(require('../svg/example.svg?raw'));
    }

    loadSvg(svg: string): void {
        this._svg = svg;

        const svgPreview = document.getElementById('svgPreview');
        svgPreview.innerHTML = svg;

        const svgElement = svgPreview.children[0] as HTMLElement;
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';

    }
}