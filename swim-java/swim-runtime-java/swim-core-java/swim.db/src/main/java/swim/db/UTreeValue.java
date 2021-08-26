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

package swim.db;

import swim.concurrent.Cont;
import swim.structure.Value;

public class UTreeValue {

  final Trunk<UTree> trunk;

  public UTreeValue(Trunk<UTree> trunk) {
    this.trunk = trunk;
  }

  public final Trunk<UTree> trunk() {
    return this.trunk;
  }

  public final StoreSettings settings() {
    return this.trunk.settings();
  }

  public final Database database() {
    return this.trunk.database;
  }

  public final Value name() {
    return this.trunk.name;
  }

  public final UTree tree() {
    return this.trunk.tree;
  }

  public final TreeDelegate treeDelegate() {
    return this.tree().treeDelegate();
  }

  public void setTreeDelegate(TreeDelegate treeDelegate) {
    this.tree().setTreeDelegate(treeDelegate);
  }

  public boolean isResident() {
    return this.tree().isResident();
  }

  public UTreeValue isResident(boolean isResident) {
    do {
      final long newVersion = this.trunk.version();
      final UTree oldTree = this.tree();
      final UTree newTree = oldTree.isResident(isResident);
      if (oldTree != newTree) {
        if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return this;
  }

  public boolean isTransient() {
    return this.tree().isTransient();
  }

  public UTreeValue isTransient(boolean isTransient) {
    do {
      final long newVersion = this.trunk.version();
      final UTree oldTree = this.tree();
      final UTree newTree = oldTree.isTransient(isTransient);
      if (oldTree != newTree) {
        if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return this;
  }

  public Value get() {
    int retries = 0;
    do {
      try {
        return this.tree().get();
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  public Value set(Value newValue) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final UTree oldTree = this.tree();
        final UTree newTree = oldTree.updated(newValue, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final Value oldValue = oldTree.get();
            final TreeContext treeContext = newTree.treeContext();
            treeContext.utreeDidUpdate(newTree, oldTree, newValue, oldValue);
            treeContext.treeDidChange(newTree, oldTree);
            return oldValue;
          }
        } else {
          return oldTree.get();
        }
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  public void clear() {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      try {
        final UTree oldTree = this.tree();
        final UTree newTree = oldTree.cleared(newVersion);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            treeContext.treeDidClear(newTree, oldTree);
            treeContext.treeDidChange(newTree, oldTree);
            return;
          }
        } else {
          return;
        }
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else {
          throw error;
        }
      }
    } while (true);
  }

  protected void didFail(StoreException error) {
    System.err.println(error.getMessage());
    error.printStackTrace();
    this.clear();
  }

  public void loadAsync(Cont<UTreeValue> cont) {
    try {
      final Cont<Tree> andThen = Cont.constant(cont, this);
      this.tree().loadAsync(andThen);
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public UTreeValue load() throws InterruptedException {
    this.tree().load();
    return this;
  }

  public void commitAsync(Commit commit) {
    try {
      this.trunk.commitAsync(commit);
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        commit.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public Chunk commit(Commit commit) throws InterruptedException {
    return this.trunk.commit(commit);
  }

}
