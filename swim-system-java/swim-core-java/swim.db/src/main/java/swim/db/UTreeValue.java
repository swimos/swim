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

import swim.concurrent.Cont;
import swim.concurrent.Conts;
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
    return tree().treeDelegate();
  }

  public void setTreeDelegate(TreeDelegate treeDelegate) {
    tree().setTreeDelegate(treeDelegate);
  }

  public boolean isResident() {
    return tree().isResident();
  }

  public UTreeValue isResident(boolean isResident) {
    do {
      final long newVersion = this.trunk.version();
      final UTree oldTree = tree();
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
    return tree().isTransient();
  }

  public UTreeValue isTransient(boolean isTransient) {
    do {
      final long newVersion = this.trunk.version();
      final UTree oldTree = tree();
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
        return tree().get();
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
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
        final UTree oldTree = tree();
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
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  public void clear() {
    set(Value.extant());
  }

  protected void didFail(StoreException error) {
    System.err.println(error.getMessage());
    error.printStackTrace();
    clear();
  }

  public void loadAsync(Cont<UTreeValue> cont) {
    try {
      final Cont<Tree> andThen = Conts.constant(cont, this);
      tree().loadAsync(andThen);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public UTreeValue load() throws InterruptedException {
    tree().load();
    return this;
  }

  public void commitAsync(Commit commit) {
    try {
      this.trunk.commitAsync(commit);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
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
