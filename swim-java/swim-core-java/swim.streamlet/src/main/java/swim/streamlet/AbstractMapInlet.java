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

package swim.streamlet;

import java.util.Iterator;
import swim.collections.HashTrieMap;

public abstract class AbstractMapInlet<K, V, O> implements MapInlet<K, V, O> {
  protected MapOutlet<K, V, ? extends O> input;
  protected HashTrieMap<K, KeyEffect> effects;
  protected int version;

  public AbstractMapInlet() {
    this.input = null;
    this.effects = HashTrieMap.empty();
    this.version = -1;
  }

  @Override
  public MapOutlet<K, V, ? extends O> input() {
    return this.input;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindInput(Outlet<? extends O> input) {
    if (input instanceof MapOutlet<?, ?, ?>) {
      bindInput((MapOutlet<K, V, ? extends O>) input);
    } else {
      throw new IllegalArgumentException(input.toString());
    }
  }

  public void bindInput(MapOutlet<K, V, ? extends O> input) {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = input;
    if (this.input != null) {
      this.input.bindOutput(this);
    }
  }

  @Override
  public void unbindInput() {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = null;
  }

  @Override
  public void disconnectInputs() {
    final MapOutlet<K, V, ? extends O> input = this.input;
    if (input != null) {
      input.unbindOutput(this);
      this.input = null;
      input.disconnectInputs();
    }
  }

  @Override
  public void disconnectOutputs() {
    // nop
  }

  @Override
  public void invalidateOutputKey(K key, KeyEffect effect) {
    final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
    if (oldEffects.get(key) != effect) {
      willInvalidateOutputKey(key, effect);
      this.effects = oldEffects.updated(key, effect);
      this.version = -1;
      onInvalidateOutputKey(key, effect);
      didInvalidateOutputKey(key, effect);
    }
  }

  @Override
  public void invalidateOutput() {
    if (this.version >= 0) {
      willInvalidateOutput();
      this.version = -1;
      onInvalidateOutput();
      didInvalidateOutput();
    }
  }

  @Override
  public void reconcileOutputKey(K key, int version) {
    if (this.version < 0) {
      final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
      final KeyEffect effect = oldEffects.get(key);
      if (effect != null) {
        willReconcileOutputKey(key, effect, version);
        this.effects = oldEffects.removed(key);
        if (this.input != null) {
          this.input.reconcileInputKey(key, version);
        }
        onReconcileOutputKey(key, effect, version);
        didReconcileOutputKey(key, effect, version);
      }
    }
  }

  @Override
  public void reconcileOutput(int version) {
    if (this.version < 0) {
      willReconcileOutput(version);
      final Iterator<K> keys = this.effects.keyIterator();
      while (keys.hasNext()) {
        reconcileOutputKey(keys.next(), version);
      }
      this.version = version;
      onReconcileOutput(version);
      didReconcileOutput(version);
    }
  }

  protected void willInvalidateOutputKey(K key, KeyEffect effect) {
    // stub
  }

  protected void onInvalidateOutputKey(K key, KeyEffect effect) {
    // stub
  }

  protected void didInvalidateOutputKey(K key, KeyEffect effect) {
    // stub
  }

  protected void willInvalidateOutput() {
    // stub
  }

  protected void onInvalidateOutput() {
    // stub
  }

  protected void didInvalidateOutput() {
    // stub
  }

  protected void willReconcileOutputKey(K key, KeyEffect effect, int version) {
    // stub
  }

  protected void onReconcileOutputKey(K key, KeyEffect effect, int version) {
    // stub
  }

  protected void didReconcileOutputKey(K key, KeyEffect effect, int version) {
    // stub
  }

  protected void willReconcileOutput(int version) {
    // stub
  }

  protected void onReconcileOutput(int version) {
    // stub
  }

  protected void didReconcileOutput(int version) {
    // stub
  }
}
