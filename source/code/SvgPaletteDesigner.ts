import { Controls } from "./uiHelper";

export class SvgPaletteDesigner {

    protected _svg: string;
    protected _style: HTMLElement;

    protected _fileName: string = 'file.svg';

    protected _colorCount = 5;
    protected _colors: number[][] = [];
    protected _selectedColor = 0;

    protected _applyColorsOnExport = false;

    protected _colorWheel: HTMLElement;

    constructor() {
        this.initColors();
        this.initSvg();
        this.initControls();

        this._style = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(this._style);

        this.generateCss();
    }

    colorToString(color: number[]): string {
        let out = '#';
        for(let i = 0; i < 3; i++) {
            let comp = Math.floor(color[i] * 255).toString(16);
            comp = (comp.length < 2 ? '0' : '') + comp;
            out += comp;
        }
        return out;
    }

    stringToColor(colorString: string): number[] {
        let color = [];
        for (let i = 0; i < 3; i++) {
            const str = colorString.substr(i * 2 + 1, 2);
            color.push(Number.parseInt(str, 16) / 255.0);
        }
        return color;
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
            const color = this.colorToString(this._colors[i]);
            const colorInput = controls.createColorInput(
                'color ' + i + ' - ' + color);
            colorInput.value = color;
            colorInput.addEventListener('input', () => {
                this._colors[i] = this.stringToColor(colorInput.value);
                colorInput.labels[0].innerHTML = 'color ' + i + ' - ' + colorInput.value;
                this.generateCss();
                this.updateColorWheel();
            });
        }

        const applyColorsOnExportInput = controls.createCheckInput(
            'apply colors on export'
        );

        applyColorsOnExportInput.addEventListener('change', () => {
            this._applyColorsOnExport = applyColorsOnExportInput.checked;
        });

        this.createColorWheel(ui);
    }

    initSvg(): void {
        this.loadSvg(require('../svg/example.svg?raw'));
    }

    createColorWheel(ui: HTMLElement): void {
        const container = document.createElement('div');
        const canvas = document.createElement('canvas') as HTMLCanvasElement;

        this._colorWheel = container;

        container.classList.add('colorWheel');
        window.addEventListener('resize', () => {
            this.drawColorWheel(canvas);
            this.updateColorWheel();
        });

        canvas.width = 100;
        canvas.height = 100;

        ui.appendChild(container);
        container.appendChild(canvas);

        for (let i = 0; i < this._colors.length; i++) {
            const circle = document.createElement('div');
            container.appendChild(circle);

            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            circle.style.left = (x - (circle.clientWidth / 2)) + 'px';
            circle.style.top = (y - (circle.clientHeight / 2)) + 'px';
        }

        this.drawColorWheel(canvas);
        this.updateColorWheel();
    }

    updateColorWheel(): void {
        const circles = this._colorWheel.getElementsByTagName('div');
        const canvas = this._colorWheel.getElementsByTagName('canvas')[0];
        for (let i = 0; i < circles.length; i++) {
            const circle = circles[i];
            const color = this._colors[i];
            const {h, s, v} = this.RGBtoHSV(color);

            const width2 = canvas.width * 0.5;
            const angle = h * Math.PI * 2 + Math.PI;
            const distance = s * width2;

            const x = distance * Math.cos(angle) + width2;
            const y = distance * Math.sin(angle) + width2;

            circle.style.left = (x - (circle.clientWidth / 2)) + 'px';
            circle.style.top = (y - (circle.clientHeight / 2)) + 'px';

            circle.style.backgroundColor = this.colorToString(color);
        }
    }

    HSVtoRGB(
        h: number, s: number, v: number
    ): {r: number, g: number, b: number} {
        var r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    RGBtoHSV(rgb: number[]) {
        const r = rgb[0];
        const g = rgb[1];
        const b = rgb[2];
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let d = max - min;
        let h;
        let s = (max === 0 ? 0 : d / max);
        let v = max / 255;
    
        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
        }
    
        return {
            h: h,
            s: s,
            v: v
        };
    }

    getColorWheelPixel(
        x: number,
        y: number,
        r: number,
    ): {r: number, g: number, b: number} {
        const d2 = Math.pow(r - x, 2) + Math.pow(r - y, 2);
        const r2 = Math.pow(r, 2);

        if (r2 < d2) {
            return {r: 255, g: 255, b: 255};
        }

        const h = Math.atan2(y - r, x - r) / (Math.PI * 2) + 0.5;
        const s = d2 / r2;
        return this.HSVtoRGB(h, s, 1);
    }

    drawColorWheel(canvas: HTMLCanvasElement): void {
        const context = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = width;
        canvas.height = height;

        const diameter = width;
        const radius = diameter / 2;

        const r2 = Math.pow(radius, 2);

        context.fillStyle = '#fff';
        context.fillRect(0, 0, width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const {r, g, b} = this.getColorWheelPixel(
                    x, y, radius
                )
                let rString = r.toString(16);
                rString = (rString.length < 2 ? '0' : '') + rString;
                let gString = g.toString(16);
                gString = (gString.length < 2 ? '0' : '') + gString;
                let bString = b.toString(16);
                bString = (bString.length < 2 ? '0' : '') + bString;
                // console.log(rString);
                context.fillStyle = '#' + rString + gString + bString;
                context.fillRect(x, y, 1, 1);
            }
        }

    }

    initColors(): void {
        for (let i = 0; i < this._colorCount; i++) {
            let color: number[] = [];
            for (let ci = 0; ci < 3; ci++) {
                color[ci] = Math.random();
            }
            this._colors.push(color);
        }
    }

    generateCss(): void {
        let css = '';
        for (let i = 0; i < this._colors.length; i++) {
            const color = this.colorToString(this._colors[i]);
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
                        const color = this.colorToString(this._colors[index]);
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