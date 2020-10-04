// Copyright 2015-2020 Swim inc.
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

import {GeoPoint} from "../geo/GeoPoint";
import {GeoBox} from "../geo/GeoBox";
import {MapGraphicsView} from "../graphics/MapGraphicsView";

export class MapGridTile {
  /** @hidden */
  readonly _depth: number;
  /** @hidden */
  readonly _maxDepth: number;
  /** @hidden */
  readonly _density: number
  /** @hidden */
  readonly _geoFrame: GeoBox;
  /** @hidden */
  readonly _geoBounds: GeoBox;
  /** @hidden */
  readonly _geoCenter: GeoPoint;
  /** @hidden */
  readonly _southWest: MapGridTile | null;
  /** @hidden */
  readonly _northWest: MapGridTile | null;
  /** @hidden */
  readonly _southEast: MapGridTile | null;
  /** @hidden */
  readonly _northEast: MapGridTile | null;
  /** @hidden */
  readonly _views: ReadonlyArray<MapGraphicsView>;
  /** @hidden */
  readonly _size: number;

  constructor(depth: number, maxDepth: number, density: number,
              geoFrame: GeoBox, geoBounds: GeoBox, geoCenter: GeoPoint,
              southWest: MapGridTile | null, northWest: MapGridTile | null,
              southEast: MapGridTile | null, northEast: MapGridTile | null,
              views: ReadonlyArray<MapGraphicsView>, size: number) {
    this._depth = depth;
    this._maxDepth = maxDepth;
    this._density = density;
    this._geoFrame = geoFrame;
    this._geoBounds = geoBounds;
    this._geoCenter = geoCenter;
    this._southWest = southWest;
    this._northWest = northWest;
    this._southEast = southEast;
    this._northEast = northEast;
    this._views = views;
    this._size = size;
  }

  get depth(): number {
    return this._depth;
  }

  get maxDepth(): number {
    return this._maxDepth;
  }

  get geoFrame(): GeoBox {
    return this._geoFrame;
  }

  get geoBounds(): GeoBox {
    return this._geoBounds;
  }

  get geoCenter(): GeoPoint {
    return this._geoCenter;
  }

  get southWest(): MapGridTile | null {
    return this._southWest;
  }

  get northWest(): MapGridTile | null {
    return this._northWest;
  }

  get southEast(): MapGridTile | null {
    return this._southEast;
  }

  get northEast(): MapGridTile | null {
    return this._northEast;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  contains(bounds: GeoBox): boolean {
    return this._geoFrame.contains(bounds);
  }

  intersects(bounds: GeoBox): boolean {
    return this._geoFrame.intersects(bounds);
  }

  getTile(bounds: GeoBox): MapGridTile {
    if (this._depth < this._maxDepth && this._size > this._density) {
      const geoCenter = this._geoCenter;
      const inWest = bounds.lngMin <= geoCenter.lng;
      const inSouth = bounds.latMin <= geoCenter.lat;
      const inEast = bounds.lngMax > geoCenter.lng;
      const inNorth = bounds.latMax > geoCenter.lat;
      if (inWest !== inEast && inSouth !== inNorth) {
        if (inSouth && inWest) {
          const southWest = this._southWest;
          if (southWest !== null) {
            return southWest.getTile(bounds);
          }
        } else if (inNorth && inWest) {
          const northWest = this._northWest;
          if (northWest !== null) {
            return northWest.getTile(bounds);
          }
        } else if (inSouth && inEast) {
          const southEast = this._southEast;
          if (southEast !== null) {
            return southEast.getTile(bounds);
          }
        } else if (inNorth && inEast) {
          const northEast = this._northEast;
          if (northEast !== null) {
            return northEast.getTile(bounds);
          }
        }
      }
    }
    return this;
  }

  has(view: MapGraphicsView, bounds: GeoBox): boolean {
    if (this._depth < this._maxDepth && this._size > this._density) {
      const contained = this.hasNode(view, bounds);
      if (contained !== void 0) {
        return contained;
      }
    }
    return this.hasLeaf(view, bounds);
  }

  private hasNode(view: MapGraphicsView, bounds: GeoBox): boolean | undefined {
    const geoCenter = this._geoCenter;
    const inWest = bounds.lngMin <= geoCenter.lng;
    const inSouth = bounds.latMin <= geoCenter.lat;
    const inEast = bounds.lngMax > geoCenter.lng;
    const inNorth = bounds.latMax > geoCenter.lat;
    if (inWest !== inEast && inSouth !== inNorth) {
      if (inSouth && inWest) {
        const southWest = this._southWest;
        if (southWest !== null) {
          return southWest.has(view, bounds);
        }
      } else if (inNorth && inWest) {
        const northWest = this._northWest;
        if (northWest !== null) {
          return northWest.has(view, bounds);
        }
      } else if (inSouth && inEast) {
        const southEast = this._southEast;
        if (southEast !== null) {
          return southEast.has(view, bounds);
        }
      } else if (inNorth && inEast) {
        const northEast = this._northEast;
        if (northEast !== null) {
          return northEast.has(view, bounds);
        }
      }
    }
    return void 0;
  }

  private hasLeaf(view: MapGraphicsView, bounds: GeoBox): boolean {
    return this._views.indexOf(view) >= 0;
  }

  inserted(view: MapGraphicsView, bounds: GeoBox): MapGridTile {
    let tile: MapGridTile = this;
    if (tile._depth < tile._maxDepth && tile._size > tile._density) {
      const newTile = tile.insertedNode(view, bounds);
      if (newTile !== null) {
        tile = newTile;
        if (this !== tile && tile._size === tile._density + 1) {
          tile = tile.reinsertedNode();
        }
        return tile;
      }
    }
    tile = tile.insertedLeaf(view, bounds);
    if (this !== tile && tile._size === tile._density + 1) {
      tile = tile.reinsertedNode();
    }
    return tile;
  }

  private insertedNode(view: MapGraphicsView, bounds: GeoBox): MapGridTile | null {
    const geoCenter = this._geoCenter;
    const inWest = bounds.lngMin <= geoCenter.lng;
    const inSouth = bounds.latMin <= geoCenter.lat;
    const inEast = bounds.lngMax > geoCenter.lng;
    const inNorth = bounds.latMax > geoCenter.lat;
    if (inWest !== inEast && inSouth !== inNorth) {
      if (inSouth && inWest) {
        const oldSouthWest = this._southWest;
        let newSouthWest = oldSouthWest;
        if (newSouthWest === null) {
          newSouthWest = this.createTile(this._depth + 1, this._maxDepth, this._density,
                                         new GeoBox(this._geoFrame._lngMin, this._geoFrame._latMin,
                                                    this._geoCenter._lng, this._geoCenter._lat));
        }
        newSouthWest = newSouthWest.inserted(view, bounds);
        if (oldSouthWest !== newSouthWest) {
          return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                 void 0, this._geoCenter, newSouthWest, this._northWest,
                                 this._southEast, this._northEast, this._views, this._size + 1);
        } else {
          return this;
        }
      } else if (inNorth && inWest) {
        const oldNorthWest = this._northWest;
        let newNorthWest = oldNorthWest;
        if (newNorthWest === null) {
          newNorthWest = this.createTile(this._depth + 1, this._maxDepth, this._density,
                                         new GeoBox(this._geoFrame._lngMin, this._geoCenter._lat,
                                                    this._geoCenter._lng, this._geoFrame._latMax));
        }
        newNorthWest = newNorthWest.inserted(view, bounds);
        if (oldNorthWest !== newNorthWest) {
          return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                 void 0, this._geoCenter, this._southWest, newNorthWest,
                                 this._southEast, this._northEast, this._views, this._size + 1);
        } else {
          return this;
        }
      } else if (inSouth && inEast) {
        const oldSouthEast = this._southEast;
        let newSouthEast = oldSouthEast;
        if (newSouthEast === null) {
          newSouthEast = this.createTile(this._depth + 1, this._maxDepth, this._density,
                                         new GeoBox(this._geoCenter._lng, this._geoFrame._latMin,
                                                    this._geoFrame._lngMax, this._geoCenter._lat));
        }
        newSouthEast = newSouthEast.inserted(view, bounds);
        if (oldSouthEast !== newSouthEast) {
          return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                 void 0, this._geoCenter, this._southWest, this._northWest,
                                 newSouthEast, this._northEast, this._views, this._size + 1);
        } else {
          return this;
        }
      } else if (inNorth && inEast) {
        const oldNorthEast = this._northEast;
        let newNorthEast = oldNorthEast;
        if (newNorthEast === null) {
          newNorthEast = this.createTile(this._depth + 1, this._maxDepth, this._density,
                                         new GeoBox(this._geoCenter._lng, this._geoCenter._lat,
                                                    this._geoFrame._lngMax, this._geoFrame._latMax));
        }
        newNorthEast = newNorthEast.inserted(view, bounds);
        if (oldNorthEast !== newNorthEast) {
          return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                 void 0, this._geoCenter, this._southWest, this._northWest,
                                 this._southEast, newNorthEast, this._views, this._size + 1);
        } else {
          return this;
        }
      }
    }
    return null;
  }

  private insertedLeaf(view: MapGraphicsView, bounds: GeoBox): MapGridTile {
    const oldViews = this._views;
    if (oldViews.indexOf(view) < 0) {
      const newViews = oldViews.slice(0);
      newViews.push(view);
      return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                             void 0, this._geoCenter, this._southWest, this._northWest,
                             this._southEast, this._northEast, newViews, this._size + 1);
    } else {
      return this;
    }
  }

  removed(view: MapGraphicsView, bounds: GeoBox): MapGridTile {
    let tile: MapGridTile = this;
    if (tile._depth < tile._maxDepth && tile._size > tile._density) {
      const newTile = tile.removedNode(view, bounds);
      if (newTile !== null) {
        tile = newTile;
        if (this !== tile && tile._size === tile._density) {
          tile = tile.reinsertedLeaf();
        }
        return tile;
      }
    }
    tile = tile.removedLeaf(view, bounds);
    if (this !== tile && tile._size === tile._density) {
      tile = tile.reinsertedLeaf();
    }
    return tile;
  }

  private removedNode(view: MapGraphicsView, bounds: GeoBox): MapGridTile | null {
    const geoCenter = this._geoCenter;
    const inWest = bounds.lngMin <= geoCenter.lng;
    const inSouth = bounds.latMin <= geoCenter.lat;
    const inEast = bounds.lngMax > geoCenter.lng;
    const inNorth = bounds.latMax > geoCenter.lat;
    if (inWest !== inEast && inSouth !== inNorth) {
      if (inSouth && inWest) {
        const oldSouthWest = this._southWest;
        if (oldSouthWest !== null) {
          let newSouthWest: MapGridTile | null = oldSouthWest.removed(view, bounds);
          if (newSouthWest.isEmpty()) {
            newSouthWest = null;
          }
          return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                 void 0, this._geoCenter, newSouthWest, this._northWest,
                                 this._southEast, this._northEast, this._views, this._size - 1);
        } else {
          return this;
        }
      } else if (inNorth && inWest) {
        const oldNorthWest = this._northWest;
        if (oldNorthWest !== null) {
          let newNorthWest: MapGridTile | null = oldNorthWest.removed(view, bounds);
          if (newNorthWest.isEmpty()) {
            newNorthWest = null;
          }
          return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                 void 0, this._geoCenter, this._southWest, newNorthWest,
                                 this._southEast, this._northEast, this._views, this._size - 1);
        } else {
          return this;
        }
      } else if (inSouth && inEast) {
        const oldSouthEast = this._southEast;
        if (oldSouthEast !== null) {
          let newSouthEast: MapGridTile | null = oldSouthEast.removed(view, bounds);
          if (newSouthEast.isEmpty()) {
            newSouthEast = null;
          }
          return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                 void 0, this._geoCenter, this._southWest, this._northWest,
                                 newSouthEast, this._northEast, this._views, this._size - 1);
        } else {
          return this;
        }
      } else if (inNorth && inEast) {
        const oldNorthEast = this._northEast;
        if (oldNorthEast !== null) {
          let newNorthEast: MapGridTile | null = oldNorthEast.removed(view, bounds);
          if (newNorthEast.isEmpty()) {
            newNorthEast = null;
          }
          return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                 void 0, this._geoCenter, this._southWest, this._northWest,
                                 this._southEast, newNorthEast, this._views, this._size - 1);
        } else {
          return this;
        }
      }
    }
    return null;
  }

  private removedLeaf(view: MapGraphicsView, bounds: GeoBox): MapGridTile {
    const oldViews = this._views;
    const index = oldViews.indexOf(view);
    if (index >= 0) {
      const newViews = oldViews.slice(0);
      newViews.splice(index, 1);
      return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                             void 0, this._geoCenter, this._southWest, this._northWest,
                             this._southEast, this._northEast, newViews, this._size - 1);
    } else {
      return this;
    }
  }

  private reinsertedNode(): MapGridTile {
    let tile = this.createTile(this._depth, this._maxDepth, this._density,
                               this._geoFrame, void 0, this._geoCenter);
    this.forEach(function (view: MapGraphicsView): void {
      const bounds = view.geoBounds;
      const newTile = tile.insertedNode(view, bounds);
      if (newTile !== null) {
        tile = newTile;
      } else {
        tile = tile.insertedLeaf(view, bounds);
      }
    }, this);
    return tile;
  }

  private reinsertedLeaf(): MapGridTile {
    let tile = this.createTile(this._depth, this._maxDepth, this._density,
                               this._geoFrame, void 0, this._geoCenter);
    this.forEach(function (view: MapGraphicsView): void {
      tile = tile.insertedLeaf(view, view.geoBounds);
    }, this);
    return tile;
  }

  moved(view: MapGraphicsView, newBounds: GeoBox, oldBounds: GeoBox): MapGridTile {
    if (this._depth < this._maxDepth && this._size > this._density) {
      const geoCenter = this._geoCenter;
      const newInWest = newBounds.lngMin <= geoCenter.lng;
      const newInSouth = newBounds.latMin <= geoCenter.lat;
      const newInEast = newBounds.lngMax > geoCenter.lng;
      const newInNorth = newBounds.latMax > geoCenter.lat;
      const oldInWest = oldBounds.lngMin <= geoCenter.lng;
      const oldInSouth = oldBounds.latMin <= geoCenter.lat;
      const oldInEast = oldBounds.lngMax > geoCenter.lng;
      const oldInNorth = oldBounds.latMax > geoCenter.lat;
      if (newInWest === oldInWest && newInSouth === oldInSouth && newInEast === oldInEast && newInNorth === oldInNorth) {
        // in same tile
        if (newInWest !== newInEast && newInSouth !== newInNorth) {
          if (newInSouth && newInWest) {
            const oldSouthWest = this._southWest!;
            const newSouthWest = oldSouthWest.moved(view, newBounds, oldBounds);
            if (oldSouthWest !== newSouthWest) {
              return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                     void 0, this._geoCenter, newSouthWest, this._northWest,
                                     this._southEast, this._northEast, this._views, this._size);
            }
          } else if (newInNorth && newInWest) {
            const oldNorthWest = this._northWest!;
            const newNorthWest = oldNorthWest.moved(view, newBounds, oldBounds);
            if (oldNorthWest !== newNorthWest) {
              return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                     void 0, this._geoCenter, this._southWest, newNorthWest,
                                     this._southEast, this._northEast, this._views, this._size);
            }
          } else if (newInSouth && newInEast) {
            const oldSouthEast = this._southEast!;
            const newSouthEast = oldSouthEast.moved(view, newBounds, oldBounds);
            if (oldSouthEast !== newSouthEast) {
              return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                     void 0, this._geoCenter, this._southWest, this._northWest,
                                     newSouthEast, this._northEast, this._views, this._size);
            }
          } else if (newInNorth && newInEast) {
            const oldNorthEast = this._northEast!;
            const newNorthEast = oldNorthEast.moved(view, newBounds, oldBounds);
            if (oldNorthEast !== newNorthEast) {
              return this.createTile(this._depth, this._maxDepth, this._density, this._geoFrame,
                                     void 0, this._geoCenter, this._southWest, this._northWest,
                                     this._southEast, newNorthEast, this._views, this._size);
            }
          }
        }
      } else {
        return this.removed(view, oldBounds).inserted(view, newBounds);
      }
    }
    return this;
  }

  forEach<T, S>(callback: (this: S, view: MapGraphicsView) => T | void, thisArg?: S): T | undefined {
    if (this._southWest !== null) {
      const result = this._southWest.forEach(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this._northWest !== null) {
      const result = this._northWest.forEach(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this._southEast !== null) {
      const result = this._southEast.forEach(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this._northEast !== null) {
      const result = this._northEast.forEach(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    const views = this._views;
    for (let i = 0; i < views.length; i += 1) {
      const result = callback.call(thisArg, views[i]);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  forEachReverse<T, S>(callback: (this: S, view: MapGraphicsView) => T | void, thisArg?: S): T | undefined {
    const views = this._views;
    for (let i = views.length - 1; i >= 0; i -= 1) {
      const result = callback.call(thisArg, views[i]);
      if (result !== void 0) {
        return result;
      }
    }
    if (this._northEast !== null) {
      const result = this._northEast.forEachReverse(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this._southEast !== null) {
      const result = this._southEast.forEachReverse(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this._northWest !== null) {
      const result = this._northWest.forEachReverse(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    if (this._southWest !== null) {
      const result = this._southWest.forEachReverse(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  forEachIntersecting<T, S>(bounds: GeoBox, callback: (this: S, view: MapGraphicsView) => T | void, thisArg?: S): T | undefined {
    if (this._geoFrame.intersects(bounds)) {
      if (this._southWest !== null) {
        const result = this._southWest.forEachIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this._northWest !== null) {
        const result = this._northWest.forEachIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this._southEast !== null) {
        const result = this._southEast.forEachIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this._northEast !== null) {
        const result = this._northEast.forEachIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      const views = this._views;
      for (let i = 0; i < views.length; i += 1) {
        const result = callback.call(thisArg, views[i]);
        if (result !== void 0) {
          return result;
        }
      }
    }
    return void 0;
  }

  forEachNonIntersecting<T, S>(bounds: GeoBox, callback: (this: S, view: MapGraphicsView) => T | void, thisArg?: S): T | undefined {
    if (!this._geoFrame.intersects(bounds)) {
      if (this._southWest !== null) {
        const result = this._southWest.forEachNonIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this._northWest !== null) {
        const result = this._northWest.forEachNonIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this._southEast !== null) {
        const result = this._southEast.forEachNonIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      if (this._northEast !== null) {
        const result = this._northEast.forEachNonIntersecting(bounds, callback, thisArg);
        if (result !== void 0) {
          return result;
        }
      }
      const views = this._views;
      for (let i = 0; i < views.length; i += 1) {
        const result = callback.call(thisArg, views[i]);
        if (result !== void 0) {
          return result;
        }
      }
    }
    return void 0;
  }

  protected createTile(depth: number, maxDepth: number, density: number,
                       geoFrame: GeoBox, geoBounds?: GeoBox, geoCenter?: GeoPoint,
                       southWest: MapGridTile | null = null, northWest: MapGridTile | null = null,
                       southEast: MapGridTile | null = null, northEast: MapGridTile | null = null,
                       views: ReadonlyArray<MapGraphicsView> = [], size: number = 0): MapGridTile {
    if (geoCenter === void 0) {
      geoCenter = geoFrame.center;
    }
    if (geoBounds === void 0) {
      if (southWest !== null) {
        geoBounds = southWest._geoBounds;
      }
      if (northWest !== null) {
        geoBounds = geoBounds !== void 0 ? geoBounds.union(northWest._geoBounds) : northWest._geoBounds;
      }
      if (southEast !== null) {
        geoBounds = geoBounds !== void 0 ? geoBounds.union(southEast._geoBounds) : southEast._geoBounds;
      }
      if (northEast !== null) {
        geoBounds = geoBounds !== void 0 ? geoBounds.union(northEast._geoBounds) : northEast._geoBounds;
      }
      for (let i = 0; i < views.length; i += 1) {
        const view = views[i];
        geoBounds = geoBounds !== void 0 ? geoBounds.union(view.geoBounds) : view.geoBounds;
      }
      if (geoBounds === void 0) {
        geoBounds = geoFrame;
      }
    }
    return new MapGridTile(depth, maxDepth, density, geoFrame, geoBounds, geoCenter,
                           southWest, northWest, southEast, northEast, views, size);
  }

  static empty(geoFrame?: GeoBox, depth?: number, maxDepth?: number, density?: number): MapGridTile {
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
    return new MapGridTile(depth, maxDepth, density, geoFrame, geoFrame,
                           geoFrame.center, null, null, null, null, [], 0);
  }
}