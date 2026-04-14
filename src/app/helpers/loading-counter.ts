/**
 * Helper to handle concurrent loading states in a component.
 * Use an internal counter to avoid shutting down the loader while operations are still in progress.
 *
 * Usage:
 *  - start(): starts an operation
 *  - stop(): stops an operation
*/
export class LoadingCounter {
  private counter = 0;
  loading = false;

  start() {
    this.counter++;
    this.loading = true;
  }

  stop() {
    this.counter = Math.max(0, this.counter - 1);
    this.loading = this.counter > 0;
  }

  reset() {
    this.counter = 0;
    this.loading = false;
  }
}
