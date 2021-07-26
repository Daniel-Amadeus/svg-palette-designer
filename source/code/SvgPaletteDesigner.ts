
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

        const style = document.createElement('style');
        style.innerHTML = '.magenta{fill: #ff00ff !important}';
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    loadSvg(svg: string): void {
        this._svg = svg;

        const svgPreview = document.getElementById('svgPreview');
        svgPreview.innerHTML = svg;

        const svgElement = svgPreview.children[0] as SVGElement;
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';

        this.addClickListeners(svgElement);
    }

    addClickListeners(element: Element): void {
        if (element.children.length == 0) {
            element.addEventListener('click', (event) => {
                console.log(element);
                element.classList.add('magenta');
            });
            return;
        }

        for (const child of element.children) {
            this.addClickListeners(child);
        }
    }
}