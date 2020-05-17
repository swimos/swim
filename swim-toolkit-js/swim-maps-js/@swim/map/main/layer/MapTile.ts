// Copyright 2015-2020 SWIM.AI inc.
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
import {MapView} from "../MapView";

export class MapTile {
  /** @hidden */
  readonly _depth: number;
  /** @hidden */
  readonly _maxDepth: number;
  /** @hidden */
  readonly _geoBounds: GeoBox;
  /** @hidden */
  readonly _geoCenter: GeoPoint;
  /** @hidden */
  readonly _southWest: MapTile | null;
  /** @hidden */
  readonly _northWest: MapTile | null;
  /** @hidden */
  readonly _southEast: MapTile | null;
  /** @hidden */
  readonly _northEast: MapTile | null;
  /** @hidden */
  readonly _views: ReadonlyArray<MapView>;
  /** @hidden */
  readonly _size: number;

  constructor(depth: number, maxDepth: number, geoBounds: GeoBox, geoCenter: GeoPoint,
              southWest: MapTile | null, northWest: MapTile | null,
              southEast: MapTile | null, northEast: MapTile | null,
              views: ReadonlyArray<MapView>, size: number) {
    this._depth = depth;
    this._maxDepth = maxDepth;
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

  get geoBounds(): GeoBox {
    return this._geoBounds;
  }

  get geoCenter(): GeoPoint {
    return this._geoCenter;
  }

  get southWest(): MapTile | null {
    return this._southWest;
  }

  get northWest(): MapTile | null {
    return this._northWest;
  }

  get southEast(): MapTile | null {
    return this._southEast;
  }

  get northEast(): MapTile | null {
    return this._northEast;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  contains(bounds: GeoBox): boolean {
    return this._geoBounds.contains(bounds);
  }

  intersects(bounds: GeoBox): boolean {
    return this._geoBounds.intersects(bounds);
  }

  getTile(bounds: GeoBox): MapTile {
    if (this._depth < this._maxDepth) {
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

  inserted(view: MapView, bounds: GeoBox): MapTile {
    if (this._depth < this._maxDepth) {
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
            newSouthWest = this.createTile(this._depth + 1, this._maxDepth,
                                           new GeoBox(this._geoBounds._lngMin, this._geoBounds._latMin,
                                                      this._geoCenter._lng, this._geoCenter._lat));
          }
          newSouthWest = newSouthWest.inserted(view, bounds);
          if (oldSouthWest !== newSouthWest) {
            return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                   newSouthWest, this._northWest, this._southEast, this._northEast,
                                   this._views, this._size + 1);
          } else {
            return this;
          }
        } else if (inNorth && inWest) {
          const oldNorthWest = this._northWest;
          let newNorthWest = oldNorthWest;
          if (newNorthWest === null) {
            newNorthWest = this.createTile(this._depth + 1, this._maxDepth,
                                           new GeoBox(this._geoBounds._lngMin, this._geoCenter._lat,
                                                      this._geoCenter._lng, this._geoBounds._latMax));
          }
          newNorthWest = newNorthWest.inserted(view, bounds);
          if (oldNorthWest !== newNorthWest) {
            return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                   this._southWest, newNorthWest, this._southEast, this._northEast,
                                   this._views, this._size + 1);
          } else {
            return this;
          }
        } else if (inSouth && inEast) {
          const oldSouthEast = this._southEast;
          let newSouthEast = oldSouthEast;
          if (newSouthEast === null) {
            newSouthEast = this.createTile(this._depth + 1, this._maxDepth,
                                           new GeoBox(this._geoCenter._lng, this._geoBounds._latMin,
                                                      this._geoBounds._lngMax, this._geoCenter._lat));
          }
          newSouthEast = newSouthEast.inserted(view, bounds);
          if (oldSouthEast !== newSouthEast) {
            return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                   this._southWest, this._northWest, newSouthEast, this._northEast,
                                   this._views, this._size + 1);
          } else {
            return this;
          }
        } else if (inNorth && inEast) {
          const oldNorthEast = this._northEast;
          let newNorthEast = oldNorthEast;
          if (newNorthEast === null) {
            newNorthEast = this.createTile(this._depth + 1, this._maxDepth,
                                           new GeoBox(this._geoCenter._lng, this._geoCenter._lat,
                                                      this._geoBounds._lngMax, this._geoBounds._latMax));
          }
          newNorthEast = newNorthEast.inserted(view, bounds);
          if (oldNorthEast !== newNorthEast) {
            return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                   this._southWest, this._northWest, this._southEast, newNorthEast,
                                   this._views, this._size + 1);
          } else {
            return this;
          }
        }
      }
    }
    const oldViews = this._views;
    if (oldViews.indexOf(view) < 0) {
      const newViews = oldViews.slice(0);
      newViews.push(view);
      return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                             this._southWest, this._northWest, this._southEast, this._northEast,
                             newViews, this._size + 1);
    } else {
      return this;
    }
  }

  removed(view: MapView, bounds: GeoBox): MapTile {
    if (this._depth < this._maxDepth) {
      const geoCenter = this._geoCenter;
      const inWest = bounds.lngMin <= geoCenter.lng;
      const inSouth = bounds.latMin <= geoCenter.lat;
      const inEast = bounds.lngMax > geoCenter.lng;
      const inNorth = bounds.latMax > geoCenter.lat;
      if (inWest !== inEast && inSouth !== inNorth) {
        if (inSouth && inWest) {
          const oldSouthWest = this._southWest;
          if (oldSouthWest !== null) {
            let newSouthWest: MapTile | null = oldSouthWest.removed(view, bounds);
            if (newSouthWest.isEmpty()) {
              newSouthWest = null;
            }
            return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                   newSouthWest, this._northWest, this._southEast, this._northEast,
                                   this._views, this._size - 1);
          } else {
            return this;
          }
        } else if (inNorth && inWest) {
          const oldNorthWest = this._northWest;
          if (oldNorthWest !== null) {
            let newNorthWest: MapTile | null = oldNorthWest.removed(view, bounds);
            if (newNorthWest.isEmpty()) {
              newNorthWest = null;
            }
            return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                   this._southWest, newNorthWest, this._southEast, this._northEast,
                                   this._views, this._size - 1);
          } else {
            return this;
          }
        } else if (inSouth && inEast) {
          const oldSouthEast = this._southEast;
          if (oldSouthEast !== null) {
            let newSouthEast: MapTile | null = oldSouthEast.removed(view, bounds);
            if (newSouthEast.isEmpty()) {
              newSouthEast = null;
            }
            return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                   this._southWest, this._northWest, newSouthEast, this._northEast,
                                   this._views, this._size - 1);
          } else {
            return this;
          }
        } else if (inNorth && inEast) {
          const oldNorthEast = this._northEast;
          if (oldNorthEast !== null) {
            let newNorthEast: MapTile | null = oldNorthEast.removed(view, bounds);
            if (newNorthEast.isEmpty()) {
              newNorthEast = null;
            }
            return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                   this._southWest, this._northWest, this._southEast, newNorthEast,
                                   this._views, this._size - 1);
          } else {
            return this;
          }
        }
      }
    }
    const oldViews = this._views;
    const index = oldViews.indexOf(view);
    if (index >= 0) {
      const newViews = oldViews.slice(0);
      newViews.splice(index, 1);
      return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                             this._southWest, this._northWest, this._southEast, this._northEast,
                             newViews, this._size - 1);
    } else {
      return this;
    }
  }

  moved(view: MapView, newBounds: GeoBox, oldBounds: GeoBox): MapTile {
    if (this._depth < this._maxDepth) {
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
              return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                     newSouthWest, this._northWest, this._southEast, this._northEast,
                                     this._views, this._size);
            } else {
              return this;
            }
          } else if (newInNorth && newInWest) {
            const oldNorthWest = this._northWest!;
            const newNorthWest = oldNorthWest.moved(view, newBounds, oldBounds);
            if (oldNorthWest !== newNorthWest) {
              return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                     this._southWest, newNorthWest, this._southEast, this._northEast,
                                     this._views, this._size);
            } else {
              return this;
            }
          } else if (newInSouth && newInEast) {
            const oldSouthEast = this._southEast!;
            const newSouthEast = oldSouthEast.moved(view, newBounds, oldBounds);
            if (oldSouthEast !== newSouthEast) {
              return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                     this._southWest, this._northWest, newSouthEast, this._northEast,
                                     this._views, this._size);
            } else {
              return this;
            }
          } else if (newInNorth && newInEast) {
            const oldNorthEast = this._northEast!;
            const newNorthEast = oldNorthEast.moved(view, newBounds, oldBounds);
            if (oldNorthEast !== newNorthEast) {
              return this.createTile(this._depth, this._maxDepth, this._geoBounds, this._geoCenter,
                                     this._southWest, this._northWest, this._southEast, newNorthEast,
                                     this._views, this._size);
            } else {
              return this;
            }
          }
        }
      } else {
        // moved from one tile to another
        return this.removed(view, oldBounds).inserted(view, newBounds);
      }
    }
    return this;
  }

  forEach<T, S>(callback: (this: S, view: MapView) => T | void, thisArg: S): T | undefined {
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

  protected createTile(depth: number, maxDepth: number, geoBounds: GeoBox, geoCenter?: GeoPoint,
                       southWest: MapTile | null = null, northWest: MapTile | null = null,
                       southEast: MapTile | null = null, northEast: MapTile | null = null,
                       views: ReadonlyArray<MapView> = [], size: number = 0): MapTile {
    if (geoCenter === void 0) {
      geoCenter = geoBounds.center;
    }
    return new MapTile(depth, maxDepth, geoBounds, geoCenter,
                       southWest, northWest, southEast, northEast, views, size);
  }

  static empty(geoBounds?: GeoBox, depth?: number, maxDepth?: number): MapTile {
    if (geoBounds === void 0) {
      geoBounds = GeoBox.globe();
    }
    if (depth === void 0) {
      depth = 0;
    }
    if (maxDepth === void 0) {
      maxDepth = 10;
    }
    maxDepth = Math.max(depth, maxDepth);
    return new MapTile(depth, maxDepth, geoBounds, geoBounds.center, null, null, null, null, [], 0);
  }
}
