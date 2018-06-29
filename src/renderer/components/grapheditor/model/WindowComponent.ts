import { EventEmitter } from "events";

export type WindowComponentCoords = {
    x: number;
    y: number;
    z?: number;
}

export default class WindowComponent extends EventEmitter {

    static windowMap: Map<string, WindowComponent> = new Map<string, WindowComponent>();
    static nextZIndex: number = 200;

    private _id: string;
    private _opened: boolean;
    private _x: number;
    private _y: number;
    private _z: number;


    constructor(id: string, x: number = 0, y: number = 0, z: number = 0) {
        super();
        this._id = id;
        this._opened = false;
        this._x = x;
        this._y = y;
        this._z = z;

    }

    open(): void {
        this._opened = true;
    }

    close(): void {
        this.saveStyle();
        this._opened = false;
    }

    get opened(): boolean {
        return this._opened;
    }

    toggleOpened(): boolean {
        if (this._opened) {
            this.close()
        } else {
            this.open();
        }
        return this._opened
    }

    get id(): string {
        return this._id;
    }

    get x(): number {
        let element: any = document.getElementById(this._id)
        if (element && element.style) {
             this._x = element.getBoundingClientRect().left;
        }
        return this._x;
    }

    get y(): number {
        let element: any = document.getElementById(this._id)
        if (element && element.style) {
             this._y = element.getBoundingClientRect().top;
        }
        return this._y;
    }

    get z(): number {
        return this._z;
    }

    set z(z: number) {
        this._z = z;

        let element: any = document.getElementById(this._id)
        if (element && element.style) {
            element.style.zIndex = `${this._z}`; //`${this._z}`;
        }
    }

    saveStyle(): void {
        let element: any = document.getElementById(this._id)
        if (element && element.style) {
            this._x = element.getBoundingClientRect().left;
            this._y = element.getBoundingClientRect().top;
            this._z = Number(window.getComputedStyle(element).zIndex);
        }
    }

    restoreStyle(): void {
        let element: any = document.getElementById(this._id)
        if (element && element.style) {
            element.style.left = `${this._x}px`;
            element.style.top = `${this._y}px`;
            element.style.zIndex = `${this._z}`;
        }

    }

    static init(): void {

    }

    static getWindowComponentWithId(id: string): WindowComponent | undefined {
        let selectedWindow: WindowComponent | undefined = WindowComponent.windowMap.get(id);
        return selectedWindow;
    }

    static swapZIndex(window1: WindowComponent, window2: WindowComponent): void {
        let tempZIndex: number = window1.z;
        window1.z = window2.z;
        window2.z = tempZIndex;
    }

    static openWithId(id: string): void {
        let selectedWindow: WindowComponent | undefined = WindowComponent.getWindowComponentWithId(id);
        if (selectedWindow) {
            selectedWindow.open();
        }
    }

    static closeWithId(id: string): void {
        let selectedWindow: WindowComponent | undefined = WindowComponent.getWindowComponentWithId(id);
        if (selectedWindow) {
            selectedWindow.close();
        }
    }

    static toggleOpenedWithId(id: string): boolean {
        let selectedWindow: WindowComponent | undefined = WindowComponent.getWindowComponentWithId(id);
        if (selectedWindow) {
            return selectedWindow.toggleOpened();
        } else {
            return false;
        }
    }

    static bringWindowToFrontWithId(id: string): void {
        let selectedWindow: WindowComponent | undefined = WindowComponent.getWindowComponentWithId(id);
        let topMostWindow: WindowComponent | undefined = undefined;
        let windows: WindowComponent[] = Array.from( WindowComponent.windowMap.values() );
        if (selectedWindow && windows) {
            topMostWindow = windows[0];
            windows.forEach((window: WindowComponent) => {
                if (window && topMostWindow) {
                    if (window.z > topMostWindow.z) {
                        topMostWindow = window;
                    }
                }
            });
        }
        if (selectedWindow && topMostWindow) {
            WindowComponent.swapZIndex(selectedWindow, topMostWindow)
        }
    }

    static addWindowComponent(window: WindowComponent): void {
        WindowComponent.windowMap.set(window.id, window);
    }

    static addWindowWithId(id: string, x: number = 0, y: number = 0, z: number = 0): WindowComponent {
        let windowComponent: WindowComponent | undefined = WindowComponent.windowMap.get(id);
        if (windowComponent) {
            windowComponent.restoreStyle();
        } else {
            windowComponent = new WindowComponent(id, x, y, z);
            windowComponent.saveStyle();
            windowComponent.z = WindowComponent.nextZIndex++;
            WindowComponent.addWindowComponent(windowComponent);
        }
        return windowComponent;
    }
}
