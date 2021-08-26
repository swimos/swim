// Copyright 2015-2021 Swim Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Arrays} from "@swim/util";
import {GeoPoint, GeoBox} from "@swim/geo";
import type {GeoView} from "../geo/GeoView";

export class GeoTree {
  constructor(depth: number, maxDepth: number, density: number,
              geoFrame: GeoBox, geoBounds: GeoBox, geoCenter: GeoPoint,
              southWest: GeoTree | null, northWest: GeoTree | null,
              southEast: GeoTree | null, northEast: GeoTree | null,
              views: ReadonlyArray<GeoView>, size: number) {
    Object.defineProperty(this, "depth", {
      value: depth,
      enumerable: true,
    });
    Object.defineProperty(this, "maxDepth", {
      value: maxDepth,
      enumerable: true,
    });
    Object.defineProperty(this, "density", {
      value: density,
      enumerable: true,
    });
    Object.defineProperty(this, "geoFrame", {
      value: geoFrame,
      enumerable: true,
    });
    Object.defineProperty(this, "geoBounds", {
      value: geoBounds,
      enumerable: true,
    });
    Object.defineProperty(this, "geoCenter", {
      value: geoCenter,
      enumerable: true,
    });
    Object.defineProperty(this, "southWest", {
      value: southWest,
      enumerable: true,
    });
    Object.defineProperty(this, "northWest", {
      value: northWest,
      enumerable: true,
    });
    Object.defineProperty(this, "southEast", {
      value: southEast,
      enumerable: true,
    });
    Object.defineProperty(this, "northEast", {
      value: northEast,
      enumerable: true,
    });
    Object.defineProperty(this, "views", {
      value: views,
      enumerable: true,
    });
    Object.defineProperty(this, "size", {
      value: size,
      enumerable: true,
    });
  }

  readonly depth!: number;

  readonly maxDepth!: number;

  readonly density!: number

  readonly geoFrame!: GeoBox;

  readonly geoBounds!: GeoBox;

  readonly geoCenter!: GeoPoint;

  readonly southWest!: GeoTree | null;

  readonly northWest!: GeoTree | null;

  readonly southEast!: GeoTree | null;

  readonly northEast!: GeoTree | null;

  readonly views!: ReadonlyArray<GeoView>;

  readonly size!: number;

  isEmpty(): boolean {
    return this.size === 0;
  }

  contains(bounds: GeoBox): boolean {
    return this.geoFrame.contains(bounds);
  }

  intersects(bounds: GeoBox): boolean {
    return this.geoFrame.intersects(bounds);
  }

  getTree(bounds: GeoBox): GeoTree {
    if (this.depth < this.maxDepth && this.size > this.density) {
      const geoCenter = this.geoCenter;
      const inWest = bounds.lngMin <= geoCenter.lng;
      const inSouth = bounds.latMin <= geoCenter.lat;
      const inEast = bounds.lngMax > geoCenter.lng;
      const inNorth = bounds.latMax > geoCenter.lat;
      if (inWest !== inEast && inSouth !== inNorth) {
        if (inSouth && inWest) {
          const southWest = this.southWest;
          if (southWest !== null) {
            return southWest.getTree(bounds);
          }
        } else if (inNorth && inWest) {
          const northWest = this.northWest;
          if (northWest !== null) {
            return northWest.getTree(bounds);
          }
        } else if (inSouth && inEast) {
          const southEast = this.southEast;
          if (southEast !== null) {
            return southEast.getTree(bounds);
          }
        } else if (inNorth && inEast) {
          const northEast = this.northEast;
          if (northEast !== null) {
            return northEast.getTree(bounds);
          }
        }
      }
    }
    return this;
  }

  has(view: GeoView, bounds: GeoBox): boolean {
    if (this.depth < this.maxDepth && this.size > this.density) {
      const contained = this.hasNode(view, bounds);
      if (contained !== void 0) {
        return contained;
      }
    }
    return this.hasLeaf(view, bounds);
  }

  private hasNode(view: GeoView, bounds: GeoBox): boolean | undefined {
    const geoCenter = this.geoCenter;
    const inWest = bounds.lngMin <= geoCenter.lng;
    const inSouth = bounds.latMin <= geoCenter.lat;
    const inEast = bounds.lngMax > geoCenter.lng;
    const inNorth = bounds.latMax > geoCenter.lat;
    if (inWest !== inEast && inSouth !== inNorth) {
      if (inSouth && inWest) {
        const southWest = this.southWest;
        if (southWest !== null) {
          return southWest.has(view, bounds);
        }
      } else if (inNorth && inWest) {
        const northWest = this.northWest;
        if (northWest !== null) {
          return northWest.has(view, bounds);
        }
      } else if (inSouth && inEast) {
        const southEast = this.southEast;
        if (southEast !== null) {
          return southEast.has(view, bounds);
        }
      } else if (inNorth && inEast) {
        const northEast = this.northEast;
        if (northEast !== null) {
          return northEast.has(view, bounds);
        }
      }
    }
    return void 0;
  }

  private hasLeaf(view: GeoView, bounds: GeoBox): boolean {
    return this.views.indexOf(view) >= 0;
  }

  inserted(view: GeoView, bounds: GeoBox): GeoTree {
    let tree: GeoTree = this;
    if (tree.depth < tree.maxDepth && tree.size > tree.density) {
      const newTree = tree.insertedNode(view, bounds);
      if (newTree !== null) {
        tree = newTree;
        if (this !== tree && tree.size === tree.density + 1) {
          tree = tree.reinsertedNode();
        }
        return tree;
      }
    }
    tree = tree.insertedLeaf(view, bounds);
    if (this !== tree && tree.depth < tree.maxDepth && tree.size === tree.density + 1) {
      tree = tree.reinsertedNode();
    }
    return tree;
  }

  private insertedNode(view: GeoView, bounds: GeoBox): GeoTree | null {
    const geoCenter = this.geoCenter;
    const inWest = bounds.lngMin <= geoCenter.lng;
    const inSouth = bounds.latMin <= geoCenter.lat;
    const inEast = bounds.lngMax > geoCenter.lng;
    const inNorth = bounds.latMax > geoCenter.lat;
    if (inWest !== inEast && inSouth !== inNorth) {
      if (inSouth && inWest) {
        const oldSouthWest = this.southWest;
        let newSouthWest = oldSouthWest;
        if (newSouthWest === null) {
          newSouthWest = this.createTree(this.depth + 1, this.maxDepth, this.density,
                                         new GeoBox(this.geoFrame.lngMin, this.geoFrame.latMin,
                                                    this.geoCenter.lng, this.geoCenter.lat));
        }
        newSouthWest = newSouthWest.inserted(view, bounds);
        if (oldSouthWest !== newSouthWest) {
          return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                 void 0, this.geoCenter, newSouthWest, this.northWest,
                                 this.southEast, this.northEast, this.views, this.size + 1);
        } else {
          return this;
        }
      } else if (inNorth && inWest) {
        const oldNorthWest = this.northWest;
        let newNorthWest = oldNorthWest;
        if (newNorthWest === null) {
          newNorthWest = this.createTree(this.depth + 1, this.maxDepth, this.density,
                                         new GeoBox(this.geoFrame.lngMin, this.geoCenter.lat,
                                                    this.geoCenter.lng, this.geoFrame.latMax));
        }
        newNorthWest = newNorthWest.inserted(view, bounds);
        if (oldNorthWest !== newNorthWest) {
          return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                 void 0, this.geoCenter, this.southWest, newNorthWest,
                                 this.southEast, this.northEast, this.views, this.size + 1);
        } else {
          return this;
        }
      } else if (inSouth && inEast) {
        const oldSouthEast = this.southEast;
        let newSouthEast = oldSouthEast;
        if (newSouthEast === null) {
          newSouthEast = this.createTree(this.depth + 1, this.maxDepth, this.density,
                                         new GeoBox(this.geoCenter.lng, this.geoFrame.latMin,
                                                    this.geoFrame.lngMax, this.geoCenter.lat));
        }
        newSouthEast = newSouthEast.inserted(view, bounds);
        if (oldSouthEast !== newSouthEast) {
          return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                 void 0, this.geoCenter, this.southWest, this.northWest,
                                 newSouthEast, this.northEast, this.views, this.size + 1);
        } else {
          return this;
        }
      } else if (inNorth && inEast) {
        const oldNorthEast = this.northEast;
        let newNorthEast = oldNorthEast;
        if (newNorthEast === null) {
          newNorthEast = this.createTree(this.depth + 1, this.maxDepth, this.density,
                                         new GeoBox(this.geoCenter.lng, this.geoCenter.lat,
                                                    this.geoFrame.lngMax, this.geoFrame.latMax));
        }
        newNorthEast = newNorthEast.inserted(view, bounds);
        if (oldNorthEast !== newNorthEast) {
          return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                 void 0, this.geoCenter, this.southWest, this.northWest,
                                 this.southEast, newNorthEast, this.views, this.size + 1);
        } else {
          return this;
        }
      }
    }
    return null;
  }

  private insertedLeaf(view: GeoView, bounds: GeoBox): GeoTree {
    const oldViews = this.views;
    if (oldViews.indexOf(view) < 0) {
      const newViews = oldViews.slice(0);
      newViews.push(view);
      return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                             void 0, this.geoCenter, this.southWest, this.northWest,
                             this.southEast, this.northEast, newViews, this.size + 1);
    } else {
      return this;
    }
  }

  removed(view: GeoView, bounds: GeoBox): GeoTree {
    let tree: GeoTree = this;
    if (tree.depth < tree.maxDepth && tree.size > tree.density) {
      const newTree = tree.removedNode(view, bounds);
      if (newTree !== null) {
        tree = newTree;
        if (this !== tree && tree.size === tree.density) {
          tree = tree.reinsertedLeaf();
        }
        return tree;
      }
    }
    tree = tree.removedLeaf(view, bounds);
    if (this !== tree && tree.size === tree.density) {
      tree = tree.reinsertedLeaf();
    }
    return tree;
  }

  private removedNode(view: GeoView, bounds: GeoBox): GeoTree | null {
    const geoCenter = this.geoCenter;
    const inWest = bounds.lngMin <= geoCenter.lng;
    const inSouth = bounds.latMin <= geoCenter.lat;
    const inEast = bounds.lngMax > geoCenter.lng;
    const inNorth = bounds.latMax > geoCenter.lat;
    if (inWest !== inEast && inSouth !== inNorth) {
      if (inSouth && inWest) {
        const oldSouthWest = this.southWest;
        if (oldSouthWest !== null) {
          let newSouthWest: GeoTree | null = oldSouthWest.removed(view, bounds);
          if (newSouthWest.isEmpty()) {
            newSouthWest = null;
          }
          return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                 void 0, this.geoCenter, newSouthWest, this.northWest,
                                 this.southEast, this.northEast, this.views, this.size - 1);
        } else {
          return this;
        }
      } else if (inNorth && inWest) {
        const oldNorthWest = this.northWest;
        if (oldNorthWest !== null) {
          let newNorthWest: GeoTree | null = oldNorthWest.removed(view, bounds);
          if (newNorthWest.isEmpty()) {
            newNorthWest = null;
          }
          return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                 void 0, this.geoCenter, this.southWest, newNorthWest,
                                 this.southEast, this.northEast, this.views, this.size - 1);
        } else {
          return this;
        }
      } else if (inSouth && inEast) {
        const oldSouthEast = this.southEast;
        if (oldSouthEast !== null) {
          let newSouthEast: GeoTree | null = oldSouthEast.removed(view, bounds);
          if (newSouthEast.isEmpty()) {
            newSouthEast = null;
          }
          return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                 void 0, this.geoCenter, this.southWest, this.northWest,
                                 newSouthEast, this.northEast, this.views, this.size - 1);
        } else {
          return this;
        }
      } else if (inNorth && inEast) {
        const oldNorthEast = this.northEast;
        if (oldNorthEast !== null) {
          let newNorthEast: GeoTree | null = oldNorthEast.removed(view, bounds);
          if (newNorthEast.isEmpty()) {
            newNorthEast = null;
          }
          return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                 void 0, this.geoCenter, this.southWest, this.northWest,
                                 this.southEast, newNorthEast, this.views, this.size - 1);
        } else {
          return this;
        }
      }
    }
    return null;
  }

  private removedLeaf(view: GeoView, bounds: GeoBox): GeoTree {
    const oldViews = this.views;
    const index = oldViews.indexOf(view);
    if (index >= 0) {
      const newViews = oldViews.slice(0);
      newViews.splice(index, 1);
      return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                             void 0, this.geoCenter, this.southWest, this.northWest,
                             this.southEast, this.northEast, newViews, this.size - 1);
    } else {
      return this;
    }
  }

  private reinsertedNode(): GeoTree {
    let tree = this.createTree(this.depth, this.maxDepth, this.density,
                               this.geoFrame, void 0, this.geoCenter);
    this.forEach(function (view: GeoView): void {
      const bounds = view.geoBounds;
      const newTree = tree.insertedNode(view, bounds);
      if (newTree !== null) {
        tree = newTree;
      } else {
        tree = tree.insertedLeaf(view, bounds);
      }
    }, this);
    return tree;
  }

  private reinsertedLeaf(): GeoTree {
    let tree = this.createTree(this.depth, this.maxDepth, this.density,
                               this.geoFrame, void 0, this.geoCenter);
    this.forEach(function (view: GeoView): void {
      tree = tree.insertedLeaf(view, view.geoBounds);
    }, this);
    return tree;
  }

  moved(view: GeoView, newBounds: GeoBox, oldBounds: GeoBox): GeoTree {
    if (this.depth < this.maxDepth && this.size > this.density) {
      const geoCenter = this.geoCenter;
      const newInWest = newBounds.lngMin <= geoCenter.lng;
      const newInSouth = newBounds.latMin <= geoCenter.lat;
      const newInEast = newBounds.lngMax > geoCenter.lng;
      const newInNorth = newBounds.latMax > geoCenter.lat;
      const oldInWest = oldBounds.lngMin <= geoCenter.lng;
      const oldInSouth = oldBounds.latMin <= geoCenter.lat;
      const oldInEast = oldBounds.lngMax > geoCenter.lng;
      const oldInNorth = oldBounds.latMax > geoCenter.lat;
      if (newInWest === oldInWest && newInSouth === oldInSouth && newInEast === oldInEast && newInNorth === oldInNorth) {
        // in same tree
        if (newInWest !== newInEast && newInSouth !== newInNorth) {
          if (newInSouth && newInWest) {
            const oldSouthWest = this.southWest!;
            const newSouthWest = oldSouthWest.moved(view, newBounds, oldBounds);
            if (oldSouthWest !== newSouthWest) {
              return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                     void 0, this.geoCenter, newSouthWest, this.northWest,
                                     this.southEast, this.northEast, this.views, this.size);
            }
          } else if (newInNorth && newInWest) {
            const oldNorthWest = this.northWest!;
            const newNorthWest = oldNorthWest.moved(view, newBounds, oldBounds);
            if (oldNorthWest !== newNorthWest) {
              return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                     void 0, this.geoCenter, this.southWest, newNorthWest,
                                     this.southEast, this.northEast, this.views, this.size);
            }
          } else if (newInSouth && newInEast) {
            const oldSouthEast = this.southEast!;
            const newSouthEast = oldSouthEast.moved(view, newBounds, oldBounds);
            if (oldSouthEast !== newSouthEast) {
              return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                     void 0, this.geoCenter, this.southWest, this.northWest,
                                     newSouthEast, this.northEast, this.views, this.size);
            }
          } else if (newInNorth && newInEast) {
            const oldNorthEast = this.northEast!;
            const newNorthEast = oldNorthEast.moved(view, newBounds, oldBounds);
            if (oldNorthEast !== newNorthEast) {
              return this.createTree(this.depth, this.maxDepth, this.density, this.geoFrame,
                                     void 0, this.geoCenter, this.southWest, this.northWest,
                                     this.southEast, newNorthEast, this.views, this.size);
            }
          }
        }
      } else {
        return this.removed(view, oldBounds).inserted(view, newBounds);
      }
    }
    return this;
  }

  forEach<T>(callback: (view: GeoView) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, view: GeoView) => T | void, thisArg: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, view: GeoView) => T | void, thisArg?: S): T | undefined {
    if (this.southWest !== null) {
      const result = this.southWest.forEach(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this.northWest !== null) {
      const result = this.northWest.forEach(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this.southEast !== null) {
      const result = this.southEast.forEach(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this.northEast !== null) {
      const result = this.northEast.forEach(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    const views = this.views;
    for (let i = 0; i < views.length; i += 1) {
      const result = callback.call(thisArg, views[i]!);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  forEachReverse<T>(callback: (view: GeoView) => T | void): T | undefined;
  forEachReverse<T, S>(callback: (this: S, view: GeoView) => T | void, thisArg: S): T | undefined;
  forEachReverse<T, S>(callback: (this: S | undefined, view: GeoView) => T | void, thisArg?: S): T | undefined {
    const views = this.views;
    for (let i = views.length - 1; i >= 0; i -= 1) {
      const result = callback.call(thisArg, views[i]!);
      if (result !== void 0) {
        return result;
      }
    }
    if (this.northEast !== null) {
      const result = this.northEast.forEachReverse(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this.southEast !== null) {
      const result = this.southEast.forEachReverse(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this.northWest !== null) {
      const result = this.northWest.forEachReverse(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this.southWest !== null) {
      const result = this.southWest.forEachReverse(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  forEachIntersecting<T>(bounds: GeoBox, callback: (view: GeoView) => T | void): T | undefined;
  forEachIntersecting<T, S>(bounds: GeoBox, callback: (this: S, view: GeoView) => T | void, thisArg: S): T | undefined;
  forEachIntersecting<T, S>(bounds: GeoBox, callback: (this: S | undefined, view: GeoView) => T | void, thisArg?: S): T | undefined {
    if (this.geoFrame.intersects(bounds)) {
      if (this.southWest !== null) {
        const result = this.southWest.forEachIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this.northWest !== null) {
        const result = this.northWest.forEachIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this.southEast !== null) {
        const result = this.southEast.forEachIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this.northEast !== null) {
        const result = this.northEast.forEachIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      const views = this.views;
      for (let i = 0; i < views.length; i += 1) {
        const result = callback.call(thisArg, views[i]!);
        if (result !== void 0) {
          return result;
        }
      }
    }
    return void 0;
  }

  forEachNonIntersecting<T>(bounds: GeoBox, callback: (view: GeoView) => T | void): T | undefined;
  forEachNonIntersecting<T, S>(bounds: GeoBox, callback: (this: S, view: GeoView) => T | void, thisArg: S): T | undefined;
  forEachNonIntersecting<T, S>(bounds: GeoBox, callback: (this: S | undefined, view: GeoView) => T | void, thisArg?: S): T | undefined {
    if (!this.geoFrame.intersects(bounds)) {
      if (this.southWest !== null) {
        const result = this.southWest.forEachNonIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this.northWest !== null) {
        const result = this.northWest.forEachNonIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this.southEast !== null) {
        const result = this.southEast.forEachNonIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this.northEast !== null) {
        const result = this.northEast.forEachNonIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      const views = this.views;
      for (let i = 0; i < views.length; i += 1) {
        const result = callback.call(thisArg, views[i]!);
        if (result !== void 0) {
          return result;
        }
      }
    }
    return void 0;
  }

  protected createTree(depth: number, maxDepth: number, density: number,
                       geoFrame: GeoBox, geoBounds?: GeoBox, geoCenter?: GeoPoint,
                       southWest: GeoTree | null = null, northWest: GeoTree | null = null,
                       southEast: GeoTree | null = null, northEast: GeoTree | null = null,
                       views: ReadonlyArray<GeoView> = Arrays.empty, size: number = 0): GeoTree {
    if (geoCenter === void 0) {
      geoCenter = geoFrame.center;
    }
    if (geoBounds === void 0) {
      if (southWest !== null) {
        geoBounds = southWest.geoBounds;
      }
      if (northWest !== null) {
        geoBounds = geoBounds !== void 0 ? geoBounds.union(northWest.geoBounds) : northWest.geoBounds;
      }
      if (southEast !== null) {
        geoBounds = geoBounds !== void 0 ? geoBounds.union(southEast.geoBounds) : southEast.geoBounds;
      }
      if (northEast !== null) {
        geoBounds = geoBounds !== void 0 ? geoBounds.union(northEast.geoBounds) : northEast.geoBounds;
      }
      for (let i = 0; i < views.length; i += 1) {
        const view = views[i]!;
        geoBounds = geoBounds !== void 0 ? geoBounds.union(view.geoBounds) : view.geoBounds;
      }
      if (geoBounds === void 0) {
        geoBounds = geoFrame;
      }
    }
    return new GeoTree(depth, maxDepth, density, geoFrame, geoBounds, geoCenter,
                       southWest, northWest, southEast, northEast, views, size);
  }

  static empty(geoFrame?: GeoBox, depth?: number, maxDepth?: number, density?: number): GeoTree {
    if (geoFrame === void 0) {
      geoFrame = GeoBox.globe();
    }
    if (depth === void 0) {
      depth = 0;
    }
    if (maxDepth === void 0) {
      maxDepth = 20;
    }
    maxDepth = Math.max(depth, maxDepth);
    if (density === void 0) {
      density = 8;
    }
    return new GeoTree(depth, maxDepth, density, geoFrame, geoFrame,
                           geoFrame.center, null, null, null, null, Arrays.empty, 0);
  }
}