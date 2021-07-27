import { Controls } from "./uiHelper";

export class SvgPaletteDesigner {

    protected _svg: string;
    protected _style: HTMLElement;

    protected _fileName: string = 'file.svg';

    protected _colorCount = 3;
    protected _colors: string[] = [];
    protected _selectedColor = 0;

    protected _applyColorsOnExport = false;

    constructor() {
        this.initColors();
        this.initSvg();
        this.initControls();

        this._style = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(this._style);

        this.generateCss();
    }

    initControls(): void {
        const ui = document.getElementById('ui');
        const controls = new Controls(ui);

        const loadSvgButton = controls.createFileInput(
            'load svg', '.svg', false);
        loadSvgButton.addEventListener('change', () => {
            const file = loadSvgButton.files[0];
            if (!file) return;
            this._fileName = file.name;
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
                this._colors[i] = colorInput.value;
                colorInput.labels[0].innerHTML = 'color ' + i + ' - ' + colorInput.value;
                this.generateCss();
            });
        }

        const applyColorsOnExportInput = controls.createCheckInput(
            'apply colors on export'
        );

        applyColorsOnExportInput.addEventListener('change', () => {
            this._applyColorsOnExport = applyColorsOnExportInput.checked;
        })
    }

    initSvg(): void {
        this.loadSvg(require('../svg/example.svg?raw'));
    }

    createColorWheel(ui: HTMLElement): void {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;

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
        let svgString = svgPreview.innerHTML;

        if (this._applyColorsOnExport) {
            const tmpSvgContainer = document.createElement('div');
            tmpSvgContainer.innerHTML = svgString;
            this.navigateElements(
                tmpSvgContainer.children[0],
                (element: Element) => {
                    const classList = element.classList;
                    if (classList.length <= 0) return;
                    for (const cls of classList) {
                        if (!cls.startsWith('color')) continue;
                        const index = Number.parseInt(cls.substr(5));
                        const color = this._colors[index];
                        element.setAttribute('fill', color);
                        (element as SVGElement).style.fill = color;
                    }
                }
            )

            svgString = tmpSvgContainer.innerHTML;
        }


        // save
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,'
            + encodeURIComponent(svgString));
        element.setAttribute('download', this._fileName);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    navigateElements(element: Element, f: (element: Element) => void): void {
        f(element);
        for (const child of element.children) {
            this.navigateElements(child, f);
        }
    }

    addClickListeners(element: Element): void {
        this.navigateElements(
            element,
            (element: Element) => {
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
            }
        )
    }
}