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

package swim.streamlet;

import java.util.Iterator;
import swim.collections.HashTrieMap;
import swim.util.Cursor;

public abstract class AbstractMapInoutlet<K, VI, VO, I, O> implements MapInoutlet<K, VI, VO, I, O> {

  protected MapOutlet<K, VI, ? extends I> input;
  protected HashTrieMap<K, KeyEffect> effects;
  protected HashTrieMap<K, KeyOutlet<K, VO>> outlets;
  protected Inlet<? super O>[] outputs;
  protected int version;

  public AbstractMapInoutlet() {
    this.input = null;
    this.effects = HashTrieMap.empty();
    this.outlets = HashTrieMap.empty();
    this.outputs = null;
    this.version = -1;
  }

  @Override
  public abstract boolean containsKey(K key);

  @Override
  public abstract VO get(K key);

  @Override
  public abstract O get();

  @Override
  public abstract Iterator<K> keyIterator();

  @Override
  public MapOutlet<K, VI, ? extends I> input() {
    return this.input;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindInput(Outlet<? extends I> input) {
    if (input instanceof MapOutlet<?, ?, ?>) {
      this.bindInput((MapOutlet<K, VI, ? extends I>) input);
    } else {
      throw new IllegalArgumentException(input.toString());
    }
  }

  public void bindInput(MapOutlet<K, VI, ? extends I> input) {
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
    if (this.outputs == null && this.outlets.isEmpty()) {
      final MapOutlet<K, VI, ? extends I> input = this.input;
      if (input != null) {
        input.unbindOutput(this);
        this.input = null;
        input.disconnectInputs();
      }
    }
  }

  @Override
  public Outlet<VO> outlet(K key) {
    KeyOutlet<K, VO> outlet = this.outlets.get(key);
    if (outlet == null) {
      outlet = new KeyOutlet<K, VO>(this, key);
      this.outlets = this.outlets.updated(key, outlet);
    }
    return outlet;
  }

  @Override
  public Iterator<Inlet<? super O>> outputIterator() {
    return this.outputs != null ? Cursor.array(this.outputs) : Cursor.empty();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindOutput(Inlet<? super O> output) {
    final Inlet<? super O>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    final Inlet<? super O>[] newOutputs = (Inlet<? super O>[]) new Inlet<?>[n + 1];
    if (n > 0) {
      System.arraycopy(oldOutputs, 0, newOutputs, 0, n);
    }
    newOutputs[n] = output;
    this.outputs = newOutputs;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void unbindOutput(Inlet<? super O> output) {
    final Inlet<? super O>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    for (int i = 0; i < n; i += 1) {
      if (oldOutputs[i] == output) {
        if (n > 1) {
          final Inlet<? super O>[] newOutputs = (Inlet<? super O>[]) new Inlet<?>[n - 1];
          System.arraycopy(oldOutputs, 0, newOutputs, 0, i);
          System.arraycopy(oldOutputs, i + 1, newOutputs, i, (n - 1) - i);
          this.outputs = newOutputs;
        } else {
          this.outputs = null;
        }
        break;
      }
    }
  }

  @Override
  public void unbindOutputs() {
    final HashTrieMap<K, KeyOutlet<K, VO>> outlets = this.outlets;
    if (!outlets.isEmpty()) {
      this.outlets = HashTrieMap.empty();
      final Iterator<KeyOutlet<K, VO>> keyOutlets = outlets.valueIterator();
      while (keyOutlets.hasNext()) {
        final KeyOutlet<K, VO> keyOutlet = keyOutlets.next();
        keyOutlet.unbindOutputs();
      }
    }
    final Inlet<? super O>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super O> output = outputs[i];
        output.unbindInput();
      }
    }
  }

  @Override
  public void disconnectOutputs() {
    if (this.input == null) {
      final HashTrieMap<K, KeyOutlet<K, VO>> outlets = this.outlets;
      if (!outlets.isEmpty()) {
        this.outlets = HashTrieMap.empty();
        final Iterator<KeyOutlet<K, VO>> keyOutlets = outlets.valueIterator();
        while (keyOutlets.hasNext()) {
          final KeyOutlet<K, VO> keyOutlet = keyOutlets.next();
          keyOutlet.disconnectOutputs();
        }
      }
      final Inlet<? super O>[] outputs = this.outputs;
      if (outputs != null) {
        this.outputs = null;
        for (int i = 0, n = outputs.length; i < n; i += 1) {
          final Inlet<? super O> output = outputs[i];
          output.unbindInput();
          output.disconnectOutputs();
        }
      }
    }
  }

  @Override
  public void decohereOutputKey(K key, KeyEffect effect) {
    this.decohereKey(key, effect);
  }

  @Override
  public void decohereInputKey(K key, KeyEffect effect) {
    this.decohereKey(key, effect);
  }

  @SuppressWarnings("unchecked")
  public void decohereKey(K key, KeyEffect effect) {
    final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
    if (oldEffects.get(key) != effect) {
      this.willDecohereKey(key, effect);
      this.effects = oldEffects.updated(key, effect);
      this.version = -1;
      this.onDecohereKey(key, effect);
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        final Inlet<?> output = this.outputs[i];
        if (output instanceof MapInlet<?, ?, ?>) {
          ((MapInlet<K, VO, ? super O>) output).decohereOutputKey(key, effect);
        } else {
          output.decohereOutput();
        }
      }
      final KeyOutlet<K, VO> outlet = this.outlets.get(key);
      if (outlet != null) {
        outlet.decohereInput();
      }
      this.didDecohereKey(key, effect);
    }
  }

  @Override
  public void decohereOutput() {
    this.decohere();
  }

  @Override
  public void decohereInput() {
    this.decohere();
  }

  public void decohere() {
    if (this.version >= 0) {
      this.willDecohere();
      this.version = -1;
      this.onDecohere();
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].decohereOutput();
      }
      final Iterator<KeyOutlet<K, VO>> outlets = this.outlets.valueIterator();
      while (outlets.hasNext()) {
        outlets.next().decohereInput();
      }
      this.didDecohere();
    }
  }

  @Override
  public void recohereOutputKey(K key, int version) {
    this.recohereKey(key, version);
  }

  @Override
  public void recohereInputKey(K key, int version) {
    this.recohereKey(key, version);
  }

  @SuppressWarnings("unchecked")
  public void recohereKey(K key, int version) {
    if (this.version < 0) {
      final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
      final KeyEffect effect = oldEffects.get(key);
      if (effect != null) {
        this.willRecohereKey(key, effect, version);
        this.effects = oldEffects.removed(key);
        if (this.input != null) {
          this.input.recohereInputKey(key, version);
        }
        this.onRecohereKey(key, effect, version);
        for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
          final Inlet<?> output = this.outputs[i];
          if (output instanceof MapInlet<?, ?, ?>) {
            ((MapInlet<K, VO, ? super O>) output).recohereOutputKey(key, version);
          }
        }
        final KeyOutlet<K, VO> outlet = this.outlets.get(key);
        if (outlet != null) {
          outlet.recohereInput(version);
        }
        this.didRecohereKey(key, effect, version);
      }
    }
  }

  @Override
  public void recohereOutput(int version) {
    this.recohere(version);
  }

  @Override
  public void recohereInput(int version) {
    this.recohere(version);
  }

  public void recohere(int version) {
    if (this.version < 0) {
      this.willRecohere(version);
      final Iterator<K> keys = this.effects.keyIterator();
      while (keys.hasNext()) {
        this.recohereKey(keys.next(), version);
      }
      this.version = version;
      this.onRecohere(version);
      for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
        this.outputs[i].recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected void willDecohereKey(K key, KeyEffect effect) {
    // hook
  }

  protected void onDecohereKey(K key, KeyEffect effect) {
    // hook
  }

  protected void didDecohereKey(K key, KeyEffect effect) {
    // hook
  }

  protected void willDecohere() {
    // hook
  }

  protected void onDecohere() {
    // hook
  }

  protected void didDecohere() {
    // hook
  }

  protected void willRecohereKey(K key, KeyEffect effect, int version) {
    // hook
  }

  protected void onRecohereKey(K key, KeyEffect effect, int version) {
    // hook
  }

  protected void didRecohereKey(K key, KeyEffect effect, int version) {
    // hook
  }

  protected void willRecohere(int version) {
    // hook
  }

  protected void onRecohere(int version) {
    // hook
  }

  protected void didRecohere(int version) {
    // hook
  }

}
