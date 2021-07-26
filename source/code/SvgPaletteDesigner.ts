import { Controls } from "./uiHelper";

export class SvgPaletteDesigner {

    protected _svg: string;
    protected _style: HTMLElement;

    protected _colorCount = 3;
    protected _colors: string[] = [];
    protected _selectedColor = 0;

    constructor() {
        this.initColors();
        this.initSvg();

        
        const ui = document.getElementById('ui');
        const controls = new Controls(ui);

        const loadSvgButton = controls.createFileInput(
            'load svg', '.svg', false);
        loadSvgButton.addEventListener('change', () => {
            const file = loadSvgButton.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                this.loadSvg(result);
            }
            reader.readAsText(file);
        });
        loadSvgButton.addEventListener('click', () => {
            loadSvgButton.value = '';
        });

        const saveButton = controls.createActionButton('save svg');
        saveButton.addEventListener('click', () => {
            this.exportSvg();
        });

        const selectedColorInput = controls.createSelectListInput(
            'selected color',
            this._colors.map((e, i)=>'color ' + i.toString())
        );
        selectedColorInput.selectedIndex = this._selectedColor;
        selectedColorInput.addEventListener('change', () => {
            this._selectedColor = selectedColorInput.selectedIndex;
        })


        for (let i = 0; i < this._colors.length; i++) {
            const color = this._colors[i];
            const colorInput = controls.createColorInput(
                'color ' + i + ' - ' + color);
            colorInput.value = color;
            colorInput.addEventListener('input', () => {
                // console.log(colorInput.value);
                this._colors[i] = colorInput.value;
                colorInput.labels[0].innerHTML = 'color ' + i + ' - ' + colorInput.value;
                this.generateCss();
            });
        }

        this._style = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(this._style);

        this.generateCss();
    }

    initSvg(): void {
        this.loadSvg(require('../svg/example.svg?raw'));
    }

    initColors(): void {
        for (let i = 0; i < this._colorCount; i++) {
            let color = '#';
            for (let ci = 0; ci < 3; ci++) {
                let comp = Math.floor((Math.random() * 256)).toString(16);
                comp += comp.length < 2 ? '0' : '';
                color += comp;
            }
            this._colors.push(color);
        }
    }

    generateCss(): void {
        let css = '';
        for (let i = 0; i < this._colors.length; i++) {
            const color = this._colors[i];
            css += `.color${i}{fill: ${color} !important} `;
        }

        // console.log(css);
        this._style.innerHTML = css;
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

    exportSvg(): void {
        const svgPreview = document.getElementById('svgPreview');
        const svgString = svgPreview.innerHTML;
        console.log(svgString);

        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,'
            + encodeURIComponent(svgString));
        element.setAttribute('download', 'file.svg');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    addClickListeners(element: Element): void {
        if (element.children.length == 0) {
            element.addEventListener('click', (event) => {
                for (let i = 0; i < this._colors.length; i++) {
                    const colorName = 'color' + i;
                    const color = this._colors[i];
                    if (i == this._selectedColor) {
                        element.classList.add(colorName);
                    } else {
                        element.classList.remove(colorName);
                    }

                }
            });
            return;
        }

        for (const child of element.children) {
            this.addClickListeners(child);
        }
    }
}