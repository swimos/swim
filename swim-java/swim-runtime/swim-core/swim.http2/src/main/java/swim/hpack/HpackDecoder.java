// Copyright 2015-2023 Swim.inc
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

package swim.hpack;

import swim.codec.Decoder;
import swim.codec.InputBuffer;
import swim.collections.FingerTrieSeq;

public class HpackDecoder {

  final HpackTableStatic staticTable;
  final HpackTableBuffer dynamicTable;
  int maxDynamicTableSize;
  int encoderMaxDynamicTableSize;
  boolean maxDynamicTableSizeChanged;

  HpackDecoder(HpackTableStatic staticTable, HpackTableBuffer dynamicTable,
               int maxDynamicTableSize, int encoderMaxDynamicTableSize,
               boolean maxDynamicTableSizeChanged) {
    this.staticTable = staticTable;
    this.dynamicTable = dynamicTable;
    this.maxDynamicTableSize = maxDynamicTableSize;
    this.encoderMaxDynamicTableSize = encoderMaxDynamicTableSize;
    this.maxDynamicTableSizeChanged = maxDynamicTableSizeChanged;
  }

  public HpackDecoder(int capacity) {
    this(HpackTableStatic.standard(), HpackTableBuffer.withCapacity(capacity),
         capacity, capacity, false);
  }

  public HpackDecoder() {
    this(4096);
  }

  public int size() {
    return this.dynamicTable.size();
  }

  public int capacity() {
    return this.dynamicTable.capacity();
  }

  public void setCapacity(int capacity) {
    this.dynamicTable.setCapacity(capacity);
  }

  public int maxDynamicTableSize() {
    return this.maxDynamicTableSize;
  }

  public void setMaxDynamicTableSize(int maxDynamicTableSize) {
    this.maxDynamicTableSize = maxDynamicTableSize;
    if (maxDynamicTableSize < this.encoderMaxDynamicTableSize) {
      this.maxDynamicTableSizeChanged = true;
      this.dynamicTable.setCapacity(maxDynamicTableSize);
    }
  }

  public int length() {
    return this.staticTable.length() + this.dynamicTable.length();
  }

  public HpackHeader get(int index) {
    if (index <= this.staticTable.length()) {
      return this.staticTable.get(index);
    } else if (index - this.staticTable.length() <= this.dynamicTable.length()) {
      return this.dynamicTable.get(index - this.staticTable.length());
    } else {
      return null;
    }
  }

  public Decoder<FingerTrieSeq<HpackHeader>> decodeBlock(InputBuffer input) {
    return HpackBlockDecoder.decode(input, this);
  }

  public Decoder<FingerTrieSeq<HpackHeader>> blockDecoder() {
    return new HpackBlockDecoder(this);
  }

  public Decoder<HpackHeader> decodeHeader(InputBuffer input) {
    return HpackHeaderDecoder.decode(input, this);
  }

  public Decoder<HpackHeader> headerDecoder() {
    return new HpackHeaderDecoder(this);
  }

  @Override
  public HpackDecoder clone() {
    return new HpackDecoder(this.staticTable, this.dynamicTable.clone(),
                            this.maxDynamicTableSize, this.encoderMaxDynamicTableSize,
                            this.maxDynamicTableSizeChanged);
  }

}
