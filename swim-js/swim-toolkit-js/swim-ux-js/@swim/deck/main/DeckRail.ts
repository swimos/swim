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

import {Equals, Equivalent, Arrays} from "@swim/util"
import {Debug, Format, Output} from "@swim/codec";
import {AnyLength, Length} from "@swim/math";
import {AnyDeckPost, DeckPost} from "./DeckPost";

export type AnyDeckRail = DeckRail | DeckRailInit;

export interface DeckRailInit {
  width?: AnyLength | null;
  left?: AnyLength | null;
  right?: AnyLength | null;
  spacing?: AnyLength | null;
  posts?: AnyDeckPost[];
}

export class DeckRail implements Equals, Equivalent, Debug {
  constructor(width: Length | null, left: Length | null, right: Length | null,
              spacing: Length | null, posts: ReadonlyArray<DeckPost>) {
    Object.defineProperty(this, "width", {
      value: width,
      enumerable: true,
    });
    Object.defineProperty(this, "left", {
      value: left,
      enumerable: true,
    });
    Object.defineProperty(this, "right", {
      value: right,
      enumerable: true,
    });
    Object.defineProperty(this, "spacing", {
      value: spacing,
      enumerable: true,
    });
    Object.defineProperty(this, "posts", {
      value: posts,
      enumerable: true,
    });
  }

  readonly width!: Length | null;

  readonly left!: Length | null;

  readonly right!: Length | null;

  readonly spacing!: Length | null;

  readonly posts!: ReadonlyArray<DeckPost>;

  lookupPost(key: string): number | undefined {
    const posts = this.posts;
    for (let i = 0, n = posts.length; i < n; i += 1) {
      const post = posts[i]!;
      if (key === post.key) {
        return i;
      }
    }
    return void 0;
  }

  getPost(key: string | number): DeckPost | null {
    const posts = this.posts;
    if (typeof key === "number") {
      const post = posts[key];
      if (post !== void 0) {
        return post;
      }
    } else if (typeof key === "string") {
      for (let i = 0, n = posts.length; i < n; i += 1) {
        const post = posts[i]!;
        if (key === post.key) {
          return post;
        }
      }
    }
    return null;
  }

  resized(width: AnyLength, left?: AnyLength | null, right?: AnyLength | null,
          spacing?: AnyLength | null): DeckRail {
    width = Length.fromAny(width);
    if (left === void 0) {
      left = this.left;
    } else if (left !== null) {
      left = Length.fromAny(left);
    }
    if (right === void 0) {
      right = this.right;
    } else if (right !== null) {
      right = Length.fromAny(right);
    }
    if (spacing === void 0) {
      spacing = this.spacing;
    } else if (spacing !== null) {
      spacing = Length.fromAny(spacing);
    }
    if (Equals(this.width, width) && Equals(this.left, left) &&
        Equals(this.right, right) && Equals(this.spacing, spacing)) {
      return this;
    } else {
      const oldPosts = this.posts;
      const postCount = oldPosts.length;
      const newPosts = new Array<DeckPost>(postCount);
      const railWidth = width.pxValue();
      const railLeft = left !== null ? left.pxValue(railWidth) : 0;
      const railRight = right !== null ? right.pxValue(railWidth) : 0;
      const postSpacing = spacing !== null ? spacing.pxValue(railWidth) : 0;

      let grow = 0;
      let shrink = 0;
      let basis = railLeft + railRight;
      let x = railLeft;
      for (let i = 0; i < postCount; i += 1) {
        if (i !== 0) {
          basis += postSpacing;
          x += postSpacing;
        }
        const post = oldPosts[i]!;
        const postWidth = post.basis.pxValue(railWidth);
        newPosts[i] = post.resized(postWidth, x, railWidth - postWidth - x);
        grow += post.grow;
        shrink += post.shrink;
        basis += postWidth;
        x += postWidth;
      }

      if (basis < railWidth && grow > 0) {
        const delta = railWidth - basis;
        let x = railLeft;
        let j = 0;
        for (let i = 0; i < postCount; i += 1) {
          const post = newPosts[i]!;
          if (j !== 0) {
            basis += postSpacing;
            x += postSpacing;
          }
          const postBasis = post.basis.pxValue(railWidth);
          const postWidth = postBasis + delta * (post.grow / grow);
          newPosts[i] = post.resized(postWidth, x, railWidth - postWidth - x);
          x += postWidth;
          j += 1;
        }
      } else if (basis > railWidth && shrink > 0) {
        const delta = basis - railWidth;
        let x = railLeft;
        let j = 0;
        for (let i = 0; i < postCount; i += 1) {
          const post = newPosts[i]!;
          if (j !== 0) {
            basis += postSpacing;
            x += postSpacing;
          }
          const postBasis = post.basis.pxValue(railWidth);
          const postWidth = postBasis - delta * (post.shrink / shrink);
          newPosts[i] = post.resized(postWidth, x, railWidth - postWidth - x);
          x += postWidth;
          j += 1;
        }
      }

      return new DeckRail(width, left, right, spacing, newPosts);
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof DeckRail) {
      const thesePosts = this.posts;
      const thosePosts = that.posts;
      const n = thesePosts.length;
      if (n === thosePosts.length) {
        for (let i = 0; i < n; i += 1) {
          if (!thesePosts[i]!.equivalentTo(thosePosts[i]!, epsilon)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof DeckRail) {
      return Equals(this.width, that.width) && Equals(this.left, that.left)
          && Equals(this.right, that.right) && Equals(this.spacing, that.spacing)
          && Arrays.equal(this.posts, that.posts);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("DeckRail").write(46/*'.'*/).write("of").write(40/*'('*/)
    for (let i = 0, n = this.posts.length; i < n; i += 1) {
      if (i !== 0) {
        output = output.write(", ");
      }
      output = output.debug(this.posts[i]!);
    }
    output = output.write(41/*')'*/);
    if (this.width !== null || this.left !== null || this.right !== null || this.spacing !== null) {
      output = output.write(46/*'.'*/).write("resized").write(40/*'('*/)
                     .debug(this.width).write(", ").debug(this.left).write(", ")
                     .debug(this.right).write(", ").debug(this.spacing).write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  static of(...deckPosts: AnyDeckPost[]): DeckRail {
    const n = deckPosts.length;
    const posts = new Array<DeckPost>(n);
    for (let i = 0; i < n; i += 1) {
      posts[i] = DeckPost.fromAny(deckPosts[i]!);
    }
    return new DeckRail(null, null, null, null, posts);
  }

  static create(posts: ReadonlyArray<DeckPost>): DeckRail {
    return new DeckRail(null, null, null, null, posts);
  }

  static fromAny(value: AnyDeckRail): DeckRail {
    if (value === void 0 || value === null || value instanceof DeckRail) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return DeckRail.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: DeckRailInit): DeckRail {
    let width = init.width;
    if (width !== void 0 && width !== null) {
      width = Length.fromAny(width);
    } else {
      width = null;
    }
    let left = init.left;
    if (left !== void 0 && left !== null) {
      left = Length.fromAny(left);
    } else {
      left = null;
    }
    let right = init.right;
    if (right !== void 0 && right !== null) {
      right = Length.fromAny(right);
    } else {
      right = null;
    }
    let spacing = init.spacing;
    if (spacing !== void 0 && spacing !== null) {
      spacing = Length.fromAny(spacing);
    } else {
      spacing = null;
    }
    let posts: DeckPost[];
    if (init.posts !== void 0) {
      const n = init.posts.length;
      posts = new Array<DeckPost>(n);
      for (let i = 0; i < n; i += 1) {
        posts[i] = DeckPost.fromAny(init.posts[i]!);
      }
    } else {
      posts = [];
    }
    return new DeckRail(width, left, right, spacing, posts);
  }
}
