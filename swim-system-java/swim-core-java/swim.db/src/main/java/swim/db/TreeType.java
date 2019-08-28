// Copyright 2015-2019 SWIM.AI inc.
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

package swim.db;

import swim.structure.Value;

public enum TreeType {
  BTREE("btree"),
  QTREE("qtree"),
  STREE("stree"),
  UTREE("utree");

  final String tag;

  TreeType(String tag) {
    this.tag = tag;
  }

  public boolean isBTree() {
    return this == BTREE;
  }

  public boolean isQTree() {
    return this == QTREE;
  }

  public boolean isSTree() {
    return this == STREE;
  }

  public boolean isUTree() {
    return this == UTREE;
  }

  public String tag() {
    return this.tag;
  }

  public PageRef emptyPageRef(PageContext pageContext, int stem, long version) {
    switch (this) {
      case BTREE: return BTreePageRef.empty(pageContext, stem, version);
      case QTREE: return QTreePageRef.empty(pageContext, stem, version);
      case STREE: return STreePageRef.empty(pageContext, stem, version);
      case UTREE: return UTreePageRef.empty(pageContext, stem, version);
      default: throw new UnsupportedOperationException();
    }
  }

  public PageRef pageRefFromValue(PageContext pageContext, int stem, Value value) {
    switch (this) {
      case BTREE: return BTreePageRef.fromValue(pageContext, stem, value);
      case QTREE: return QTreePageRef.fromValue(pageContext, stem, value);
      case STREE: return STreePageRef.fromValue(pageContext, stem, value);
      case UTREE: return UTreePageRef.fromValue(pageContext, stem, value);
      default: throw new UnsupportedOperationException();
    }
  }

  public Tree emptyTree(TreeContext treeContext, int stem, long version,
                        boolean isResident, boolean isTransient) {
    switch (this) {
      case BTREE: return new BTree(treeContext, stem, version, isResident, isTransient);
      case QTREE: return new QTree(treeContext, stem, version, isResident, isTransient);
      case STREE: return new STree(treeContext, stem, version, isResident, isTransient);
      case UTREE: return new UTree(treeContext, stem, version, isResident, isTransient);
      default: throw new UnsupportedOperationException();
    }
  }

  public Tree treeFromSeed(TreeContext treeContext, Seed seed,
                           boolean isResident, boolean isTransient) {
    switch (this) {
      case BTREE: return new BTree(treeContext, seed, isResident, isTransient);
      case QTREE: return new QTree(treeContext, seed, isResident, isTransient);
      case STREE: return new STree(treeContext, seed, isResident, isTransient);
      case UTREE: return new UTree(treeContext, seed, isResident, isTransient);
      default: throw new UnsupportedOperationException();
    }
  }

  public static TreeType fromTag(String tag) {
    if ("btree".equals(tag)) {
      return BTREE;
    } else if ("qtree".equals(tag)) {
      return QTREE;
    } else if ("stree".equals(tag)) {
      return STREE;
    } else if ("utree".equals(tag)) {
      return UTREE;
    } else {
      return null;
    }
  }
}
