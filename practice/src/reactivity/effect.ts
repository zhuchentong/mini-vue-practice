import { extend } from "./shared";

let shouldTrack;
let activeEffect;

export class ReactiveEffect {
  private _fn: any;
  public deps: any[] = [];
  private active = true;
  public onStop?: Function;

  constructor(fn, public scheduler?) {
    this._fn = fn;
  }

  run() {
    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;

    const result = this._fn();
    shouldTrack = false;

    return result;
  }

  stop() {
    if (this.active) {
      cleanUpEffect(this);
      this.active = false;

      this.onStop?.call(this);
    }
  }
}

function cleanUpEffect(effect) {
  effect.deps.forEach((dep: Set<ReactiveEffect>) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

export function effect(
  fn,
  options: { scheduler?: Function; onStop?: Function } = {}
) {
  const _effect = new ReactiveEffect(fn, options.scheduler);

  extend(_effect, options);

  _effect.run();

  const runner: any = _effect.run.bind(_effect);

  runner.effect = _effect;
  return runner;
}

const targetMap = new Map<any, Map<string | Symbol, Set<ReactiveEffect>>>();

export function track(target, key: string | Symbol) {
  // target -> <target: depsMap>
  // target -> dep -> key

  if (!isTracking()) return;

  let depsMap = targetMap.get(target);

  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);

  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  trackEffects(dep);
}

export function trackEffects(dep) {
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

export function trigger(target, key: string | Symbol) {
  const depsMap = targetMap.get(target);
  const dep = depsMap && depsMap.get(key);

  triggerEffects(dep);
}

export function triggerEffects(dep) {
  for (let effect of dep || []) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function stop(runner) {
  runner.effect.stop();
}

export function isTracking() {
  return !!shouldTrack && activeEffect !== undefined;
}
