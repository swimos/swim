// Copyright 2015-2022 Swim.inc
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
      this.bindInput((MapOutlet<K, V, ? extends O>) input);
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
  public void decohereOutputKey(K key, KeyEffect effect) {
    final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
    if (oldEffects.get(key) != effect) {
      this.willDecohereOutputKey(key, effect);
      this.effects = oldEffects.updated(key, effect);
      this.version = -1;
      this.onDecohereOutputKey(key, effect);
      this.didDecohereOutputKey(key, effect);
    }
  }

  @Override
  public void decohereOutput() {
    if (this.version >= 0) {
      this.willDecohereOutput();
      this.version = -1;
      this.onDecohereOutput();
      this.didDecohereOutput();
    }
  }

  @Override
  public void recohereOutputKey(K key, int version) {
    if (this.version < 0) {
      final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
      final KeyEffect effect = oldEffects.get(key);
      if (effect != null) {
        this.willRecohereOutputKey(key, effect, version);
        this.effects = oldEffects.removed(key);
        if (this.input != null) {
          this.input.recohereInputKey(key, version);
        }
        this.onRecohereOutputKey(key, effect, version);
        this.didRecohereOutputKey(key, effect, version);
      }
    }
  }

  @Override
  public void recohereOutput(int version) {
    if (this.version < 0) {
      this.willRecohereOutput(version);
      final Iterator<K> keys = this.effects.keyIterator();
      while (keys.hasNext()) {
        this.recohereOutputKey(keys.next(), version);
      }
      this.version = version;
      this.onRecohereOutput(version);
      this.didRecohereOutput(version);
    }
  }

  protected void willDecohereOutputKey(K key, KeyEffect effect) {
    // hook
  }

  protected void onDecohereOutputKey(K key, KeyEffect effect) {
    // hook
  }

  protected void didDecohereOutputKey(K key, KeyEffect effect) {
    // hook
  }

  protected void willDecohereOutput() {
    // hook
  }

  protected void onDecohereOutput() {
    // hook
  }

  protected void didDecohereOutput() {
    // hook
  }

  protected void willRecohereOutputKey(K key, KeyEffect effect, int version) {
    // hook
  }

  protected void onRecohereOutputKey(K key, KeyEffect effect, int version) {
    // hook
  }

  protected void didRecohereOutputKey(K key, KeyEffect effect, int version) {
    // hook
  }

  protected void willRecohereOutput(int version) {
    // hook
  }

  protected void onRecohereOutput(int version) {
    // hook
  }

  protected void didRecohereOutput(int version) {
    // hook
  }

}
