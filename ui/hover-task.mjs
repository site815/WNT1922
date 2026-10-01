// A cancelled tooltip must stay cancelled even if its artwork finishes loading.
export class HoverTask {
  generation = 0;
  timer = null;
  cancel() {
    this.generation++;
    clearTimeout(this.timer);
    this.timer = null;
  }
  schedule(prepare, show, delay = 220) {
    this.cancel();
    const generation = this.generation;
    this.timer = setTimeout(async () => {
      this.timer = null;
      await prepare();
      if (generation === this.generation) show();
    }, delay);
  }
}
