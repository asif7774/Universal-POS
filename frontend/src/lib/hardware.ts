/**
 * Hardware Abstraction Layer (HAL)
 * 
 * Provides a unified API to communicate with physical POS hardware.
 * In a real-world scenario, this might use the Web Serial API (for raw serial printers/scanners),
 * WebUSB, Web Bluetooth, or a local WebSocket bridge (e.g., QZ Tray) to talk to the hardware.
 */

export interface HardwareStatus {
  connected: boolean;
  model?: string;
  error?: string;
}

export interface PrinterDevice extends HardwareStatus {
  paperLow: boolean;
}

export interface ScannerDevice extends HardwareStatus {
  batteryLevel?: number;
}

export interface CashDrawerDevice extends HardwareStatus {
  isOpen: boolean;
}

class HardwareAbstractionLayer {
  private _printer: PrinterDevice = { connected: false, paperLow: false };
  private _scanner: ScannerDevice = { connected: false };
  private _cashDrawer: CashDrawerDevice = { connected: false, isOpen: false };
  private _onBarcodeListeners: ((code: string) => void)[] = [];

  // --- Connection Methods ---

  public async connectPrinter(): Promise<boolean> {
    console.log('[HAL] Attempting to connect to receipt printer...');
    return new Promise(resolve => setTimeout(() => {
      this._printer = { connected: true, model: 'Star Micronics TSP143III', paperLow: false };
      console.log('[HAL] Printer connected');
      resolve(true);
    }, 800));
  }

  public async connectScanner(): Promise<boolean> {
    console.log('[HAL] Attempting to connect to barcode scanner...');
    return new Promise(resolve => setTimeout(() => {
      this._scanner = { connected: true, model: 'Zebra DS2278', batteryLevel: 85 };
      console.log('[HAL] Scanner connected');
      resolve(true);
    }, 600));
  }

  public async connectCashDrawer(): Promise<boolean> {
    console.log('[HAL] Attempting to connect to cash drawer...');
    return new Promise(resolve => setTimeout(() => {
      this._cashDrawer = { connected: true, model: 'APG Vasario', isOpen: false };
      console.log('[HAL] Cash drawer connected');
      resolve(true);
    }, 500));
  }

  // --- Operational Methods ---

  /**
   * Prints a receipt via the hardware printer.
   * Falls back to browser `window.print()` if hardware is not connected.
   */
  public async printReceipt(text: string): Promise<boolean> {
    if (!this._printer.connected) {
      console.warn('[HAL] Hardware printer not connected. Falling back to browser print.');
      this.fallbackBrowserPrint(text);
      return true;
    }

    console.log('[HAL] Sending ESC/POS commands to printer...');
    console.log(text);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  }

  /**
   * Opens the physical cash drawer.
   */
  public async openCashDrawer(): Promise<boolean> {
    if (!this._cashDrawer.connected) {
      console.warn('[HAL] Cash drawer not connected.');
      return false;
    }
    console.log('[HAL] Sending kick code to cash drawer...');
    this._cashDrawer.isOpen = true;
    
    // Simulate drawer being pushed shut after 5 seconds
    setTimeout(() => {
      this._cashDrawer.isOpen = false;
      console.log('[HAL] Cash drawer closed manually.');
    }, 5000);
    
    return true;
  }

  /**
   * Simulates receiving a barcode scan from the hardware.
   * In reality, this would listen to the Web Serial/USB port.
   */
  public simulateBarcodeScan(code: string) {
    if (this._scanner.connected) {
      this._onBarcodeListeners.forEach(fn => fn(code));
    }
  }

  public onBarcodeScan(listener: (code: string) => void) {
    this._onBarcodeListeners.push(listener);
    return () => {
      this._onBarcodeListeners = this._onBarcodeListeners.filter(l => l !== listener);
    };
  }

  // --- Getters ---

  public getStatus() {
    return {
      printer: this._printer,
      scanner: this._scanner,
      cashDrawer: this._cashDrawer
    };
  }

  // --- Private Helpers ---

  private fallbackBrowserPrint(text: string) {
    const w = window.open('', '_blank', 'width=380,height=600');
    if (!w) return;
    w.document.write(`<html><head><title>Receipt</title><style>
      body{font-family:monospace;font-size:13px;padding:20px;white-space:pre;}
    </style></head><body>${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}<script>window.print();window.close();<\/script></body></html>`);
    w.document.close();
  }
}

// Export singleton instance
export const HAL = new HardwareAbstractionLayer();
